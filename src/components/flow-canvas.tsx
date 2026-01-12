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
  type ReactFlowInstance,
  type OnConnectStart,
  type OnConnectEnd,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FolderOpen } from 'lucide-react';

import { NodePicker } from '@/components/flow/node-picker';
import { NodeEditor } from '@/components/node-editor';
import { FlowNode } from '@/components/flow-node';
import { FlowAIChatPanel } from '@/components/ai/flow-ai-chat-panel';
import { TemplateFlowPicker } from '@/components/flow/template-flow-picker';
import { useFlowAIChat } from '@/hooks/use-flow-ai-chat';
import {
  getNodeDef,
  createNodeData,
  getAllNodes,
  type FlowNodeData,
  type FlowNode as FlowNodeType,
} from '@/lib/nodes';
import { type TemplateFlow } from '@/lib/template-flows';
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
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<FlowNodeType, Edge> | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // AI Chat integration
  const aiChat = useFlowAIChat({ nodes, edges }, { setNodes, setEdges, setSelectedNodeId });

  // Connection handling
  const connectingNodeId = useRef<string | null>(null);
  const connectingHandleId = useRef<string | null>(null);
  const [pickerState, setPickerState] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    flowPosition: { x: number; y: number };
    sourceNodeId: string | null;
    sourceHandleId: string | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    flowPosition: { x: 0, y: 0 },
    sourceNodeId: null,
    sourceHandleId: null,
  });

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

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId }) => {
    connectingNodeId.current = nodeId;
    connectingHandleId.current = handleId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');

      if (targetIsPane && rfInstance && reactFlowWrapper.current) {
        // Stop default behavior
        // event.preventDefault(); // Might not be needed or exist on all event types here

        const { clientX, clientY } =
          'changedTouches' in event
            ? (event as TouchEvent).changedTouches[0]
            : (event as MouseEvent);

        // precise flow position
        const flowPosition = rfInstance.screenToFlowPosition({ x: clientX, y: clientY });

        // Menu position relative to container
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: clientX - bounds.left,
          y: clientY - bounds.top,
        };

        setPickerState({
          visible: true,
          position,
          flowPosition,
          sourceNodeId: connectingNodeId.current,
          sourceHandleId: connectingHandleId.current,
        });
      }

      // Reset after a short delay to allow click to process if needed,
      // but actually we just keep the ref until we use it in the picker or start a new connection.
      // Resetting here might be fine if we copied the data to state, which we did.
      connectingNodeId.current = null;
      connectingHandleId.current = null;
    },
    [rfInstance],
  );

  const onConnect: OnConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const onPickerSelect = useCallback(
    (nodeType: string) => {
      const { flowPosition, sourceNodeId, sourceHandleId } = pickerState;

      const nodeData = createNodeData(nodeType);
      if (!nodeData) return;

      const newNode: FlowNodeType = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position: flowPosition,
        data: nodeData,
      };

      setNodes((nds) => [...nds, newNode]);

      if (sourceNodeId) {
        // Try to find the default input handle for the new node
        const nodeDef = getNodeDef(nodeType);
        const targetHandle = nodeDef?.inputs[0]?.id || null;

        setEdges((eds) =>
          addEdge(
            {
              source: sourceNodeId,
              target: newNode.id,
              sourceHandle: sourceHandleId,
              targetHandle,
            },
            eds,
          ),
        );
      }

      setPickerState((prev) => ({ ...prev, visible: false }));
      setSelectedNodeId(newNode.id);
    },
    [pickerState],
  );

  const closePicker = useCallback(() => {
    setPickerState((prev) => ({ ...prev, visible: false }));
  }, []);

  // ==========================================================================
  // Selection Handlers
  // ==========================================================================

  const onNodeClick: NodeMouseHandler<FlowNodeType> = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setPickerState((prev) => ({ ...prev, visible: false }));
  }, []);

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();

      if (rfInstance && reactFlowWrapper.current) {
        // Handle both React.MouseEvent and native MouseEvent
        const clientX = (event as React.MouseEvent).clientX ?? (event as MouseEvent).clientX;
        const clientY = (event as React.MouseEvent).clientY ?? (event as MouseEvent).clientY;

        // precise flow position
        const flowPosition = rfInstance.screenToFlowPosition({ x: clientX, y: clientY });

        // Menu position relative to container
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: clientX - bounds.left,
          y: clientY - bounds.top,
        };

        setPickerState({
          visible: true,
          position,
          flowPosition,
          sourceNodeId: null,
          sourceHandleId: null,
        });
      }
    },
    [rfInstance],
  );

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
  // Template Flow Handler
  // ==========================================================================

  const onLoadTemplate = useCallback(
    (template: TemplateFlow) => {
      // Generate unique IDs for the template nodes to avoid conflicts
      const timestamp = Date.now();
      const idMap = new Map<string, string>();

      const newNodes = template.nodes.map((node) => {
        const newId = `${node.id}-${timestamp}`;
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
        };
      });

      const newEdges = template.edges.map((edge) => ({
        ...edge,
        id: `${edge.id}-${timestamp}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
      }));

      // Clear existing flow and load template
      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedNodeId(null);
      setShowTemplatePicker(false);

      // Fit view after loading
      setTimeout(() => {
        rfInstance?.fitView({ padding: 0.2 });
      }, 100);
    },
    [rfInstance],
  );

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="flex w-screen h-screen bg-slate-50 overflow-hidden">
      {/* Flow Canvas - Center */}
      <div ref={reactFlowWrapper} className="flex-1 h-full relative">
        <ReactFlow<FlowNodeType, Edge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          onInit={setRfInstance}
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

        {/* Template Flow Button */}
        <button
          onClick={() => setShowTemplatePicker(true)}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-black text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all z-10"
          title="Load Template Flow"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Templates</span>
        </button>

        {pickerState.visible && (
          <NodePicker
            position={pickerState.position}
            onSelect={onPickerSelect}
            onClose={closePicker}
          />
        )}
      </div>

      {/* Template Flow Picker Modal */}
      {showTemplatePicker && (
        <TemplateFlowPicker
          onSelect={onLoadTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

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
        <div className="hidden md:flex w-[340px] flex-col items-center justify-center p-8 bg-white border-l border-slate-200">
          <div className="text-center">
            <div className="w-[72px] h-[72px] flex items-center justify-center mx-auto mb-5 bg-slate-100 rounded-full">
              <SelectNodeIcon className="w-8 h-8 text-slate-800" />
            </div>
            <p className="text-[15px] font-semibold text-slate-700">Select a node to edit</p>
            <p className="text-sm mt-2 leading-relaxed text-slate-500">
              or drag a node from the palette
            </p>
          </div>
        </div>
      )}

      {/* AI Chat Panel */}
      <FlowAIChatPanel
        messages={aiChat.messages}
        status={aiChat.status}
        error={aiChat.error}
        onSendMessage={aiChat.sendMessage}
        onRegenerate={aiChat.regenerate}
        onStop={aiChat.stop}
      />
    </div>
  );
}
