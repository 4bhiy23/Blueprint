"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import { Toaster, toast } from "sonner";
import { GripVertical, Loader2 } from "lucide-react";
import { TopNav } from "./TopNav";
import { ComponentLibrary } from "./ComponentLibrary";
import { BuilderCanvas } from "./BuilderCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { type BuilderData } from "@/features/forms/api";
import { useBuilderQuery, useFormMutations, useFormQuery } from "@/features/forms/queries";
import type { FormRecord } from "@/lib/forms";
import {
  type BuilderNode,
  type BuilderEdge,
  type QuestionNodeData,
  type QuestionType,
  type QuestionOption,
  QUESTION_TYPE_META,
  CANVAS_DROP_ZONE_ID,
  START_NODE_ID,
  SUBMIT_NODE_ID,
} from "./types";
import { serializeBuilder } from "./builder-serialization";

// ─── Safe UUID generator ───────────────────────────────────────────────────
function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Drag overlay preview card ───────────────────────────────────────────
function DragPreviewCard({ questionType }: { questionType: QuestionType }) {
  const meta = QUESTION_TYPE_META[questionType];
  const { Icon } = meta;
  return (
    <div className="flex w-52 items-center gap-3 rounded-xl border border-primary/40 bg-card px-3.5 py-3 shadow-2xl shadow-black/60 ring-2 ring-primary/20 opacity-95 rotate-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{meta.label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {meta.description}
        </p>
      </div>
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
    </div>
  );
}

// ─── Inner builder — needs ReactFlowProvider ─────────────────────────────
function FormBuilderInner() {
  const params = useParams();
  const formId = (params?.formId || params?.id) as string;

  const [nodes, setNodes, onNodesChange] = useNodesState<BuilderNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<BuilderEdge>([]);

  const [form, setForm] = useState<FormRecord | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<QuestionType | null>(null);
  const isReadOnly = form?.status === "published";
  const formQuery = useFormQuery(formId);
  const builderQuery = useBuilderQuery(formId);
  const { saveBuilder, update } = useFormMutations();

  const rfInstance = useReactFlow();
  const isInitialMountRef = useRef(true);
  const hasHydratedBuilderRef = useRef(false);

  // Track pointer position for accurate drop coords
  const pointerRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // 1. Hydrate React Flow state from the cached form and builder queries.
  useEffect(() => {
    const formDetails = formQuery.data;
    const builderData = builderQuery.data;
    if (!formDetails || !builderData) return;

    setForm(formDetails.form);
    if (hasHydratedBuilderRef.current) return;

    // Convert backend builder schema to frontend React Flow nodes and edges
    const backendNodes = builderData.nodes || [];
    const backendEdges = builderData.edges || [];

    // Map backend nodes to frontend representation
    const questionNodes: BuilderNode[] = backendNodes.map((n) => ({
          id: n.id,
          type: "question",
          position: n.position,
          data: {
            questionType: n.type,
            title: n.data.title,
            description: n.data.description,
            required: n.data.required,
            options: n.data.options,
            ratingMax: n.data.ratingMax ?? 5,
            ratingLowLabel: n.data.ratingLowLabel ?? "",
            ratingHighLabel: n.data.ratingHighLabel ?? "",
          },
    }));

    const incomingMap = new Set(backendEdges.map((edge) => edge.target));
    const outgoingMap = new Set(backendEdges.map((edge) => edge.source));
    const firstQuestionNode = backendNodes.find((node) => !incomingMap.has(node.id));
    const lastQuestionNode = backendNodes.find((node) => !outgoingMap.has(node.id));

        // Position virtual nodes above and below the form's linear flow.
    const startPosition = firstQuestionNode
      ? { x: firstQuestionNode.position.x + 64, y: firstQuestionNode.position.y - 110 }
      : { x: 320, y: 80 };
    const submitPosition = lastQuestionNode
      ? { x: lastQuestionNode.position.x + 64, y: lastQuestionNode.position.y + 180 }
      : { x: 320, y: 520 };

        // Add virtual start/submit nodes
    const finalNodes: BuilderNode[] = [
          {
            id: START_NODE_ID,
            type: "start",
            position: startPosition,
            data: { label: "Start" },
            deletable: false,
            draggable: true,
          },
          ...questionNodes,
          {
            id: SUBMIT_NODE_ID,
            type: "submit",
            position: submitPosition,
            data: { label: "Submit" },
            deletable: false,
            draggable: true,
          },
    ];

        // Construct frontend React Flow edges (backend edges + virtual start/submit edges)
    const finalEdges: BuilderEdge[] = backendEdges.map((e) => ({
          id: `edge_${e.source}_to_${e.target}`,
          source: e.source,
          target: e.target,
          type: "deletable",
    }));

        // Link virtual start/submit nodes to the linear flow.
    if (firstQuestionNode) {
      finalEdges.push({
        id: `edge_start_to_${firstQuestionNode.id}`,
        source: START_NODE_ID,
        target: firstQuestionNode.id,
        type: "deletable",
      });
    }

    if (lastQuestionNode) {
      finalEdges.push({
        id: `edge_${lastQuestionNode.id}_to_submit`,
        source: lastQuestionNode.id,
        target: SUBMIT_NODE_ID,
        type: "deletable",
      });
    }

    hasHydratedBuilderRef.current = true;
    isInitialMountRef.current = true;
    setNodes(finalNodes);
    setEdges(finalEdges);
    setIsLoaded(true);
  }, [builderQuery.data, formQuery.data, setEdges, setNodes]);

  useEffect(() => {
    if (formQuery.error || builderQuery.error) {
      toast.error("Unable to load the form builder.");
    }
  }, [builderQuery.error, formQuery.error]);

  const serializeToBackend = useCallback((currentNodes: BuilderNode[], currentEdges: BuilderEdge[]): BuilderData => {
    return serializeBuilder(currentNodes, currentEdges, rfInstance.getViewport());
  }, [rfInstance]);

  // 2. Debounced API Autosave Graph
  const debouncedSaveGraph = useDebouncedCallback(
    async (currentNodes: BuilderNode[], currentEdges: BuilderEdge[]) => {
      if (isReadOnly) return;

      try {
        const payload = serializeToBackend(currentNodes, currentEdges);
        await saveBuilder.mutateAsync({ formId, builder: payload });
        setSaveStatus("saved");
      } catch (error) {
        console.error("Autosave failed:", error);
        setSaveStatus("error");
      }
    },
    1000
  );

  // Trigger save whenever nodes or edges change (skip initial load)
  useEffect(() => {
    if (!isLoaded) return;

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    setSaveStatus("saving");
    debouncedSaveGraph(nodes, edges);
  }, [nodes, edges, isLoaded, isReadOnly, debouncedSaveGraph]);

  // 3. Debounced API Rename Form
  const debouncedRenameForm = useDebouncedCallback(async (newTitle: string) => {
    if (isReadOnly) return;

    try {
      await update.mutateAsync({ formId, title: newTitle });
      setSaveStatus("saved");
    } catch (error) {
      console.error("Rename failed:", error);
      setSaveStatus("error");
      toast.error("Unable to save form title.");
    }
  }, 1000);

  const handleFormTitleChange = (newTitle: string) => {
    if (!form || isReadOnly) return;
    setSaveStatus("saving");
    setForm((f) => (f ? { ...f, title: newTitle } : f));
    debouncedRenameForm(newTitle);
  };

  const handleFormDescriptionChange = async (newDescription: string) => {
    if (!form || isReadOnly) return;
    setSaveStatus("saving");
    setForm((f) => (f ? { ...f, description: newDescription } : f));

    try {
      await update.mutateAsync({ formId, description: newDescription });
      setSaveStatus("saved");
    } catch (error) {
      console.error("Description update failed:", error);
      setSaveStatus("error");
    }
  };

  /* ── DnD sensors ─────────────────────────────────────────────── */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  /* ── Drag handlers ───────────────────────────────────────────── */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const type = event.active.data.current?.questionType as QuestionType;
    if (type) setDraggedType(type);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setDraggedType(null);

      const questionType = active.data.current?.questionType as
        | QuestionType
        | undefined;

      // ── Dropped on canvas ──────────────────────────────────────
      if (over?.id === CANVAS_DROP_ZONE_ID && questionType) {
        const position = rfInstance.screenToFlowPosition(pointerRef.current);

        const newNode: BuilderNode = {
          id: generateUUID(),
          type: "question",
          position: {
            x: position.x - 128, // centre the 256px-wide card
            y: position.y - 60,
          },
          data: {
            questionType,
            title: "",
            description: "",
            required: false,
            options: [],
            ratingMax: 5,
            ratingLowLabel: "",
            ratingHighLabel: "",
          } satisfies QuestionNodeData,
        } as BuilderNode;

        setNodes((nds) => [...nds, newNode]);
        setSelectedNodeId(newNode.id);

        toast.success(`${QUESTION_TYPE_META[questionType].label} added`, {
          description: "Edit it in the properties panel.",
          duration: 2000,
        });
        return;
      }

      // ── Reordering options inside PropertiesPanel (sortable) ───
      if (
        active.id !== over?.id &&
        !String(active.id).startsWith("sidebar-")
      ) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== selectedNodeId || node.type !== "question") {
              return node;
            }
            const data = node.data as QuestionNodeData;
            const oldIdx = data.options.findIndex((o) => o.id === active.id);
            const newIdx = data.options.findIndex((o) => o.id === over?.id);
            if (oldIdx === -1 || newIdx === -1) return node;
            return {
              ...node,
              data: {
                ...data,
                options: arrayMove(data.options, oldIdx, newIdx),
              },
            };
          })
        );
      }
    },
    [rfInstance, setNodes, selectedNodeId]
  );

  /* ── Node selection / deselection ───────────────────────────── */
  const handleNodeSelect = useCallback(
    (nodeId: string | null, _data: QuestionNodeData | null) => {
      setSelectedNodeId(nodeId);
      // Keep RF node visually selected
      setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: n.id === nodeId }))
      );
    },
    [setNodes]
  );

  /* ── Derive selected node data ───────────────────────────────── */
  const selectedNodeData = (() => {
    if (!selectedNodeId) return null;
    const node = nodes.find(
      (n) => n.id === selectedNodeId && n.type === "question"
    );
    return node ? (node.data as QuestionNodeData) : null;
  })();

  /* ── Question data changes ───────────────────────────────────── */
  const handleQuestionDataChange = useCallback(
    (patch: Partial<QuestionNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== selectedNodeId || node.type !== "question") {
            return node;
          }
          return {
            ...node,
            data: { ...(node.data as QuestionNodeData), ...patch },
          };
        })
      );
    },
    [selectedNodeId, setNodes]
  );

  const handleOptionsReorder = useCallback(
    (options: QuestionOption[]) => {
      handleQuestionDataChange({ options });
    },
    [handleQuestionDataChange]
  );

  /* ── Add node (from canvas drop) ─────────────────────────────── */
  const handleAddNode = useCallback(
    (node: BuilderNode) => {
      setNodes((nds) => [...nds, node]);
    },
    [setNodes]
  );

  if (formQuery.isLoading || builderQuery.isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground mt-3 font-medium">Loading form builder...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-xl font-bold text-foreground mb-1">Form Not Found</h2>
        <p className="text-sm text-muted-foreground">The builder was unable to load because this form could not be found.</p>
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        {/* Top navigation */}
        <TopNav
          formId={form.id}
          formTitle={form.title}
          publicId={form.publicId}
          status={form.status}
          onFormTitleChange={handleFormTitleChange}
          onStatusChange={(status) => setForm((f) => (f ? { ...f, status } : f))}
          saveStatus={saveStatus}
          onSaveStatusChange={setSaveStatus}
          readOnly={isReadOnly}
        />

        {/* Three-panel body */}
        <main className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          {isReadOnly ? (
            <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Published form</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Close responses to edit questions and settings.
              </p>
            </aside>
          ) : (
            <ComponentLibrary />
          )}

          {/* Canvas */}
          <BuilderCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeSelect={handleNodeSelect}
            onAddNode={handleAddNode}
            readOnly={isReadOnly}
          />

          {/* Right sidebar */}
          <div className={isReadOnly ? "pointer-events-none opacity-55" : undefined}>
            <PropertiesPanel
              selectedNodeData={selectedNodeData}
              formTitle={form.title}
              formDescription={form.description || ""}
              onFormTitleChange={handleFormTitleChange}
              onFormDescriptionChange={handleFormDescriptionChange}
              onQuestionDataChange={handleQuestionDataChange}
              onOptionsReorder={handleOptionsReorder}
            />
          </div>
        </main>
      </div>

      {/* Drag overlay — floating preview while dragging */}
      <DragOverlay dropAnimation={null}>
        {draggedType && <DragPreviewCard questionType={draggedType} />}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Public entry point — wraps in ReactFlowProvider ────────────────────
export function FormBuilder() {
  return (
    <>
      <ReactFlowProvider>
        <FormBuilderInner />
      </ReactFlowProvider>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "border border-border bg-card text-foreground shadow-xl rounded-lg",
            title: "text-sm font-medium",
            description: "text-xs text-muted-foreground",
          },
        }}
      />
    </>
  );
}
