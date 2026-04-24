import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './page';

describe('Homepage Chat UI', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Element.prototype.scrollIntoView is not implemented in happy-dom by default
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders the initial empty state correctly', () => {
    render(<Home />);
    expect(screen.getByTestId('chat-empty-state')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Side Quest Syndicate/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Type a message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('allows typing and disables submit when empty', () => {
    render(<Home />);

    const input = screen.getByLabelText('Type a message');
    const submitBtn = screen.getByRole('button', { name: 'Send message' });

    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.change(input, { target: { value: '' } });
    expect(submitBtn).toBeDisabled();
  });

  it('ignores whitespace-only submissions', () => {
    render(<Home />);

    const input = screen.getByLabelText('Type a message');
    fireEvent.change(input, { target: { value: '   ' } });

    const submitBtn = screen.getByRole('button', { name: 'Send message' });
    expect(submitBtn).toBeDisabled();

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(screen.queryByText('You')).not.toBeInTheDocument();
  });

  it('submits on Enter but not on Shift+Enter', () => {
    render(<Home />);

    const input = screen.getByLabelText('Type a message');

    fireEvent.change(input, { target: { value: 'Line 1\nLine 2' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(screen.queryByText('You')).not.toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Line 2/)).toBeInTheDocument();
  });

  it('streams the assistant response deterministically and locks composer', async () => {
    render(<Home />);

    const input = screen.getByLabelText('Type a message');
    const submitBtn = screen.getByRole('button', { name: 'Send message' });

    fireEvent.change(input, { target: { value: 'Tell me a story' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Tell me a story')).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(submitBtn).toBeDisabled();

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveTextContent('Assistant is typing...');

    // Advance timers for initial delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByText('Editorial Assistant')).toBeInTheDocument();

    // Advance timers for remainder of stream
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(input).not.toBeDisabled();
    expect(statusRegion).toBeEmptyDOMElement();
  });

  it('renders the error state upon "throw error" prompt', async () => {
    render(<Home />);

    const input = screen.getByLabelText('Type a message');
    const submitBtn = screen.getByRole('button', { name: 'Send message' });

    fireEvent.change(input, { target: { value: 'throw error' } });
    fireEvent.click(submitBtn);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByText('Failed to generate response')).toBeInTheDocument();
    expect(
      screen.getByText('Simulated streaming error triggered by prompt.'),
    ).toBeInTheDocument();

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveTextContent(
      'Error: Simulated streaming error triggered by prompt.',
    );

    expect(input).not.toBeDisabled();
  });
});
