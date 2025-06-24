import { useEffect, useRef, useState } from 'react';

type UsePollOptions = {
  /**
   * The interval in milliseconds between polls
   * @default 100
   */
  interval?: number;
  /**
   * Whether polling is initially enabled
   * @default true
   */
  initialEnabled?: boolean;
  /**
   * Callback function to execute when polling
   */
  callback: (silent: boolean) => Promise<void> | void;
  /**
   * Function to call when an error occurs during polling
   */
  onError?: (error: any) => void;
};

/**
 * A hook for polling data at regular intervals
 */
export function usePoll({
  interval = 100, // 100 milliseconds
  initialEnabled = true,
  callback,
  onError
}: UsePollOptions) {
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(initialEnabled);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [currentInterval, setCurrentInterval] = useState<number>(interval);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const onErrorRef = useRef(onError);

  // Update refs when props change
  useEffect(() => {
    callbackRef.current = callback;
    onErrorRef.current = onError;
  }, [callback, onError]);  useEffect(() => {
    // Initial fetch when the component mounts (not silent)
    try {
      const result = callbackRef.current(false);
      // Handle if the callback returns a promise
      if (result instanceof Promise) {
        result.catch(error => {
          console.error('Error in initial fetch:', error);
          if (onErrorRef.current) onErrorRef.current(error);
        });
      }
    } catch (error) {
      console.error('Error in initial fetch:', error);
      if (onErrorRef.current) onErrorRef.current(error);
    }
    
    setLastPolled(new Date());

    // Set up polling for real-time updates if enabled
    if (pollingEnabled) {
      startPolling();
    }

    return () => stopPolling();
  }, []); // Empty dependency array to run only on mount
  
  // When polling enabled state changes or interval changes, restart polling
  useEffect(() => {
    if (pollingEnabled) {
      startPolling();
    } else {
      stopPolling();
    }
    
    return () => stopPolling();
  }, [pollingEnabled, currentInterval]); // Removed callback dependency
  const startPolling = () => {
    // Clear any existing interval
    stopPolling();
    
    // Create new interval
    pollingInterval.current = setInterval(async () => {
      if (!pollingEnabled) return;
      
      setIsPolling(true);
      try {
        // Silent refresh (true means silent)
        await callbackRef.current(true);
        setLastPolled(new Date());
      } catch (error) {
        console.error('Error during polling:', error);
        if (onErrorRef.current) onErrorRef.current(error);
      } finally {
        setIsPolling(false);
      }
    }, currentInterval);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };
  const manualRefresh = async () => {
    setIsPolling(true);
    try {
      // Not silent
      await callbackRef.current(false);
      setLastPolled(new Date());
    } catch (error) {
      console.error('Error during manual refresh:', error);
      if (onErrorRef.current) onErrorRef.current(error);
    } finally {
      setIsPolling(false);
    }
  };
  const updateInterval = (newInterval: number) => {
    setCurrentInterval(newInterval);
  };

  return {
    pollingEnabled,
    setPollingEnabled,
    lastPolled,
    isPolling,
    manualRefresh,
    updateInterval,
    currentInterval,
  };
}

export default usePoll; 