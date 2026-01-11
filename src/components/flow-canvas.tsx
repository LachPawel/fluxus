import { useState, useCallback, useRef, useMemo, type ComponentType } from 'react';
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
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodePalette } from '@/components/node-palette';
import { NodeEditor } from '@/components/node-editor';
import { FlowNode } from '@/components/flow-node';
import {
  getNodeDef,
  createNodeData,
  getAllNodes,
  type FlowNodeData,
  type FlowNode as FlowNodeType,
} from '@/lib/nodes';
import { initialNodes, initialEdges } from '@/lib/initial-data';
import { getMiniMapNodeColor } from '@/utils/flow-utils';
import { useFlowTheme } from '@/hooks/use-flow-theme';
import { SelectNodeIcon } from '@/components/icons/select-node-icon';

// =============================================================================
// Flow Canvas Component
// =============================================================================

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<FlowNodeType[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Theme
  const theme = useFlowTheme();

  // Memoize node types
  const nodeTypes = useMemo(() => {
    const types: Record<string, ComponentType<NodeProps<FlowNodeType>>> = {};
    for (const node of getAllNodes()) {
      types[node.type] = FlowNode;
    }
    return types;
  }, []);

  // Get selected node
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId],
  );

  // ==========================================================================
  // Node/Edge Change Handlers
  // ==========================================================================

  const onNodesChange: OnNodesChange<FlowNodeType> = useCallback((changes) => {
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

  const onNodeClick: NodeMouseHandler<FlowNodeType> = useCallback((_, node) => {
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

  const onDrop = useCallback((event: React.DragEvent) => {
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

    const newNode: FlowNodeType = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: nodeData,
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(newNode.id);
  }, []);

  // ==========================================================================
  // Node Update/Delete Handlers
  // ==========================================================================

  const onNodeUpdate = useCallback((id: string, data: Partial<FlowNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...data } } : node)),
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
            style: theme.defaultEdgeOptions.style,
            type: 'smoothstep',
          }}
          connectionLineStyle={theme.connectionLineStyle}
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={theme.background.color}
          />
          <Controls
            className="bg-white border border-slate-200 rounded-lg shadow-md p-1"
            style={{}} // Override default styles if necessary by passing empty object or specific overrides
          />
          <MiniMap
            nodeColor={getMiniMapNodeColor}
            maskColor={theme.minimap.maskColor}
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
              <SelectNodeIcon className="w-8 h-8 text-blue-500" />
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
