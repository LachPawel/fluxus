import { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ConnectionLineType,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodePalette } from '@/components/node-palette';
import { NodeEditor } from '@/components/node-editor';
import { createNodeTypes } from '@/components/flow-node';
import {
  getNodeDef,
  createNodeData,
  type FlowNodeData,
  type FlowNode,
} from '@/lib/nodes';
import { initialNodes, initialEdges } from '@/lib/initial-data';
import { getMiniMapNodeColor } from '@/utils/flow-utils';

// =============================================================================
// Flow Canvas Component
// =============================================================================

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Memoize node types
  const nodeTypes = useMemo(() => createNodeTypes(), []);

  // Get selected node
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  // ==========================================================================
  // Node/Edge Change Handlers
  // ==========================================================================

  const onNodesChange: OnNodesChange<FlowNode> = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange: OnEdgesChange<Edge> = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect: OnConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  // ==========================================================================
  // Selection Handlers
  // ==========================================================================

  const onNodeClick: NodeMouseHandler<FlowNode> = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // ==========================================================================
  // Drag & Drop Handlers
  // ==========================================================================

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      const nodeDef = getNodeDef(nodeType);
      if (!nodeDef) return;

      // Get the position relative to the ReactFlow canvas
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 25,
      };

      const nodeData = createNodeData(nodeType);
      if (!nodeData) return;

      const newNode: FlowNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: nodeData,
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNode.id);
    },
    []
  );

  // ==========================================================================
  // Node Update/Delete Handlers
  // ==========================================================================

  const onNodeUpdate = useCallback((id: string, data: Partial<FlowNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  }, []);

  const onNodeDelete = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNodeId(null);
  }, []);

  const onEditorClose = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="flex w-screen h-screen bg-slate-50 overflow-hidden">
      {/* Node Palette - Left Sidebar */}
      <NodePalette />

      {/* Flow Canvas - Center */}
      <div ref={reactFlowWrapper} className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
          defaultEdgeOptions={{
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            type: 'smoothstep',
          }}
          connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#cbd5e1"
          />
          <Controls 
            className="bg-white border border-slate-200 rounded-lg shadow-md p-1"
            style={{}} // Override default styles if necessary by passing empty object or specific overrides
          />
          <MiniMap
            nodeColor={getMiniMapNodeColor}
            maskColor="rgba(248, 250, 252, 0.8)"
            className="bg-white border border-slate-200 rounded-lg shadow-md"
            style={{}}
          />
        </ReactFlow>
      </div>

      {/* Node Editor - Right Sidebar */}
      {selectedNode ? (
        <NodeEditor
          nodeId={selectedNode.id}
          nodeType={selectedNode.data.type}
          data={selectedNode.data}
          onUpdate={onNodeUpdate}
          onDelete={onNodeDelete}
          onClose={onEditorClose}
        />
      ) : (
        <div className="w-[340px] flex flex-col items-center justify-center p-8 bg-white border-l border-slate-200">
          <div className="text-center">
            <div className="w-[72px] h-[72px] flex items-center justify-center mx-auto mb-5 bg-blue-50 rounded-full">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-8 h-8 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-slate-700">Select a node to edit</p>
            <p className="text-sm mt-2 leading-relaxed text-slate-500">
              or drag a node from the palette
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
