import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CopyButton } from './CopyButton';

describe('CopyButton Component', () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock navigator.clipboard.writeText
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  it('renders default button with copy icon and correct title', () => {
    render(<CopyButton text="https://example.com/api" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Copy https://example.com/api');

    // Copy icon should be rendered, Copied text should not be present
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });

  it('renders label when label prop is provided', () => {
    render(<CopyButton text="abc-123" label="Copy Token" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Copy Copy Token');
    expect(screen.getByText('Copy Token')).toBeInTheDocument();
  });

  it('applies custom className and iconClassName props', () => {
    render(
      <CopyButton
        text="custom style test"
        className="custom-btn-class"
        iconClassName="custom-icon-class"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-btn-class');

    const svgIcon = button.querySelector('svg');
    expect(svgIcon).toHaveClass('custom-icon-class');
  });

  it('simulates click event and verifies navigator.clipboard.writeText is called', async () => {
    const textToCopy = 'curl -X GET https://api.zeravynex.com/v1/ioc';
    render(<CopyButton text={textToCopy} />);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(textToCopy);
  });

  it('stops event propagation on click', async () => {
    const parentClickHandler = vi.fn();
    render(
      <div onClick={parentClickHandler}>
        <CopyButton text="sample data" />
      </div>
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it("verifies the 'Copied!' state appears upon click and resets after 2000ms", async () => {
    render(<CopyButton text="data to copy" label="Copy Data" />);

    const button = screen.getByRole('button');

    // Initial state check
    expect(screen.getByText('Copy Data')).toBeInTheDocument();
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();

    // Click to copy
    await act(async () => {
      fireEvent.click(button);
    });

    // Copied state check
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Copied to clipboard!');
    expect(screen.queryByText('Copy Data')).not.toBeInTheDocument();

    // Advance timer by 1999ms - should still show Copied!
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    // Advance past 2000ms timeout - should reset back to original state
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    expect(screen.getByText('Copy Data')).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Copy Copy Data');
  });

  it('does not call navigator.clipboard.writeText when text prop is empty', async () => {
    render(<CopyButton text="" />);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });

  it('handles clipboard writeText failure gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard permission denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<CopyButton text="fail-text" />);
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeTextMock).toHaveBeenCalledWith('fail-text');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy text: ', expect.any(Error));
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
