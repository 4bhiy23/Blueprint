"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";
import { TopNav } from "./TopNav";
import { ComponentLibrary } from "./ComponentLibrary";
import { BuilderCanvas } from "./BuilderCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import {
  type BuilderNode,
  type QuestionNodeData,
  type QuestionType,
  type QuestionOption,
  QUESTION_TYPE_META,
  INITIAL_NODES,
  INITIAL_EDGES,
  CANVAS_DROP_ZONE_ID,
  generateId,
} from "./types";

/* ─── Drag overlay preview card ─────────────────────────────────────────── */
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

/* ─── Inner builder — needs ReactFlowProvider ───────────────────────────── */
function FormBuilderInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<BuilderNode>(
    INITIAL_NODES as BuilderNode[]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<QuestionType | null>(null);

  const rfInstance = useReactFlow();

  // Track pointer position for accurate drop coords
  const pointerRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

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
          id: generateId(),
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
          formTitle={formTitle}
          onFormTitleChange={(t) => {
            setFormTitle(t);
            toast.success("Title updated");
          }}
        />

        {/* Three-panel body */}
        <main className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <ComponentLibrary />

          {/* Canvas */}
          <BuilderCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeSelect={handleNodeSelect}
            onAddNode={handleAddNode}
          />

          {/* Right sidebar */}
          <PropertiesPanel
            selectedNodeData={selectedNodeData}
            formTitle={formTitle}
            formDescription={formDescription}
            onFormTitleChange={setFormTitle}
            onFormDescriptionChange={setFormDescription}
            onQuestionDataChange={handleQuestionDataChange}
            onOptionsReorder={handleOptionsReorder}
          />
        </main>
      </div>

      {/* Drag overlay — floating preview while dragging */}
      <DragOverlay dropAnimation={null}>
        {draggedType && <DragPreviewCard questionType={draggedType} />}
      </DragOverlay>
    </DndContext>
  );
}

/* ─── Public entry point — wraps in ReactFlowProvider ──────────────────── */
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
