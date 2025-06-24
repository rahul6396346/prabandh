# Apply Leave Balance Updates - Instructions

## Summary of Changes Made

✅ **Backend Updated**: 
- `paternity_leave` changed from 0.0 to 10.0 days
- `duty_leave` confirmed as 15.0 days (already correct)

✅ **Frontend**: 
- No changes needed - it dynamically fetches data from backend
- All leave balance displays will automatically show correct values

## Step-by-Step Application

### 1. Apply Backend Changes
The backend changes are already applied in `leave_management/views.py`

### 2. Update Existing Database Records
```powershell
cd "c:\Users\Rose\Desktop\testing\prabandh-nexus-main\backend\prabandhserver"
python update_leave_balances.py
```

### 3. Restart Django Server (if running)
```powershell
# Stop current server (Ctrl+C)
# Then restart:
python manage.py runserver
```

### 4. Test the Changes
```powershell
# Run test script to verify values:
python test_leave_values.py
```

### 5. Test Frontend
1. Open the frontend application
2. Navigate to the Apply Leave form
3. Check that leave balance buttons show:
   - **Duty Leave: Available: 15**
   - **Paternity Leave: Available: 10**
   - Other leave types with their correct values

### 6. Verify in Browser Console
Open browser developer tools and look for:
```
🔄 Fetching leave balance...
✅ Leave balance fetched successfully: { duty: { total: 15, remaining: 15 }, paternity: { total: 10, remaining: 10 }, ... }
```

## Expected Results

### Leave Balance Buttons Should Show:
- Earn Leave: Available: 15
- Casual Leave: Available: 15  
- Medical Leave: Available: 12
- Compensatory Leave: Available: 8
- Semester Break: Available: 5
- Maternity Leave: Available: 15
- **Paternity Leave: Available: 10** ⭐ (Updated)
- Extraordinary Leave: Available: 15
- Academic Leave: Available: 5
- **Duty Leave: Available: 15** ⭐ (Confirmed)
- Half Pay Leave: Available: 5

## Troubleshooting

### If values don't update:
1. Clear browser cache and localStorage
2. Check browser console for API errors
3. Verify Django server is running
4. Run the update script again
5. Check database directly using Django admin

### If API calls fail:
1. Check authentication tokens in localStorage
2. Verify CORS settings
3. Check Django server logs
4. Test API endpoint directly

## Files Modified
- `backend/prabandhserver/leave_management/views.py` - Updated paternity leave default
- `backend/prabandhserver/update_leave_balances.py` - Script to update existing records
- `test_leave_values.py` - Test script for verification
- `LEAVE_BALANCE_FIX.md` - Updated documentation
