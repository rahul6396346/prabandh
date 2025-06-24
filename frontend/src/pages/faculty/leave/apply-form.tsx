import React, { useState, ChangeEvent, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import authService, { Faculty, EmptypesResponse, UserByEmptype } from "@/services/authService"; // Import authService and new types
import leaveService from "@/services/leaveService"; // Import leaveService
import axios from 'axios'; // Added for API calls
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { usePoll } from "@/hooks/usePoll";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiRadioGroup, MultiRadioItem } from "@/components/ui/multi-radio-group";
import { AlertDialogCustom } from "@/components/ui/alert-dialog-custom";

export default function ApplyLeaveForm() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [noDays, setNoDays] = useState<string>("1");
  const [activeLeaveTypes, setActiveLeaveTypes] = useState<string[]>(["compensatory"]);
  const [halfDayLeave, setHalfDayLeave] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [contactDuringLeave, setContactDuringLeave] = useState<string>("");
  const [addressDuringLeave, setAddressDuringLeave] = useState<string>("");
  const [forwardTo, setForwardTo] = useState<string>("");
  const [supportingDocument, setSupportingDocument] = useState<File | null>(null);
  const [classAdjustments, setClassAdjustments] = useState<Array<{ course: string; branch: string; semester: string; subject: string; classTiming: string; concernedTeacher: string }>>([
    { course: "", branch: "", semester: "", subject: "", classTiming: "", concernedTeacher: "" },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null); // To show success/error messages

  // State for faculty data
  const [facultyData, setFacultyData] = useState<Faculty | null>(null);
  
  // State for emptypes and users by emptype
  const [emptypesData, setEmptypesData] = useState<EmptypesResponse | null>(null);
  const [loadingEmptypes, setLoadingEmptypes] = useState<boolean>(false);
  const [selectedEmptype, setSelectedEmptype] = useState<string>('');
  const [usersInSelectedEmptype, setUsersInSelectedEmptype] = useState<UserByEmptype[]>([]);
  
  // New state for leave balance
  const [leaveBalance, setLeaveBalance] = useState<any>({
    earned: { total: 0, used: 0, remaining: 0 },
    casual: { total: 0, used: 0, remaining: 0 },
    medical: { total: 0, used: 0, remaining: 0 },
    compensatory: { total: 0, used: 0, remaining: 0 },
    semester: { total: 0, used: 0, remaining: 0 },
    maternity: { total: 0, used: 0, remaining: 0 },
    paternity: { total: 0, used: 0, remaining: 0 },
    duty: { total: 0, used: 0, remaining: 0 },
    extraordinary: { total: 0, used: 0, remaining: 0 },
    academic: { total: 0, used: 0, remaining: 0 },
    half_pay: { total: 0, used: 0, remaining: 0 }
  });
  const [loadingLeaveBalance, setLoadingLeaveBalance] = useState<boolean>(false);

  // State for custom alert dialog
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title?: string;
    description: string;
    type?: 'warning' | 'error' | 'success' | 'info';
  }>({
    open: false,
    title: '',
    description: '',
    type: 'warning'
  });

  // Helper function to show custom alert
  const showAlert = (description: string, title?: string, type: 'warning' | 'error' | 'success' | 'info' = 'warning') => {
    setAlertDialog({
      open: true,
      title,
      description,
      type
    });
  };

  // Effect to fetch faculty data
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setFacultyData(currentUser);
      // Log to console to verify data
      console.log("Current User Data in Apply Form:", currentUser);
    } else {
      console.log("No current user found in Apply Form.");
    }
    
    // Fetch all emptypes and their users
    fetchEmptypes();
    
    // Note: Leave balance is now handled by usePoll hook
  }, []);
  
  // State for leave balance throttling
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const FETCH_THROTTLE_MS = 10000; // Minimum 10 seconds between API calls

  // Function to fetch leave balance
  const fetchLeaveBalance = useCallback(async (silent: boolean = false) => {
    // Throttle API calls to prevent excessive requests
    const now = Date.now();
    if (silent && now - lastFetchTime < FETCH_THROTTLE_MS) {
      console.log("🚫 Skipping API call due to throttling", { 
        timeSinceLastCall: now - lastFetchTime, 
        throttleLimit: FETCH_THROTTLE_MS 
      });
      return;
    }

    if (!silent) {
      setLoadingLeaveBalance(true);
    }
    try {
      console.log("🔄 Fetching leave balance...", { silent, timestamp: new Date().toISOString() });
      const balanceData = await leaveService.getLeaveBalance();
      console.log("✅ Leave balance fetched successfully:", balanceData);
      
      setLastFetchTime(now);
      
      // Validate the response structure
      if (balanceData && typeof balanceData === 'object') {
        setLeaveBalance(balanceData);
        console.log("📊 Leave balance updated in state:", balanceData);
      } else {
        console.warn("⚠️ Invalid leave balance response:", balanceData);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Error fetching leave balance:", error);
      
      // Only show error alert if not a silent refresh
      if (!silent) {
        showAlert(
          "Unable to fetch current leave balance. Please check your connection and try again.",
          "API Error",
          "error"
        );
      }
      
      // Don't reset the state to prevent showing zeros, keep existing data
    } finally {
      if (!silent) {
        setLoadingLeaveBalance(false);
      }
    }
  }, [lastFetchTime, showAlert]); // Add dependencies

  // Use the polling hook for leave balance updates (declare before useEffect that depends on it)
  const { pollingEnabled, setPollingEnabled, lastPolled, isPolling, manualRefresh } = usePoll({
    callback: fetchLeaveBalance,
    interval: 4000, // 4 seconds - much less aggressive
    initialEnabled: true,
    onError: (error) => {
      console.error("Error during leave balance polling:", error);
      // Show error to user
      showAlert("Failed to fetch current leave balance. Please refresh the page.", "Connection Error", "error");
    }
  });

  // Effect to handle page visibility and pause polling when not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("📱 Page hidden - pausing leave balance polling");
        setPollingEnabled(false);
      } else {
        console.log("📱 Page visible - resuming leave balance polling");
        setPollingEnabled(true);
        // Trigger immediate refresh when page becomes visible
        manualRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setPollingEnabled, manualRefresh]);
  
  // Function to fetch all emptypes and their users
  const fetchEmptypes = async () => {
    setLoadingEmptypes(true);
    try {
      const data = await authService.getAllEmptypes();
      setEmptypesData(data);
      console.log("Fetched emptypes data:", data);
    } catch (error) {
      console.error("Error fetching emptypes:", error);
    } finally {
      setLoadingEmptypes(false);
    }
  };
  
  // Handle emptype selection
  const handleEmptypeChange = (emptype: string) => {
    setSelectedEmptype(emptype);
    
    // Update users in selected emptype
    if (emptypesData && emptypesData.users_by_emptype && emptypesData.users_by_emptype[emptype]) {
      setUsersInSelectedEmptype(emptypesData.users_by_emptype[emptype]);
    } else {
      setUsersInSelectedEmptype([]);
    }
  };
  
  // Handle user selection from the selected emptype
  const handleUserSelection = (userId: string) => {
    setForwardTo(userId);
  };

  useEffect(() => {
    if (fromDate && toDate) {
      if (toDate < fromDate) {
        setNoDays("0"); // Or handle as an error, e.g., reset toDate or show a message
        return;
      }
      
      // If it's a half day leave, set to 0.5 if same day
      if (halfDayLeave === "half" && fromDate.toDateString() === toDate.toDateString()) {
        setNoDays("0.5");
        return;
      }
      
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive days
      setNoDays(diffDays.toString());
    } else {
      // Default to appropriate value based on half/full day selection
      setNoDays(halfDayLeave === "half" ? "0.5" : "1");
    }
  }, [fromDate, toDate, halfDayLeave]);

  // Handler for leave type change with validation
  const handleLeaveTypeChange = (leaveType: string, checked: boolean) => {
    if (checked) {
      // Define allowed combinations
      const allowedCombinations = [
        ["casual", "compensatory"], // Casual + Compensatory
        ["earned", "medical"]       // Earned + Medical
      ];
      
      // Special rules for allowed combinations
      if (leaveType === "casual") {
        // If selecting Casual Leave
        if (activeLeaveTypes.length > 0 && !activeLeaveTypes.includes("compensatory")) {
          showAlert(
            `You have already selected: ${activeLeaveTypes.map(type => type.replace('_', ' ')).join(', ')}\n\nPlease unselect other leave types first.`,
            'Casual Leave can only be combined with Compensatory Leave!',
            'warning'
          );
          return;
        }
        if (activeLeaveTypes.length >= 2) {
          showAlert(
            `You have already selected: ${activeLeaveTypes.map(type => type.replace('_', ' ')).join(', ')}`,
            'Maximum 2 leave types can be selected!',
            'warning'
          );
          return;
        }
      } else if (leaveType === "compensatory") {
        // If selecting Compensatory Leave
        if (activeLeaveTypes.length > 0 && !activeLeaveTypes.includes("casual")) {
          showAlert(
            `You have already selected: ${activeLeaveTypes.map(type => type.replace('_', ' ')).join(', ')}\n\nPlease unselect other leave types first.`,
            'Compensatory Leave can only be combined with Casual Leave!',
            'warning'
          );
          return;
        }
        if (activeLeaveTypes.length >= 2) {
          showAlert(
            `You have already selected: ${activeLeaveTypes.map(type => type.replace('_', ' ')).join(', ')}`,
            'Maximum 2 leave types can be selected!',
            'warning'
          );
          return;
        }
      } else if (leaveType === "earned") {
        // If selecting Earned Leave
        if (activeLeaveTypes.length > 0 && !activeLeaveTypes.includes("medical")) {
          showAlert(
            `You have already selected: ${activeLeaveTypes.map(type => type.replace('_', ' ')).join(', ')}\n\nPlease unselect other leave types first.`,
            'Earned Leave can only be combined with Medical Leave!',
            'warning'
          );
          return;
        }
        if (activeLeaveTypes.length >= 2) {
          showAlert(
            `You have already selected: ${activeLeaveTypes.map(type => type.replace('_', ' ')).join(', ')}`,
            'Maximum 2 leave types can be selected!',
            'warning'
          );
          return;
        }
      } else if (leaveType === "medical") {
        // If selecting Medical Leave
        if (activeLeaveTypes.length > 0 && !activeLeaveTypes.includes("earned")) {
          showAlert(
            `You have already selected: ${activeLeaveTypes.map(type => type.replace('_', ' ')).join(', ')}\n\nPlease unselect other leave types first.`,
            'Medical Leave can only be combined with Earned Leave!',
            'warning'
          );
          return;
        }
        if (activeLeaveTypes.length >= 2) {
          showAlert(
            `You have already selected: ${activeLeaveTypes.map(type => type.replace('_', ' ')).join(', ')}`,
            'Maximum 2 leave types can be selected!',
            'warning'
          );
          return;
        }
      } else {
        // If selecting any other leave type
        if (activeLeaveTypes.length >= 1) {
          showAlert(
            `You have already selected: ${activeLeaveTypes.map(type => type.replace('_', ' ')).join(', ')}\n\nPlease unselect other leave types first.`,
            `${leaveType.replace('_', ' ')} can only be selected alone!`,
            'warning'
          );
          return;
        }
      }
      
      // Add leave type to selection
      setActiveLeaveTypes(prev => [...prev, leaveType]);
      
      // Check if the selected leave type has 0 balance
      const selectedLeaveBalance = leaveBalance[leaveType];
      if (selectedLeaveBalance && selectedLeaveBalance.remaining <= 0) {
        showAlert(
          `Available: ${selectedLeaveBalance.remaining} days\n\nPlease choose a different leave type.`,
          `You have no ${leaveType.replace('_', ' ')} days remaining!`,
          'warning'
        );
      }
    } else {
      // Remove leave type from selection
      setActiveLeaveTypes(prev => prev.filter(type => type !== leaveType));
    }
  };

  // Handler for number of days change with validation
  const handleNoDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    
    // Prevent negative values
    if (numValue < 0) {
      showAlert("Number of leave days cannot be negative!", "Invalid Input", "error");
      return;
    }
    
    setNoDays(value);
    
    // Real-time validation against leave balance
    if (numValue > 0 && activeLeaveTypes.length > 0) {
      // Check balance for all selected leave types
      activeLeaveTypes.forEach(leaveType => {
        const selectedLeaveBalance = leaveBalance[leaveType];
        if (selectedLeaveBalance && numValue > selectedLeaveBalance.remaining) {
          showAlert(
            `You entered: ${numValue} days\nAvailable ${leaveType.replace('_', ' ')} days: ${selectedLeaveBalance.remaining}\n\nPlease enter a lower number.`,
            'Insufficient leave balance!',
            'warning'
          );
        }
      });
    }
  };

  // Handler for half/full day selection
  const handleHalfDayChange = (value: string) => {
    setHalfDayLeave(value);
    
    // Adjust number of days if dates are set
    if (fromDate && toDate && fromDate.toDateString() === toDate.toDateString()) {
      setNoDays(value === "half" ? "0.5" : "1");
    } else if (!fromDate && !toDate) {
      // If no dates selected yet
      setNoDays(value === "half" ? "0.5" : "1");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (file.type !== 'application/pdf') {
        showAlert('Please select a PDF file.', 'Only PDF files are allowed', 'error');
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Please select a file smaller than 5MB.', 'File size should not exceed 5MB', 'error');
        return;
      }
      
      setSupportingDocument(file);
    }
  };

  const handleClassAdjustmentChange = (index: number, field: string, value: string) => {
    const newAdjustments = [...classAdjustments];
    newAdjustments[index][field] = value;
    setClassAdjustments(newAdjustments);
  };

  const addClassAdjustmentRow = () => {
    setClassAdjustments([...classAdjustments, { course: "", branch: "", semester: "", subject: "", classTiming: "", concernedTeacher: "" }]);
  };

  const deleteClassAdjustmentRow = (index: number) => {
    const newAdjustments = classAdjustments.filter((_, i) => i !== index);
    setClassAdjustments(newAdjustments.length > 0 ? newAdjustments : [{ course: "", branch: "", semester: "", subject: "", classTiming: "", concernedTeacher: "" }]);
  };

  // Validation function
  const validateLeaveApplication = (): boolean => {
    // Check if number of days is negative
    const daysValue = parseFloat(noDays);
    if (daysValue <= 0) {
      showAlert("Number of leave days cannot be negative or zero!", "Invalid Input", "error");
      return false;
    }

    // Check if at least one leave type is selected
    if (activeLeaveTypes.length === 0) {
      showAlert("Please select at least one leave type!", "Leave Type Required", "warning");
      return false;
    }

    // Check leave balance for all selected leave types
    for (const leaveType of activeLeaveTypes) {
      const selectedLeaveBalance = leaveBalance[leaveType];
      if (!selectedLeaveBalance) {
        showAlert(`Unable to fetch leave balance for ${leaveType.replace('_', ' ')}!`, "Error", "error");
        return false;
      }

      // Check if the selected leave type has 0 balance
      if (selectedLeaveBalance.remaining <= 0) {
        showAlert(
          `Available: ${selectedLeaveBalance.remaining} days\nYou cannot apply for this type of leave.`,
          `You have no ${leaveType.replace('_', ' ')} days remaining!`,
          "warning"
        );
        return false;
      }

      // Check if faculty is trying to apply for more leave than available
      if (daysValue > selectedLeaveBalance.remaining) {
        showAlert(
          `You are trying to apply for: ${daysValue} days\nAvailable ${leaveType.replace('_', ' ')} days: ${selectedLeaveBalance.remaining}\n\nPlease reduce the number of days or remove this leave type.`,
          `Insufficient leave balance for ${leaveType.replace('_', ' ')}!`,
          "warning"
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the leave application before submission
    if (!validateLeaveApplication()) {
      return; // Stop submission if validation fails
    }

    setIsLoading(true);
    setSubmitStatus(null);

    try {
      // Get CSRF token
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      // Create FormData object
      const formData = new FormData();
      
      // Add faculty ID from current user
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('User not authenticated');
      }
      
      // Append form data
      formData.append("faculty", currentUser.id.toString());
      formData.append("leave_type", activeLeaveTypes[0] || ""); // For now, send the first selected leave type
      formData.append("selected_leave_types", JSON.stringify(activeLeaveTypes)); // Send all selected types as JSON
      formData.append("from_date", fromDate ? format(fromDate, "yyyy-MM-dd") : "");
      formData.append("to_date", toDate ? format(toDate, "yyyy-MM-dd") : "");
      formData.append("no_of_days", noDays);
      formData.append("is_half_day", halfDayLeave === "half" ? "true" : "false");
      formData.append("reason", reason);
      formData.append("contact_during_leave", contactDuringLeave);
      formData.append("address_during_leave", addressDuringLeave);
      formData.append("forward_to", forwardTo);
      if (supportingDocument) {
        formData.append("supporting_document", supportingDocument);
      }
      
      // Convert class adjustments to JSON string
      const adjustmentsData = classAdjustments.filter(adj => 
        adj.course || adj.branch || adj.semester || adj.subject || adj.classTiming || adj.concernedTeacher
      );
      
      // API endpoint
      const API_ENDPOINT = "http://localhost:8000/api/faculty/leave/applications/";
      
      // Make API call
      const response = await axios.post(API_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrfToken || '',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` || `Token ${localStorage.getItem('token')}` || ''
        }
      });
      
      // Look up the supervisor for future reference
      const selectedSupervisor = usersInSelectedEmptype.find(s => s.id.toString() === forwardTo);
      console.log("Selected supervisor:", selectedSupervisor);
      
      // NOTE: Leave applications should start with 'pending' status and go through HOD approval first
      // The application will be automatically forwarded to HR only after HOD approval
      // Do not auto-forward to HR here - let the approval workflow handle it
      
      console.log("Leave application created with ID:", response.data?.id, "Status: pending (for HOD approval)");
      
      // Handle class adjustments in a separate call if needed
      if (adjustmentsData.length > 0 && response.data && response.data.id) {
        const leaveId = response.data.id;
        
        // Create class adjustments
        for (const adjustment of adjustmentsData) {
          const adjustmentData = {
            leave_application: leaveId,
            course: adjustment.course,
            branch: adjustment.branch,
            semester: adjustment.semester,
            subject: adjustment.subject,
            class_timing: adjustment.classTiming,
            concerned_teacher: adjustment.concernedTeacher
          };
          
          await axios.post(`http://localhost:8000/api/faculty/leave/class-adjustments/`, adjustmentData, {
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken || '',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}` || `Token ${localStorage.getItem('token')}` || ''
            }
          });
        }
      }
      
      setSubmitStatus("Leave application submitted successfully!");
      
      // Refresh leave balance after successful submission since balance is deducted immediately
      try {
        const updatedBalance = await leaveService.getLeaveBalance();
        setLeaveBalance(updatedBalance);
        console.log("Leave balance refreshed after submission:", updatedBalance);
      } catch (error) {
        console.error("Error refreshing leave balance:", error);
      }
      
      // Reset form fields after successful submission
      setReason("");
      setContactDuringLeave("");
      setAddressDuringLeave("");
      setForwardTo("");
      setHalfDayLeave(""); // Reset half/full day selection
      setSupportingDocument(null);
      setClassAdjustments([{ course: "", branch: "", semester: "", subject: "", classTiming: "", concernedTeacher: "" }]);
      
      // Redirect to leave reports page after a short delay with query parameter
      setTimeout(() => {
        navigate('/faculty/leave/leave-reports?fromApply=true');
      }, 1000);
      
    } catch (error) {
      console.error("Error submitting leave application:", error);
      setSubmitStatus("Failed to submit leave application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="bg-[#8B0000] text-white p-4 mb-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Apply leave</h1>
        </div>
      </div>

      {/* Leave type buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("earned") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("earned", !activeLeaveTypes.includes("earned"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Earn Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.earned?.remaining || 0}
            </span>
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("casual") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("casual", !activeLeaveTypes.includes("casual"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Casual Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.casual?.remaining || 0}
            </span>
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("medical") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("medical", !activeLeaveTypes.includes("medical"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Medical Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.medical?.remaining || 0}
            </span>
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("compensatory") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("compensatory", !activeLeaveTypes.includes("compensatory"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Compensatory Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.compensatory?.remaining || 0}
            </span>
            {leaveBalance.compensatory?.notes && (
              <span className="text-xs mt-1 font-medium bg-gray-200 px-2 py-0.5 rounded-full text-gray-700">
                {leaveBalance.compensatory.notes}
              </span>
            )}
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("semester") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("semester", !activeLeaveTypes.includes("semester"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Semester Break</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.semester?.remaining || 0}
            </span>
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("maternity") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("maternity", !activeLeaveTypes.includes("maternity"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Maternity Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.maternity?.remaining || 0}
            </span>
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("paternity") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("paternity", !activeLeaveTypes.includes("paternity"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Paternity Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.paternity?.remaining || 0}
            </span>
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("extraordinary") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("extraordinary", !activeLeaveTypes.includes("extraordinary"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Extraordinary Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.extraordinary?.remaining || 0}
            </span>
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("academic") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("academic", !activeLeaveTypes.includes("academic"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Academic Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.academic?.remaining || 0}
            </span>
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("duty") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("duty", !activeLeaveTypes.includes("duty"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Duty Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.duty?.remaining || 0}
            </span>
          </div>
        </button>
        <button 
          className={`rounded-lg shadow-md transition-all duration-300 ${activeLeaveTypes.includes("half_pay") 
            ? "bg-[#8B0000] text-white border-2 border-[#8B0000]" 
            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#8B0000] hover:shadow-lg"}`}
          onClick={() => handleLeaveTypeChange("half_pay", !activeLeaveTypes.includes("half_pay"))}
        >
          <div className="p-4 flex flex-col items-center">
            <span className="text-lg font-medium mb-1">Half Pay Leave</span>
            <span className="text-sm opacity-75">
              Available: {loadingLeaveBalance ? "Loading..." : leaveBalance.half_pay?.remaining || 0}
            </span>
          </div>
        </button>
      </div>

      <Card className="border-0 rounded-lg shadow-md">
        <CardContent className="p-0">
          {/* For Applicant Use Only */}
          <div className="bg-slate-800 text-white p-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">For Applicant Use Only</h3>
              <span className="bg-amber-500 text-xs font-semibold px-2 py-0.5 rounded text-slate-800">Important</span>
            </div>
            <p className="text-xs mt-1">Eligible Arrival/Departure: 2 (Per Month for Personal)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0">
            {/* User Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b">
              <div className="border-r p-3">
                <label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-gray-700">DEPARTMENT</label>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B0000] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-sm font-medium">{facultyData?.department || 'N/A'}</p>
                </div>
              </div>
              <div className="border-r p-3">
                <label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-gray-700">EMAIL ADDRESS</label>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B0000] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">{facultyData?.primary_email || 'N/A'}</p>
                </div>
              </div>
              <div className="border-r p-3">
                <label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-gray-700">FACULTY NAME</label>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B0000] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-sm font-medium">{facultyData?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="p-3">
                <label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-gray-700">EMPLOYEE CODE</label>
                <div className="flex items-center mt-1">
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:ring-offset-2 border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200 font-mono">{facultyData?.registration_no || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Duration of Leave */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b">
              <div className="border-r p-3">
                <Label htmlFor="fromDate" className="text-sm text-gray-700">From Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1 h-9 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] focus:bg-[#F3E5E5]",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="border-r p-3">
                <Label htmlFor="toDate" className="text-sm text-gray-700">To Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1 h-9 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] focus:bg-[#F3E5E5]",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="p-3">
                <Label htmlFor="noDays" className="text-sm text-gray-700">No of Days <span className="text-red-500">*</span></Label>
                <Input
                  id="noDays"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Enter no of days"
                  className="h-9 mt-1 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]"
                  value={noDays}
                  onChange={handleNoDaysChange}
                />
              </div>
            </div>

            {/* Type of Leave */}
            <div className="grid grid-cols-1 border-b">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-700">Type of Leave <span className="text-red-500">*</span></Label>
                  <span className="text-xs text-gray-500">
                    Selected: {activeLeaveTypes.length}/2
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  • Casual Leave and Compensatory Leave can be selected together<br/>
                  • Earned Leave and Medical Leave can be selected together<br/>
                  • Other leave types can only be selected individually
                </p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="duty" 
                      value="duty"
                      checked={activeLeaveTypes.includes("duty")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("duty", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="duty" className="text-sm cursor-pointer">Duty Leave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="casual" 
                      value="casual"
                      checked={activeLeaveTypes.includes("casual")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("casual", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="casual" className="text-sm cursor-pointer">Casual Leave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="earned" 
                      value="earned"
                      checked={activeLeaveTypes.includes("earned")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("earned", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="earned" className="text-sm cursor-pointer">Earned Leave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="medical" 
                      value="medical"
                      checked={activeLeaveTypes.includes("medical")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("medical", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="medical" className="text-sm cursor-pointer">Medical Leave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="compensatory" 
                      value="compensatory"
                      checked={activeLeaveTypes.includes("compensatory")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("compensatory", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="compensatory" className="text-sm cursor-pointer">Compensatory Leave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="semester" 
                      value="semester"
                      checked={activeLeaveTypes.includes("semester")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("semester", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="semester" className="text-sm cursor-pointer">Semester Break</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="maternity" 
                      value="maternity"
                      checked={activeLeaveTypes.includes("maternity")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("maternity", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="maternity" className="text-sm cursor-pointer">Maternity Leave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="paternity" 
                      value="paternity"
                      checked={activeLeaveTypes.includes("paternity")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("paternity", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="paternity" className="text-sm cursor-pointer">Paternity Leave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="extraordinary" 
                      value="extraordinary"
                      checked={activeLeaveTypes.includes("extraordinary")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("extraordinary", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="extraordinary" className="text-sm cursor-pointer">Extraordinary Leave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="academic" 
                      value="academic"
                      checked={activeLeaveTypes.includes("academic")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("academic", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="academic" className="text-sm cursor-pointer">Academic Leave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MultiRadioItem 
                      id="half_pay" 
                      value="half_pay"
                      checked={activeLeaveTypes.includes("half_pay")}
                      onCheckedChange={(checked) => handleLeaveTypeChange("half_pay", checked)}
                      className="text-[#8B0000] focus:ring-[#8B0000]" 
                    />
                    <Label htmlFor="half_pay" className="text-sm cursor-pointer">Half Pay Leave</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Purpose of absence */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b">
              <div className="border-r p-3 md:col-span-2">
                <Label className="text-sm text-gray-700">Purpose of absence <span className="text-red-500">*</span></Label>
                <Textarea placeholder="Enter reason for leave" className="min-h-[100px] focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]" value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <div className="p-3">
                <Label className="text-sm text-gray-700">Half/Full L</Label>
                <Select value={halfDayLeave} onValueChange={handleHalfDayChange}>
                  <SelectTrigger className="h-9 mt-1 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] focus:bg-[#F3E5E5]">
                    <SelectValue placeholder="Select leave duration" />
                  </SelectTrigger>
                  <SelectContent className="[&_[data-state=checked]]:bg-[#F3E5E5] [&_[data-state=checked]]:text-[#8B0000] [&_[data-highlighted]]:bg-[#F3E5E5] [&_[data-highlighted]]:text-[#8B0000]">
                    <SelectItem value="full">Full Day</SelectItem>
                    <SelectItem value="half">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b">
              <div className="border-r p-3">
                <Label className="text-sm text-gray-700">Address during leave</Label>
                <Input type="text" placeholder="Enter address during leave" className="focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]" value={addressDuringLeave} onChange={(e) => setAddressDuringLeave(e.target.value)} />
              </div>
              <div className="p-3">
                <Label className="text-sm text-gray-700">Contact No. <span className="text-red-500">*</span></Label>
                <Input type="text" placeholder="Enter contact number" className="focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]" value={contactDuringLeave} onChange={(e) => setContactDuringLeave(e.target.value)} />
              </div>
            </div>

            {/* Forward To and Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b">
              <div className="border-r p-3">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Forward To <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-4">
                  {/* Step 1: Select employee type */}
                  <div>
                    <Label className="text-sm text-gray-600">Select Employee Type</Label>
                    <Select 
                      onValueChange={handleEmptypeChange} 
                      value={selectedEmptype}
                    >
                      <SelectTrigger className="mt-1 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] focus:bg-[#F3E5E5]">
                        <SelectValue placeholder="Select employee type" />
                      </SelectTrigger>
                      <SelectContent className="[&_[data-state=checked]]:bg-[#F3E5E5] [&_[data-state=checked]]:text-[#8B0000] [&_[data-highlighted]]:bg-[#F3E5E5] [&_[data-highlighted]]:text-[#8B0000]">
                        {loadingEmptypes ? (
                          <SelectItem value="loading" disabled>Loading employee types...</SelectItem>
                        ) : emptypesData && emptypesData.emptypes && emptypesData.emptypes.length > 0 ? (
                          emptypesData.emptypes.map((emptype) => (
                            <SelectItem key={emptype} value={emptype}>
                              {emptype.toUpperCase()}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No employee types found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Step 2: Select person from chosen emptype */}
                  {selectedEmptype && (
                    <div>
                      <Label className="text-sm text-gray-600">Select Person</Label>
                      <Select 
                        onValueChange={handleUserSelection}
                        value={forwardTo}
                      >
                    <SelectTrigger className="mt-1 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] focus:bg-[#F3E5E5]">
                          <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent className="[&_[data-state=checked]]:bg-[#F3E5E5] [&_[data-state=checked]]:text-[#8B0000] [&_[data-highlighted]]:bg-[#F3E5E5] [&_[data-highlighted]]:text-[#8B0000]">
                          {usersInSelectedEmptype.length > 0 ? (
                            usersInSelectedEmptype.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name} - {user.department || 'No department'}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No users found for this type</SelectItem>
                          )}
                    </SelectContent>
                  </Select>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Select the appropriate authority to forward your leave application</p>
              </div>
              <div className="p-3">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload Supporting Documents</Label>
                <div className="mt-1">
                  <div className="relative group">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-all duration-300 hover:border-[#8B0000] hover:bg-gray-50 group-hover:border-[#8B0000]">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="rounded-full bg-gray-100 p-3 group-hover:bg-red-50 transition-colors duration-300">
                          <svg 
                            className="w-6 h-6 text-gray-500 group-hover:text-[#8B0000] transition-colors duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            Drag and drop your PDF files here, or
                          </p>
                          <label className="mt-2 inline-flex items-center px-4 py-2 bg-[#8B0000] text-white text-sm font-medium rounded-md hover:bg-[#700000] transition-colors duration-300 cursor-pointer">
                            Browse Files
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".pdf"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          (Only PDF files are allowed, max size: 5MB)
                        </p>
                      </div>
                    </div>
                    {/* File list preview */}
                    <div className="mt-3 space-y-2">
                      {supportingDocument && (
                        <div className="file-preview">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">{supportingDocument.name}</span>
                            </div>
                            <button 
                              type="button"
                              className="text-gray-500 hover:text-red-600 transition-colors duration-300"
                              onClick={() => setSupportingDocument(null)}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Class adjustments table */}
            <div className="p-3 border-b">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Class Adjustments</h3>
                {isLoading && (
                  <span className="text-xs text-amber-600">Processing...</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border text-left w-10">#</th>
                      <th className="p-2 border text-left">Course</th>
                      <th className="p-2 border text-left">Branch</th>
                      <th className="p-2 border text-left">Semester</th>
                      <th className="p-2 border text-left">Subject</th>
                      <th className="p-2 border text-left">ClassTiming</th>
                      <th className="p-2 border text-left">Concerned Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classAdjustments.map((adjustment, index) => (
                      <tr key={index}>
                      <td className="p-2 border">
                        <Checkbox disabled /> {/* We might need a way to select rows for deletion or other actions, for now, it's a placeholder */}
                      </td>
                      <td className="p-2 border">
                        <Input className="h-8 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]" placeholder="Enter course" value={adjustment.course} onChange={(e) => handleClassAdjustmentChange(index, 'course', e.target.value)} />
                      </td>
                      <td className="p-2 border">
                        <Input className="h-8 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]" placeholder="Enter branch" value={adjustment.branch} onChange={(e) => handleClassAdjustmentChange(index, 'branch', e.target.value)} />
                      </td>
                      <td className="p-2 border">
                        <Input className="h-8 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]" placeholder="Enter semester" value={adjustment.semester} onChange={(e) => handleClassAdjustmentChange(index, 'semester', e.target.value)} />
                      </td>
                      <td className="p-2 border">
                        <Input className="h-8 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]" placeholder="Enter subject" value={adjustment.subject} onChange={(e) => handleClassAdjustmentChange(index, 'subject', e.target.value)} />
                      </td>
                      <td className="p-2 border">
                        <Input className="h-8 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]" placeholder="Enter class timing" value={adjustment.classTiming} onChange={(e) => handleClassAdjustmentChange(index, 'classTiming', e.target.value)} />
                      </td>
                      <td className="p-2 border">
                        <Input className="h-8 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]" placeholder="Enter teacher name" value={adjustment.concernedTeacher} onChange={(e) => handleClassAdjustmentChange(index, 'concernedTeacher', e.target.value)} />
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-2 gap-2">
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={addClassAdjustmentRow}>Add</Button>
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => classAdjustments.length > 1 && deleteClassAdjustmentRow(classAdjustments.length - 1)} disabled={classAdjustments.length <= 1}>Delete Last</Button> {/* Example: Delete last row */}
              </div>
            </div>

            {/* Apply button */}
            <div className="p-3 flex justify-end">
              <Button 
                type="submit" 
                className="bg-[#8B0000] hover:bg-[#700000] uppercase disabled:opacity-50"
                disabled={isLoading || loadingLeaveBalance || loadingEmptypes}
              >
                {isLoading ? 'APPLYING...' : 'APPLY'}
              </Button>
            </div>
          </form>
          {submitStatus && (
            <div className={`mt-4 p-3 rounded-md text-sm ${submitStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {submitStatus}
            </div>
          )}
          {(loadingLeaveBalance || loadingEmptypes) && (
            <div className="mt-4 p-3 rounded-md text-sm bg-blue-100 text-blue-700">
              {loadingLeaveBalance && loadingEmptypes ? 'Loading leave balance and employee data...' : 
               loadingLeaveBalance ? 'Loading leave balance...' : 
               'Loading employee data...'}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Custom Alert Dialog */}
      <AlertDialogCustom
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog(prev => ({ ...prev, open }))}
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
      />
    </div>
  );
}