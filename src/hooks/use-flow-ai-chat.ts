'use client';

import { useChat } from '@ai-sdk/react';
import { useCallback, useEffect, useRef } from 'react';
import { DefaultChatTransport } from 'ai';
import type { FlowNode as FlowNodeType } from '@/lib/nodes';
import { createNodeData, getNodeDef } from '@/lib/nodes';
import { addEdge, type Edge } from '@xyflow/react';
import type {
  AddNodeParams,
  UpdateNodeParams,
  DeleteNodeParams,
  ConnectNodesParams,
  DisconnectNodesParams,
  ClearFlowParams,
} from '@/lib/ai-flow-tools';

// =============================================================================
// Types
// =============================================================================

export interface FlowState {
  nodes: FlowNodeType[];
  edges: Edge[];
}

export interface FlowActions {
  setNodes: React.Dispatch<React.SetStateAction<FlowNodeType[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
}

interface ToolResult {
  success: boolean;
  action?: string;
  params?: unknown;
  flowState?: FlowState;
  error?: string;
}

// =============================================================================
// Hook
// =============================================================================

export function useFlowAIChat(flowState: FlowState, flowActions: FlowActions) {
  const { setNodes, setEdges, setSelectedNodeId } = flowActions;
  const flowStateRef = useRef(flowState);
  const processedToolCallsRef = useRef<Set<string>>(new Set());

  // Keep ref updated
  useEffect(() => {
    flowStateRef.current = flowState;
  }, [flowState]);

  // Custom transport that includes flow state
  const transport = new DefaultChatTransport({
    api: '/api/chat',
    body: () => ({
      flowState: flowStateRef.current,
    }),
  });

  const chat = useChat({ transport });

  // Execute flow actions based on AI tool calls
  const executeFlowAction = useCallback(
    (action: string, params: unknown) => {
      console.log('[FlowAI] Executing action:', action, params);

      switch (action) {
        case 'addNode': {
          const p = params as AddNodeParams;
          const nodeData = createNodeData(p.nodeType);
          if (!nodeData) {
            console.error('[FlowAI] Could not create node data for type:', p.nodeType);
            return;
          }

          // Merge any additional data from the AI
          if (p.data) {
            Object.assign(nodeData, p.data);
          }

          const newNode: FlowNodeType = {
            id: `${p.nodeType}-${Date.now()}`,
            type: p.nodeType,
            position: p.position,
            data: nodeData,
          };

          console.log('[FlowAI] Adding node:', newNode);
          setNodes((nds) => [...nds, newNode]);
          setSelectedNodeId(newNode.id);
          break;
        }

        case 'updateNode': {
          const p = params as UpdateNodeParams;
          console.log('[FlowAI] Updating node:', p.nodeId, p.data);
          setNodes((nds) =>
            nds.map((node) =>
              node.id === p.nodeId ? { ...node, data: { ...node.data, ...p.data } } : node,
            ),
          );
          break;
        }

        case 'deleteNode': {
          const p = params as DeleteNodeParams;
          console.log('[FlowAI] Deleting node:', p.nodeId);
          setNodes((nds) => nds.filter((node) => node.id !== p.nodeId));
          setEdges((eds) =>
            eds.filter((edge) => edge.source !== p.nodeId && edge.target !== p.nodeId),
          );
          setSelectedNodeId((current) => (current === p.nodeId ? null : current));
          break;
        }

        case 'connectNodes': {
          const p = params as ConnectNodesParams;
          console.log('[FlowAI] Connecting nodes:', p.sourceNodeId, '->', p.targetNodeId);

          // Use current flow state from ref
          const currentNodes = flowStateRef.current.nodes;
          const sourceNode = currentNodes.find((n) => n.id === p.sourceNodeId);
          const targetNode = currentNodes.find((n) => n.id === p.targetNodeId);

          if (sourceNode && targetNode) {
            const sourceDef = getNodeDef(sourceNode.data.type);
            const targetDef = getNodeDef(targetNode.data.type);

            // Use provided handles or defaults
            const sourceHandle = p.sourceHandle ?? sourceDef?.outputs[0]?.id ?? null;
            const targetHandle = p.targetHandle ?? targetDef?.inputs[0]?.id ?? null;

            setEdges((eds) =>
              addEdge(
                {
                  id: `e-${p.sourceNodeId}-${p.targetNodeId}-${Date.now()}`,
                  source: p.sourceNodeId,
                  target: p.targetNodeId,
                  sourceHandle,
                  targetHandle,
                },
                eds,
              ),
            );
          } else {
            console.error('[FlowAI] Could not find nodes to connect:', { sourceNode, targetNode });
          }
          break;
        }

        case 'disconnectNodes': {
          const p = params as DisconnectNodesParams;
          console.log('[FlowAI] Disconnecting nodes:', p);
          setEdges((eds) =>
            eds.filter((edge) => {
              if (p.edgeId && edge.id === p.edgeId) return false;
              if (p.sourceNodeId && edge.source === p.sourceNodeId) return false;
              if (p.targetNodeId && edge.target === p.targetNodeId) return false;
              return true;
            }),
          );
          break;
        }

        case 'clearFlow': {
          const p = params as ClearFlowParams;
          if (p.confirm) {
            console.log('[FlowAI] Clearing flow');
            setNodes([]);
            setEdges([]);
            setSelectedNodeId(null);
          }
          break;
        }

        case 'getFlowState':
          // No action needed - state is passed to AI in request
          console.log('[FlowAI] getFlowState - no action needed');
          break;

        default:
          console.log('[FlowAI] Unknown action:', action);
      }
    },
    [setNodes, setEdges, setSelectedNodeId],
  );

  // Process tool calls from messages
  useEffect(() => {
    for (const message of chat.messages) {
      if (message.role === 'assistant' && message.parts) {
        for (const part of message.parts) {
          // Tool parts have type like 'tool-addNode'
          if (part.type.startsWith('tool-')) {
            // Create a unique key for this tool call
            const toolCallId = (part as { toolCallId?: string }).toolCallId;
            if (!toolCallId) continue;

            // Skip if already processed
            if (processedToolCallsRef.current.has(toolCallId)) continue;

            const toolPart = part as {
              type: string;
              state?: string;
              output?: ToolResult;
              toolCallId?: string;
            };

            // In AI SDK v6, the state is 'output-available' when tool result is ready
            if (toolPart.state === 'output-available' && toolPart.output) {
              const result = toolPart.output;
              if (result?.success && result.action) {
                // Mark as processed before executing
                processedToolCallsRef.current.add(toolCallId);
                console.log('[FlowAI] Executing:', result.action, result.params);
                executeFlowAction(result.action, result.params);
              }
            }
          }
        }
      }
    }
  }, [chat.messages, executeFlowAction]);

  return {
    ...chat,
    flowState,
  };
}
