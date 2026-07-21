import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CookieBanner from '../../components/CookieBanner/CookieBanner';

// Mock setTimeout for instant banner display in tests
vi.useFakeTimers();

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders after delay when no consent is stored', async () => {
    render(<CookieBanner />);
    // Before timer fires, nothing should show
    expect(screen.queryByText(/we use cookies/i)).not.toBeInTheDocument();
    // Advance timer
    act(() => vi.runAllTimers());
    expect(screen.getByText(/we use cookies/i)).toBeInTheDocument();
  });

  it('does NOT render when consent has already been given', () => {
    localStorage.setItem('clubhub_cookie_consent', 'true');
    render(<CookieBanner />);
    act(() => vi.runAllTimers());
    expect(screen.queryByText(/we use cookies/i)).not.toBeInTheDocument();
  });

  it('saves consent and dismisses when Accept is clicked', () => {
    render(<CookieBanner />);
    act(() => vi.runAllTimers());
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(screen.queryByText(/we use cookies/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('clubhub_cookie_consent')).toBe('true');
  });

  it('dismisses without saving when Decline is clicked', () => {
    render(<CookieBanner />);
    act(() => vi.runAllTimers());
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(screen.queryByText(/we use cookies/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('clubhub_cookie_consent')).toBeNull();
  });
});
