"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useReactFlow,
  type OnConnect,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { useDroppable } from "@dnd-kit/core";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { QuestionNode } from "./nodes/QuestionNode";
import { StartNode } from "./nodes/StartNode";
import { SubmitNode } from "./nodes/SubmitNode";
import { DeletableEdge } from "./edges/DeletableEdge";
import {
  type BuilderNode,
  type BuilderEdge,
  type QuestionNodeData,
  CANVAS_DROP_ZONE_ID,
  START_NODE_ID,
  SUBMIT_NODE_ID,
} from "./types";

/* ─── Custom node & edge type maps ─────────────────────────────────────── */
const nodeTypes: NodeTypes = {
  // Cast through unknown because @xyflow/react's internal NodeTypes expects
  // NodeProps<Node<Record<string,unknown>>> but our custom nodes use the
  // concrete Node subtypes — functionally equivalent at runtime.
  question: QuestionNode as unknown as NodeTypes[string],
  start: StartNode as unknown as NodeTypes[string],
  submit: SubmitNode as unknown as NodeTypes[string],
};

const edgeTypes: EdgeTypes = {
  deletable: DeletableEdge,
};

const defaultEdgeOptions = {
  type: "deletable",
  animated: false,
};

/* ─── Minimap node colour ────────────────────────────────────────────────── */
function minimapNodeColor(node: Node) {
  switch (node.type) {
    case "start":
      return "rgba(16,185,129,0.6)";
    case "submit":
      return "rgba(59,130,246,0.6)";
    default:
      return "rgba(99,102,241,0.5)";
  }
}

/* ─── BuilderCanvas ─────────────────────────────────────────────────────── */
export interface BuilderCanvasProps {
  nodes: BuilderNode[];
  edges: BuilderEdge[];
  onNodesChange: OnNodesChange<BuilderNode>;
  onEdgesChange: OnEdgesChange<BuilderEdge>;
  onNodeSelect: (nodeId: string | null, data: QuestionNodeData | null) => void;
  onAddNode: (node: BuilderNode) => void;
  readOnly?: boolean;
}

export function BuilderCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  readOnly = false,
}: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: CANVAS_DROP_ZONE_ID,
  });

  const { setEdges } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge({ ...connection, type: "deletable" }, eds));
    },
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "question") {
        onNodeSelect(node.id, node.data as QuestionNodeData);
      } else {
        onNodeSelect(null, null);
      }
    },
    [onNodeSelect]
  );

  const handlePaneClick = useCallback(() => {
    onNodeSelect(null, null);
  }, [onNodeSelect]);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex-1 transition-all duration-200",
        isOver && "ring-2 ring-inset ring-primary/30",
        readOnly && "[&_.react-flow__node]:pointer-events-none",
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode={readOnly ? null : ["Backspace", "Delete"]}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        nodesFocusable={!readOnly}
        elementsSelectable={!readOnly}
        panOnDrag
        isValidConnection={(connection) => {
          if (
            connection.source === SUBMIT_NODE_ID ||
            connection.target === START_NODE_ID
          ) {
            return false;
          }
          return true;
        }}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={proOptions}
        className="bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(222 25% 18%)"
        />
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="mb-4 ml-4"
        />
        <MiniMap
          position="bottom-right"
          nodeColor={minimapNodeColor}
          maskColor="rgba(7,8,14,0.85)"
          className="mb-4 mr-4 border-border! rounded-lg! overflow-hidden"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Drop overlay hint */}
      {isOver && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 px-8 py-4">
            <p className="text-sm font-medium text-primary">
              Release to add question
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
