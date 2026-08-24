import { renderHook, act } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus } from '../useNetworkStatus';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return online by default', () => {
    mockNetInfo.addEventListener.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('should update status when network changes', () => {
    let networkCallback: (state: any) => void = jest.fn();
    
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      networkCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Simulate going offline
    act(() => {
      networkCallback({
        isConnected: false,
        isInternetReachable: false,
      });
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);

    // Simulate going back online
    act(() => {
      networkCallback({
        isConnected: true,
        isInternetReachable: true,
      });
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('should handle null values as online (optimistic heuristic)', () => {
    let networkCallback: (state: any) => void = jest.fn();
    
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      networkCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Simulate null values (first reading)
    act(() => {
      networkCallback({
        isConnected: null,
        isInternetReachable: null,
      });
    });

    // Should be treated as online
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });
});
