import { setTheme } from '@/src/core/theme/setTheme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock document
Object.defineProperty(document, 'documentElement', {
  value: {
    setAttribute: vi.fn(),
    style: {
      setProperty: vi.fn()
    }
  }
});

describe('setTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets css variables for light', () => {
    document.documentElement.removeAttribute('data-theme');
    setTheme('light');

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--brand', '#ff5b04');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--brand-hover', '#e65200');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('sets css variables for dark', () => {
    setTheme('dark');

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--bg', '#0b1620');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--surface', '#1d2a35');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('validates brand colors remain unchanged', () => {
    setTheme('light');

    // Verify brand colors are set correctly
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--brand', '#ff5b04');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--brand-hover', '#e65200');
  });
});
