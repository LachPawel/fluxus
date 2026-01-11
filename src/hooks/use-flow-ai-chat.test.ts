import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFlowAIChat, type FlowState, type FlowActions } from './use-flow-ai-chat';
import type { Edge } from '@xyflow/react';
import type { FlowNode as FlowNodeType } from '@/lib/nodes';

// Mock the AI SDK useChat hook
const mockAppend = vi.fn();
const mockSetMessages = vi.fn();

vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(() => ({
    messages: [],
    input: '',
    setInput: vi.fn(),
    append: mockAppend,
    isLoading: false,
    stop: vi.fn(),
    error: null,
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    reload: vi.fn(),
    setMessages: mockSetMessages,
    id: 'test-chat',
    status: 'ready',
  })),
}));

// Mock the nodes module
vi.mock('@/lib/nodes', () => ({
  createNodeData: vi.fn((type: string) => ({ type, label: `${type} node` })),
  getNodeDef: vi.fn(() => ({
    inputs: [{ id: 'in' }],
    outputs: [{ id: 'triggered' }],
  })),
}));

// Import the mocked hook for manipulation
import { useChat } from '@ai-sdk/react';
const mockUseChat = vi.mocked(useChat);

describe('useFlowAIChat', () => {
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();
  const mockSetSelectedNodeId = vi.fn();

  const defaultFlowState: FlowState = {
    nodes: [] as FlowNodeType[],
    edges: [] as Edge[],
  };

  const defaultFlowActions: FlowActions = {
    setNodes: mockSetNodes,
    setEdges: mockSetEdges,
    setSelectedNodeId: mockSetSelectedNodeId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChat.mockReturnValue({
      messages: [],
      input: '',
      setInput: vi.fn(),
      append: mockAppend,
      isLoading: false,
      stop: vi.fn(),
      error: null,
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn(),
      reload: vi.fn(),
      setMessages: mockSetMessages,
      id: 'test-chat',
      status: 'ready' as const,
      data: undefined,
      addToolResult: vi.fn(),
      metadata: undefined,
    });
  });

  it('should return chat object with flowState', () => {
    const { result } = renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

    expect(result.current.flowState).toEqual(defaultFlowState);
    expect(result.current.messages).toEqual([]);
  });

  it('should return messages from useChat', () => {
    const testMessages = [{ id: '1', role: 'user' as const, content: 'test' }];
    mockUseChat.mockReturnValue({
      messages: testMessages,
      input: '',
      setInput: vi.fn(),
      append: mockAppend,
      isLoading: false,
      stop: vi.fn(),
      error: null,
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn(),
      reload: vi.fn(),
      setMessages: mockSetMessages,
      id: 'test-chat',
      status: 'ready' as const,
      data: undefined,
      addToolResult: vi.fn(),
      metadata: undefined,
    });

    const { result } = renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

    expect(result.current.messages).toEqual(testMessages);
  });

  describe('executeFlowAction via tool calls', () => {
    it('should call setNodes for addNode tool result', async () => {
      const messagesWithToolResult = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-addNode',
              toolCallId: 'call-add-1',
              state: 'output-available',
              output: {
                success: true,
                action: 'addNode',
                params: { nodeType: 'trigger_keyword', position: { x: 100, y: 200 } },
              },
            },
          ],
        },
      ];

      mockUseChat.mockReturnValue({
        messages: messagesWithToolResult,
        input: '',
        setInput: vi.fn(),
        append: mockAppend,
        isLoading: false,
        stop: vi.fn(),
        error: null,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        reload: vi.fn(),
        setMessages: mockSetMessages,
        id: 'test-chat',
        status: 'ready' as const,
        data: undefined,
        addToolResult: vi.fn(),
        metadata: undefined,
      });

      renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

      await waitFor(() => {
        expect(mockSetNodes).toHaveBeenCalled();
      });
    });

    it('should call setNodes for updateNode tool result', async () => {
      const messagesWithToolResult = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-updateNode',
              toolCallId: 'call-update-1',
              state: 'output-available',
              output: {
                success: true,
                action: 'updateNode',
                params: { nodeId: 'node-123', data: { message: 'Hello' } },
              },
            },
          ],
        },
      ];

      mockUseChat.mockReturnValue({
        messages: messagesWithToolResult,
        input: '',
        setInput: vi.fn(),
        append: mockAppend,
        isLoading: false,
        stop: vi.fn(),
        error: null,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        reload: vi.fn(),
        setMessages: mockSetMessages,
        id: 'test-chat',
        status: 'ready' as const,
        data: undefined,
        addToolResult: vi.fn(),
        metadata: undefined,
      });

      renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

      await waitFor(() => {
        expect(mockSetNodes).toHaveBeenCalled();
      });
    });

    it('should call setNodes and setEdges for deleteNode tool result', async () => {
      const messagesWithToolResult = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-deleteNode',
              toolCallId: 'call-delete-1',
              state: 'output-available',
              output: {
                success: true,
                action: 'deleteNode',
                params: { nodeId: 'node-123' },
              },
            },
          ],
        },
      ];

      mockUseChat.mockReturnValue({
        messages: messagesWithToolResult,
        input: '',
        setInput: vi.fn(),
        append: mockAppend,
        isLoading: false,
        stop: vi.fn(),
        error: null,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        reload: vi.fn(),
        setMessages: mockSetMessages,
        id: 'test-chat',
        status: 'ready' as const,
        data: undefined,
        addToolResult: vi.fn(),
        metadata: undefined,
      });

      renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

      await waitFor(() => {
        expect(mockSetNodes).toHaveBeenCalled();
        expect(mockSetEdges).toHaveBeenCalled();
      });
    });

    it('should call setEdges for connectNodes tool result', async () => {
      const flowStateWithNodes: FlowState = {
        nodes: [
          {
            id: 'node-1',
            type: 'trigger_keyword',
            position: { x: 0, y: 0 },
            data: { type: 'trigger_keyword' },
          },
          {
            id: 'node-2',
            type: 'action_message',
            position: { x: 200, y: 0 },
            data: { type: 'action_message' },
          },
        ] as FlowNodeType[],
        edges: [],
      };

      const messagesWithToolResult = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-connectNodes',
              toolCallId: 'call-connect-1',
              state: 'output-available',
              output: {
                success: true,
                action: 'connectNodes',
                params: { sourceNodeId: 'node-1', targetNodeId: 'node-2' },
              },
            },
          ],
        },
      ];

      mockUseChat.mockReturnValue({
        messages: messagesWithToolResult,
        input: '',
        setInput: vi.fn(),
        append: mockAppend,
        isLoading: false,
        stop: vi.fn(),
        error: null,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        reload: vi.fn(),
        setMessages: mockSetMessages,
        id: 'test-chat',
        status: 'ready' as const,
        data: undefined,
        addToolResult: vi.fn(),
        metadata: undefined,
      });

      renderHook(() => useFlowAIChat(flowStateWithNodes, defaultFlowActions));

      await waitFor(() => {
        expect(mockSetEdges).toHaveBeenCalled();
      });
    });

    it('should call setEdges for disconnectNodes tool result', async () => {
      const messagesWithToolResult = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-disconnectNodes',
              toolCallId: 'call-disconnect-1',
              state: 'output-available',
              output: {
                success: true,
                action: 'disconnectNodes',
                params: { edgeId: 'edge-123' },
              },
            },
          ],
        },
      ];

      mockUseChat.mockReturnValue({
        messages: messagesWithToolResult,
        input: '',
        setInput: vi.fn(),
        append: mockAppend,
        isLoading: false,
        stop: vi.fn(),
        error: null,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        reload: vi.fn(),
        setMessages: mockSetMessages,
        id: 'test-chat',
        status: 'ready' as const,
        data: undefined,
        addToolResult: vi.fn(),
        metadata: undefined,
      });

      renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

      await waitFor(() => {
        expect(mockSetEdges).toHaveBeenCalled();
      });
    });

    it('should call setNodes and setEdges for clearFlow with confirm true', async () => {
      const messagesWithToolResult = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-clearFlow',
              toolCallId: 'call-clear-1',
              state: 'output-available',
              output: {
                success: true,
                action: 'clearFlow',
                params: { confirm: true },
              },
            },
          ],
        },
      ];

      mockUseChat.mockReturnValue({
        messages: messagesWithToolResult,
        input: '',
        setInput: vi.fn(),
        append: mockAppend,
        isLoading: false,
        stop: vi.fn(),
        error: null,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        reload: vi.fn(),
        setMessages: mockSetMessages,
        id: 'test-chat',
        status: 'ready' as const,
        data: undefined,
        addToolResult: vi.fn(),
        metadata: undefined,
      });

      renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

      await waitFor(() => {
        expect(mockSetNodes).toHaveBeenCalledWith([]);
        expect(mockSetEdges).toHaveBeenCalledWith([]);
      });
    });

    it('should NOT call setNodes/setEdges for clearFlow with confirm false', async () => {
      const messagesWithToolResult = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-clearFlow',
              toolCallId: 'call-clear-false',
              state: 'output-available',
              output: {
                success: true,
                action: 'clearFlow',
                params: { confirm: false },
              },
            },
          ],
        },
      ];

      mockUseChat.mockReturnValue({
        messages: messagesWithToolResult,
        input: '',
        setInput: vi.fn(),
        append: mockAppend,
        isLoading: false,
        stop: vi.fn(),
        error: null,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        reload: vi.fn(),
        setMessages: mockSetMessages,
        id: 'test-chat',
        status: 'ready' as const,
        data: undefined,
        addToolResult: vi.fn(),
        metadata: undefined,
      });

      renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

      // Wait a bit to ensure the effect has time to run
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not have been called with empty arrays (clearFlow behavior)
      expect(mockSetNodes).not.toHaveBeenCalledWith([]);
    });

    it('should not process the same tool call twice', async () => {
      const messagesWithToolResult = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-deleteNode',
              toolCallId: 'same-call-id',
              state: 'output-available',
              output: {
                success: true,
                action: 'deleteNode',
                params: { nodeId: 'node-123' },
              },
            },
          ],
        },
      ];

      mockUseChat.mockReturnValue({
        messages: messagesWithToolResult,
        input: '',
        setInput: vi.fn(),
        append: mockAppend,
        isLoading: false,
        stop: vi.fn(),
        error: null,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        reload: vi.fn(),
        setMessages: mockSetMessages,
        id: 'test-chat',
        status: 'ready' as const,
        data: undefined,
        addToolResult: vi.fn(),
        metadata: undefined,
      });

      const { rerender } = renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

      await waitFor(() => {
        expect(mockSetNodes).toHaveBeenCalledTimes(1);
      });

      // Re-render should not process again
      rerender();

      // Should still only be called once
      expect(mockSetNodes).toHaveBeenCalledTimes(1);
    });

    it('should skip tool calls without toolCallId', async () => {
      const messagesWithToolResult = [
        {
          id: '1',
          role: 'assistant' as const,
          content: '',
          parts: [
            {
              type: 'tool-deleteNode',
              // No toolCallId
              state: 'output-available',
              output: {
                success: true,
                action: 'deleteNode',
                params: { nodeId: 'node-123' },
              },
            },
          ],
        },
      ];

      mockUseChat.mockReturnValue({
        messages: messagesWithToolResult,
        input: '',
        setInput: vi.fn(),
        append: mockAppend,
        isLoading: false,
        stop: vi.fn(),
        error: null,
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        reload: vi.fn(),
        setMessages: mockSetMessages,
        id: 'test-chat',
        status: 'ready' as const,
        data: undefined,
        addToolResult: vi.fn(),
        metadata: undefined,
      });

      renderHook(() => useFlowAIChat(defaultFlowState, defaultFlowActions));

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSetNodes).not.toHaveBeenCalled();
    });
  });
});
