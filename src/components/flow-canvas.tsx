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
import { getMiniMapNodeColor } from '@/utils/flow-utils';

// =============================================================================
// Initial Data
// =============================================================================

const initialNodes: FlowNode[] = [
  {
    id: 'trigger-1',
    type: 'trigger_keyword',
    position: { x: 250, y: 100 },
    data: {
      type: 'trigger_keyword',
      label: 'Keyword Trigger',
      keywords: 'hello, hi, start',
      matchType: 'contains',
    },
  },
  {
    id: 'action-1',
    type: 'action_message',
    position: { x: 250, y: 300 },
    data: {
      type: 'action_message',
      label: 'Send Message',
      message: 'Hello! Welcome to our WhatsApp bot. How can I help you today?',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-trigger-action',
    source: 'trigger-1',
    sourceHandle: 'triggered',
    target: 'action-1',
    targetHandle: 'in',
  },
];

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
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      {/* Node Palette - Left Sidebar */}
      <NodePalette />

      {/* Flow Canvas - Center */}
      <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%', position: 'relative' }}>
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
            style={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: 8, 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: 4
            }}
          />
          <MiniMap
            nodeColor={getMiniMapNodeColor}
            maskColor="rgba(248, 250, 252, 0.8)"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
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
        <div 
          style={{ 
            width: 340, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 32,
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #e2e8f0'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{ 
                width: 72, 
                height: 72, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px auto',
                backgroundColor: '#eff6ff',
                borderRadius: '50%'
              }}
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ width: 32, height: 32, color: '#3b82f6' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>Select a node to edit</p>
            <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5, color: '#64748b' }}>
              or drag a node from the palette
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
