# CPU Usage Fix - API Polling Optimization

## Problem Identified
The leave balance API was being called excessively (every ~12-13ms), causing high CPU usage as shown in the logs:
```
2025-06-18 22:33:09,416 INFO "GET /api/faculty/leave/applications/leave_balance/ HTTP/1.1" 200 589      
2025-06-18 22:33:09,429 INFO "GET /api/faculty/leave/applications/leave_balance/ HTTP/1.1" 200 589      
2025-06-18 22:33:09,441 INFO "GET /api/faculty/leave/applications/leave_balance/ HTTP/1.1" 200 589
```

## Root Causes

1. **React Hook Dependencies**: The usePoll hook had unstable dependencies causing infinite re-renders
2. **Aggressive Polling**: Even with 30-second interval, the actual calls were much more frequent
3. **No Throttling**: No protection against rapid successive API calls
4. **Missing Visibility API**: Polling continued even when page was hidden

## Fixes Applied

### 1. Fixed usePoll Hook Dependencies
**Problem**: Callback dependency was causing infinite re-renders
**Solution**: Used `useRef` and `useCallback` to stabilize dependencies

```typescript
// ❌ Before: Unstable dependencies
useEffect(() => {
  // ...
}, [pollingEnabled, currentInterval, callback]); // callback caused infinite loops

// ✅ After: Stable references
const callbackRef = useRef(callback);
useEffect(() => {
  callbackRef.current = callback;
}, [callback]);

useEffect(() => {
  // ...
}, [pollingEnabled, currentInterval]); // No unstable dependencies
```

### 2. Increased Polling Interval
**Problem**: 30 seconds was still too aggressive for leave balance data
**Solution**: Increased to 2 minutes (120 seconds)

```typescript
// ❌ Before: 30 seconds
interval: 30000

// ✅ After: 2 minutes 
interval: 120000
```

### 3. Added API Call Throttling
**Problem**: No protection against rapid successive calls
**Solution**: Added 10-second minimum throttle between silent calls

```typescript
// ✅ New: Throttle mechanism
const FETCH_THROTTLE_MS = 10000; // 10 seconds minimum between API calls

if (silent && now - lastFetchTime < FETCH_THROTTLE_MS) {
  console.log("🚫 Skipping API call due to throttling");
  return;
}
```

### 4. Added Page Visibility API
**Problem**: Polling continued when user wasn't actively viewing the page
**Solution**: Pause polling when page is hidden

```typescript
// ✅ New: Page visibility handling
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      setPollingEnabled(false); // Pause when hidden
    } else {
      setPollingEnabled(true);  // Resume when visible
      manualRefresh();          // Immediate refresh on return
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### 5. Enhanced Debug Panel
**Problem**: No visibility into polling behavior for debugging
**Solution**: Added comprehensive monitoring panel

```typescript
// ✅ New: Debug information
- Last Updated timestamp
- Polling status (Enabled/Disabled with interval)
- Loading state
- Throttle information (time since last call)
- Manual pause/resume controls
- Sample balance data display
```

## Performance Impact

### Before Optimization:
- **API Calls**: Every ~12ms (83 calls per second!)
- **CPU Usage**: Very high due to constant re-renders
- **Network**: Excessive bandwidth usage
- **Battery**: High drain on mobile devices

### After Optimization:
- **API Calls**: Every 2 minutes (0.0083 calls per second)
- **CPU Usage**: 99.99% reduction in API calls
- **Network**: Minimal bandwidth usage
- **Battery**: Significantly reduced power consumption
- **Smart Pausing**: No calls when page is hidden

## Verification Steps

1. **Check Browser Console**: Look for throttle messages:
   ```
   🚫 Skipping API call due to throttling
   📱 Page hidden - pausing leave balance polling
   📱 Page visible - resuming leave balance polling
   ```

2. **Monitor Debug Panel**: 
   - Shows "2 min interval" instead of frequent updates
   - Displays time since last API call
   - Allows manual pause/resume for testing

3. **Test Page Visibility**:
   - Switch to another tab → polling should pause
   - Return to tab → polling should resume with immediate refresh

4. **Check Server Logs**: Should see API calls every 2 minutes instead of constant requests

## Configuration Options

Users can now control polling behavior:
- **Pause/Resume**: Manual control via debug panel
- **Manual Refresh**: Force immediate update when needed
- **Automatic Pausing**: When switching tabs/minimizing window

## Files Modified

1. **`usePoll.ts`**: Fixed dependencies and added ref-based callbacks
2. **`apply-form.tsx`**: Added throttling, visibility API, and debug panel
3. **Performance documentation**: This file

## Expected CPU Improvement

- **API Call Frequency**: Reduced from ~83/second to 0.0083/second (99.99% reduction)
- **Re-render Frequency**: Eliminated infinite render loops
- **Memory Usage**: Reduced due to fewer state updates
- **Battery Life**: Significantly improved on mobile devices

The system now intelligently manages resources while maintaining data freshness for leave balance information.
