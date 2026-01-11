import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlowAIChatPanel } from './flow-ai-chat-panel';
import type { UIMessage } from '@ai-sdk/react';

describe('FlowAIChatPanel', () => {
  const mockOnSendMessage = vi.fn();
  const mockOnRegenerate = vi.fn();
  const mockOnStop = vi.fn();

  const defaultProps = {
    messages: [] as UIMessage[],
    status: 'ready',
    error: undefined,
    onSendMessage: mockOnSendMessage,
    onRegenerate: mockOnRegenerate,
    onStop: mockOnStop,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the closed state with open button', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    // Initially closed, should show the FAB button
    expect(screen.getByTitle('Open AI Flow Assistant')).toBeInTheDocument();
  });

  it('should open the panel when FAB is clicked', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    const openButton = screen.getByTitle('Open AI Flow Assistant');
    fireEvent.click(openButton);

    // Now panel should be open - check for header
    expect(screen.getAllByText('Flow AI Assistant').length).toBeGreaterThan(0);
  });

  it('should render empty state message when no messages and panel is open', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    expect(
      screen.getByText("Describe what you want to build and I'll create the flow for you. Try:"),
    ).toBeInTheDocument();
  });

  it('should render input field when panel is open', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    expect(screen.getByPlaceholderText('Describe what you want to build...')).toBeInTheDocument();
  });

  it('should close panel when close button is clicked', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));
    // Check panel is open by looking for the header text (there's also one in empty state)
    expect(screen.getAllByText('Flow AI Assistant').length).toBeGreaterThan(0);

    // Find and click the close button (X icon)
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find((btn) => btn.querySelector('.lucide-x'));
    fireEvent.click(closeButton!);

    // Panel should be closed, FAB should be visible
    expect(screen.getByTitle('Open AI Flow Assistant')).toBeInTheDocument();
    expect(screen.queryAllByText('Flow AI Assistant').length).toBe(0);
  });

  it('should minimize and maximize panel', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    // Input should be visible before minimize
    expect(screen.getByPlaceholderText('Describe what you want to build...')).toBeInTheDocument();

    // Find and click minimize button (ChevronDown icon)
    const buttons = screen.getAllByRole('button');
    const minimizeButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-down'));
    fireEvent.click(minimizeButton!);

    // Input should not be visible when minimized
    expect(
      screen.queryByPlaceholderText('Describe what you want to build...'),
    ).not.toBeInTheDocument();

    // Find and click maximize button (ChevronUp icon)
    const maximizeButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('.lucide-chevron-up'));
    fireEvent.click(maximizeButton!);

    // Input should be visible again
    expect(screen.getByPlaceholderText('Describe what you want to build...')).toBeInTheDocument();
  });

  it('should update input when typing', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    const input = screen.getByPlaceholderText('Describe what you want to build...');
    fireEvent.change(input, { target: { value: 'Add a trigger node' } });

    expect(input).toHaveValue('Add a trigger node');
  });

  it('should call onSendMessage when form is submitted with input', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    const input = screen.getByPlaceholderText('Describe what you want to build...');
    fireEvent.change(input, { target: { value: 'Add a trigger node' } });

    const form = input.closest('form');
    fireEvent.submit(form!);

    expect(mockOnSendMessage).toHaveBeenCalledWith({ text: 'Add a trigger node' });
  });

  it('should show loading state when status is streaming', () => {
    render(<FlowAIChatPanel {...defaultProps} status="streaming" />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    expect(screen.getByText('Thinking...')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('should call onStop when stop button is clicked during streaming', () => {
    render(<FlowAIChatPanel {...defaultProps} status="streaming" />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    const stopButton = screen.getByText('Stop');
    fireEvent.click(stopButton);

    expect(mockOnStop).toHaveBeenCalled();
  });

  it('should render user messages', () => {
    const messages: UIMessage[] = [
      {
        id: '1',
        role: 'user' as const,
        content: 'Add a trigger node',
        parts: [{ type: 'text' as const, text: 'Add a trigger node' }],
      },
    ];

    render(<FlowAIChatPanel {...defaultProps} messages={messages} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    expect(screen.getByText('Add a trigger node')).toBeInTheDocument();
  });

  it('should render assistant messages', () => {
    const messages: UIMessage[] = [
      {
        id: '1',
        role: 'user' as const,
        content: 'Add a trigger node',
        parts: [{ type: 'text' as const, text: 'Add a trigger node' }],
      },
      {
        id: '2',
        role: 'assistant' as const,
        content: 'I added a trigger node for you.',
        parts: [{ type: 'text' as const, text: 'I added a trigger node for you.' }],
      },
    ];

    render(<FlowAIChatPanel {...defaultProps} messages={messages} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    expect(screen.getByText('Add a trigger node')).toBeInTheDocument();
    expect(screen.getByText('I added a trigger node for you.')).toBeInTheDocument();
  });

  it('should display error message when error occurs', () => {
    render(<FlowAIChatPanel {...defaultProps} error={new Error('API error')} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    expect(screen.getByText(/API error/)).toBeInTheDocument();
  });

  it('should call onRegenerate when try again is clicked after error', () => {
    render(<FlowAIChatPanel {...defaultProps} error={new Error('API error')} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    const tryAgainButton = screen.getByText('Try again');
    fireEvent.click(tryAgainButton);

    expect(mockOnRegenerate).toHaveBeenCalled();
  });

  it('should render tool parts with pending state', () => {
    const messages: UIMessage[] = [
      {
        id: '1',
        role: 'assistant' as const,
        content: '',
        parts: [
          {
            type: 'tool-addNode' as const,
            state: 'input-streaming',
          } as unknown as UIMessage['parts'][0],
        ],
      },
    ];

    render(<FlowAIChatPanel {...defaultProps} messages={messages} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    expect(screen.getByText('Add Node')).toBeInTheDocument();
  });

  it('should render tool parts with completed state', () => {
    const messages: UIMessage[] = [
      {
        id: '1',
        role: 'assistant' as const,
        content: '',
        parts: [
          {
            type: 'tool-addNode' as const,
            state: 'output-available',
          } as unknown as UIMessage['parts'][0],
        ],
      },
    ];

    render(<FlowAIChatPanel {...defaultProps} messages={messages} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    expect(screen.getByText('Add Node')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should set input when suggestion is clicked', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    const suggestion = screen.getByText('"Create a welcome flow for new users"');
    fireEvent.click(suggestion);

    const input = screen.getByPlaceholderText('Describe what you want to build...');
    expect(input).toHaveValue('Create a welcome flow for new users');
  });

  it('should disable input when streaming', () => {
    render(<FlowAIChatPanel {...defaultProps} status="streaming" />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    const input = screen.getByPlaceholderText('Describe what you want to build...');
    expect(input).toBeDisabled();
  });

  it('should clear input after sending message', () => {
    render(<FlowAIChatPanel {...defaultProps} />);

    // Open the panel
    fireEvent.click(screen.getByTitle('Open AI Flow Assistant'));

    const input = screen.getByPlaceholderText('Describe what you want to build...');
    fireEvent.change(input, { target: { value: 'Test message' } });

    const form = input.closest('form');
    fireEvent.submit(form!);

    expect(input).toHaveValue('');
  });
});
