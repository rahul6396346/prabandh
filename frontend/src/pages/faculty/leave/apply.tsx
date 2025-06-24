import React, { useState, useEffect } from "react";
import authService from "@/services/authService";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Building2, 
  FileText, 
  Calendar, 
  ClipboardList, 
  Clock, 
  AlertCircle, 
  User, 
  Briefcase,
  Check,
  Info,
  RefreshCw,
  ChevronDown,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import leaveService from "@/services/leaveService";
import { usePoll } from "@/hooks/usePoll";

export default function ApplyLeave() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [faculty, setFaculty] = useState<any>({
    name: "",
    department: "",
    employeeCode: "",
    email: ""
  });
  const [leaveBalances, setLeaveBalances] = useState({
    casual: { total: 0, used: 0, remaining: 0 },
    earned: { total: 0, used: 0, remaining: 0 },
    medical: { total: 0, used: 0, remaining: 0 },
    compensatory: { total: 0, used: 0, remaining: 0 },
    semesterBreak: { total: 0, used: 0, remaining: 0 },
    maternity: { total: 0, used: 0, remaining: 0 },
    paternity: { total: 0, used: 0, remaining: 0 },
    study: { total: 0, used: 0, remaining: 0 },
    special: { total: 0, used: 0, remaining: 0 },
    emergency: { total: 0, used: 0, remaining: 0 },
    bereavement: { total: 0, used: 0, remaining: 0 },
    festival: { total: 0, used: 0, remaining: 0 },
    duty: { total: 0, used: 0, remaining: 0 },
    extraordinary: { total: 0, used: 0, remaining: 0 },
    academic: { total: 0, used: 0, remaining: 0 },
    halfPay: { total: 0, used: 0, remaining: 0 }
  });
  const [arrivalDeparture, setArrivalDeparture] = useState({
    total: 0,
    used: 0,
    remaining: 0
  });
  
  // Define the polling callback function
  const pollCallback = async (silent: boolean) => {
    try {
      if (!silent) {
        setIsRefreshing(true);
      }
      
      // Only fetch leave balances during polling, not faculty details
      // Faculty details don't change frequently and are already loaded
      const balances = await leaveService.getLeaveBalance();
      
      // Update leave balances from API response
      setLeaveBalances({
        casual: { 
          total: balances.casual?.total || 15, 
          used: balances.casual?.used || 0, 
          remaining: balances.casual?.remaining || 15 
        },
        earned: { 
          total: balances.earned?.total || 15, 
          used: balances.earned?.used || 0, 
          remaining: balances.earned?.remaining || 15 
        },
        medical: { 
          total: balances.medical?.total || 12, 
          used: balances.medical?.used || 0, 
          remaining: balances.medical?.remaining || 12 
        },
        compensatory: { 
          total: balances.compensatory?.total || 8, 
          used: balances.compensatory?.used || 6, 
          remaining: balances.compensatory?.remaining || 2 
        },
        semesterBreak: { 
          total: balances.semester?.total || 5, 
          used: balances.semester?.used || 0, 
          remaining: balances.semester?.remaining || 5 
        },
        maternity: { 
          total: balances.maternity?.total || 180, 
          used: balances.maternity?.used || 0, 
          remaining: balances.maternity?.remaining || 180 
        },
        paternity: { 
          total: balances.paternity?.total || 15, 
          used: balances.paternity?.used || 0, 
          remaining: balances.paternity?.remaining || 15 
        },
        study: { 
          total: balances.study?.total || 30, 
          used: balances.study?.used || 0, 
          remaining: balances.study?.remaining || 30 
        },
        special: { 
          total: balances.special?.total || 10, 
          used: balances.special?.used || 0, 
          remaining: balances.special?.remaining || 10 
        },
        emergency: { 
          total: balances.emergency?.total || 7, 
          used: balances.emergency?.used || 0, 
          remaining: balances.emergency?.remaining || 7 
        },
        bereavement: { 
          total: balances.bereavement?.total || 5, 
          used: balances.bereavement?.used || 0, 
          remaining: balances.bereavement?.remaining || 5 
        },
        festival: { 
          total: balances.festival?.total || 3, 
          used: balances.festival?.used || 0, 
          remaining: balances.festival?.remaining || 3 
        },
        duty: { 
          total: balances.duty?.total || 15, 
          used: balances.duty?.used || 0, 
          remaining: balances.duty?.remaining || 15 
        },
        extraordinary: { 
          total: balances.extraordinary?.total || 5, 
          used: balances.extraordinary?.used || 0, 
          remaining: balances.extraordinary?.remaining || 5 
        },
        academic: { 
          total: balances.academic?.total || 30, 
          used: balances.academic?.used || 0, 
          remaining: balances.academic?.remaining || 30 
        },
        halfPay: { 
          total: balances.halfPay?.total || 20, 
          used: balances.halfPay?.used || 0, 
          remaining: balances.halfPay?.remaining || 20 
        }
      });
      
      // Update arrival/departure data if available in API response
      if (balances.arrival_departure) {
        setArrivalDeparture({
          total: balances.arrival_departure.total || 2,
          used: balances.arrival_departure.used || 1,
          remaining: balances.arrival_departure.remaining || 1
        });
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      // Fallback to default values if API fails
    } finally {
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  };

  // Initialize polling with dynamic interval support
  const {
    pollingEnabled,
    setPollingEnabled,
    lastPolled,
    isPolling,
    manualRefresh,
    updateInterval,
    currentInterval
  } = usePoll({
    interval: 100, // Default 100 milliseconds for fast updates
    initialEnabled: true,
    callback: pollCallback,
    onError: (error) => {
      console.error("Polling error:", error);
    }
  });
  
  useEffect(() => {
    // Load faculty details initially
    loadFacultyDetails();
    
    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 100);
    
    return () => clearInterval(clockInterval);
  }, []);
  
  const loadFacultyDetails = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setFaculty({
        name: currentUser.name || "Faculty Name",
        department: currentUser.department || "Department",
        employeeCode: currentUser.registration_no || "Employee Code",
        email: currentUser.primary_email || currentUser.official_email || "faculty@example.com"
      });
    }
  };
  
  const fetchLeaveBalances = async () => {
    try {
      setIsRefreshing(true);
      const balances = await leaveService.getLeaveBalance();
      
      // Update leave balances from API response
      setLeaveBalances({
        casual: { 
          total: balances.casual?.total || 15, 
          used: balances.casual?.used || 0, 
          remaining: balances.casual?.remaining || 15 
        },
        earned: { 
          total: balances.earned?.total || 15, 
          used: balances.earned?.used || 0, 
          remaining: balances.earned?.remaining || 15 
        },
        medical: { 
          total: balances.medical?.total || 12, 
          used: balances.medical?.used || 0, 
          remaining: balances.medical?.remaining || 12 
        },
        compensatory: { 
          total: balances.compensatory?.total || 8, 
          used: balances.compensatory?.used || 6, 
          remaining: balances.compensatory?.remaining || 2 
        },
        semesterBreak: { 
          total: balances.semester?.total || 5, 
          used: balances.semester?.used || 0, 
          remaining: balances.semester?.remaining || 5 
        },
        maternity: { 
          total: balances.maternity?.total || 180, 
          used: balances.maternity?.used || 0, 
          remaining: balances.maternity?.remaining || 180 
        },
        paternity: { 
          total: balances.paternity?.total || 15, 
          used: balances.paternity?.used || 0, 
          remaining: balances.paternity?.remaining || 15 
        },
        study: { 
          total: balances.study?.total || 30, 
          used: balances.study?.used || 0, 
          remaining: balances.study?.remaining || 30 
        },
        special: { 
          total: balances.special?.total || 10, 
          used: balances.special?.used || 0, 
          remaining: balances.special?.remaining || 10 
        },
        emergency: { 
          total: balances.emergency?.total || 7, 
          used: balances.emergency?.used || 0, 
          remaining: balances.emergency?.remaining || 7 
        },
        bereavement: { 
          total: balances.bereavement?.total || 5, 
          used: balances.bereavement?.used || 0, 
          remaining: balances.bereavement?.remaining || 5 
        },
        festival: { 
          total: balances.festival?.total || 3, 
          used: balances.festival?.used || 0, 
          remaining: balances.festival?.remaining || 3 
        },
        duty: { 
          total: balances.duty?.total || 15, 
          used: balances.duty?.used || 0, 
          remaining: balances.duty?.remaining || 15 
        },
        extraordinary: { 
          total: balances.extraordinary?.total || 5, 
          used: balances.extraordinary?.used || 0, 
          remaining: balances.extraordinary?.remaining || 5 
        },
        academic: { 
          total: balances.academic?.total || 30, 
          used: balances.academic?.used || 0, 
          remaining: balances.academic?.remaining || 30 
        },
        halfPay: { 
          total: balances.halfPay?.total || 20, 
          used: balances.halfPay?.used || 0, 
          remaining: balances.halfPay?.remaining || 20 
        }
      });
      
      // Update arrival/departure data if available in API response
      if (balances.arrival_departure) {
        setArrivalDeparture({
          total: balances.arrival_departure.total || 2,
          used: balances.arrival_departure.used || 1,
          remaining: balances.arrival_departure.remaining || 1
        });
      }
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      // Fallback to default values if API fails
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const refreshData = () => {
    manualRefresh();
  };
  
  return (
    <div className="container mx-auto p-8">
      {/* Leave Balance Summary Card */}
      <Card className="mb-8 border-0 shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] py-4 px-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Leave Balance Summary</span>
              </CardTitle>
              <CardDescription className="text-white/80 mt-1">
                Quick overview of your leave balances and limits
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Manual Refresh Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={manualRefresh}
                disabled={isPolling}
                className="bg-blue-500/20 text-white hover:bg-blue-600/40 hover:text-white border-blue-400/40 h-8 px-3 transition-all duration-300 font-medium"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isPolling ? 'animate-spin' : ''}`} />
                <span className="text-xs">Refresh</span>
              </Button>
              
              {/* Auto Refresh Toggle */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPollingEnabled(!pollingEnabled)}
                className={`${pollingEnabled ? 'bg-green-500/20 text-white hover:bg-green-600/40 hover:text-white hover:border-green-300/60 border-green-400/40' : 'bg-white/20 text-white hover:bg-white/40 hover:text-white hover:border-white/60 border-white/40'} h-8 transition-all duration-300 font-medium`}>
                {pollingEnabled ? (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="text-xs font-semibold">Live</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-gray-400 mr-1"></div>
                    <span className="text-xs font-semibold">Manual</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          {/* Enhanced real-time status indicator */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className={`h-3 w-3 rounded-full ${pollingEnabled ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-white font-medium">
                  {pollingEnabled ? `Auto-refreshing` : 'Auto-refresh disabled'}
                </span>
              </div>
              {lastPolled && (
                <>
                  <span className="text-white/60">•</span>
                  <span className="text-xs text-white/80">
                    Last updated: {lastPolled.toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* User Info Section */}
          <div className="bg-gray-50 border-b px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase">Faculty Name</div>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-800">{faculty.name}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase">Department</div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-800">{faculty.department}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase">Employee Code</div>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-mono">{faculty.employeeCode}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase">Email</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-blue-600 hover:underline cursor-pointer">{faculty.email}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Leave Balances Section */}
          <div className="px-6 py-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-[#8B0000]" />
                <span>Available Leave Balances</span>
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                  <span>Scroll →</span>
                </div>
              </h3>
              <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                <div className="flex gap-6 px-1" style={{ minWidth: '2400px' }}>
                {/* Casual Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Casual Leave</h4>
                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600">CL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.casual.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.casual.used}</span> used of {leaveBalances.casual.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.casual.used / leaveBalances.casual.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Earned Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Earned Leave</h4>
                    <Badge className="bg-green-50 text-green-600 hover:bg-green-50 hover:text-green-600">EL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.earned.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.earned.used}</span> used of {leaveBalances.earned.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-green-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.earned.used / leaveBalances.earned.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Medical Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Medical Leave</h4>
                    <Badge className="bg-red-50 text-red-600 hover:bg-red-50 hover:text-red-600">ML</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.medical.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.medical.used}</span> used of {leaveBalances.medical.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-red-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.medical.used / leaveBalances.medical.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Compensatory Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Compensatory</h4>
                    <Badge className="bg-purple-50 text-purple-600 hover:bg-purple-50 hover:text-purple-600">CML</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.compensatory.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.compensatory.used}</span> used of {leaveBalances.compensatory.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.compensatory.used / leaveBalances.compensatory.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Semester Break */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Semester Break</h4>
                    <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 hover:text-amber-600">SB</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.semesterBreak.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.semesterBreak.used}</span> used of {leaveBalances.semesterBreak.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-amber-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.semesterBreak.used / leaveBalances.semesterBreak.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Maternity Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Maternity Leave</h4>
                    <Badge className="bg-pink-50 text-pink-600 hover:bg-pink-50 hover:text-pink-600">MTL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.maternity.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.maternity.used}</span> used of {leaveBalances.maternity.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-pink-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.maternity.used / leaveBalances.maternity.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Paternity Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Paternity Leave</h4>
                    <Badge className="bg-cyan-50 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-600">PTL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.paternity.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.paternity.used}</span> used of {leaveBalances.paternity.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-cyan-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.paternity.used / leaveBalances.paternity.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Study Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Study Leave</h4>
                    <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600">STL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.study.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.study.used}</span> used of {leaveBalances.study.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.study.used / leaveBalances.study.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Special Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Special Leave</h4>
                    <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-600">SPL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.special.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.special.used}</span> used of {leaveBalances.special.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-orange-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.special.used / leaveBalances.special.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Emergency Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Emergency Leave</h4>
                    <Badge className="bg-red-50 text-red-600 hover:bg-red-50 hover:text-red-600">EML</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.emergency.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.emergency.used}</span> used of {leaveBalances.emergency.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-red-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.emergency.used / leaveBalances.emergency.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Bereavement Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Bereavement</h4>
                    <Badge className="bg-gray-50 text-gray-600 hover:bg-gray-50 hover:text-gray-600">BL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.bereavement.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.bereavement.used}</span> used of {leaveBalances.bereavement.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-gray-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.bereavement.used / leaveBalances.bereavement.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Festival Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Festival Leave</h4>
                    <Badge className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-600">FL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.festival.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.festival.used}</span> used of {leaveBalances.festival.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-yellow-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.festival.used / leaveBalances.festival.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Duty Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Duty Leave</h4>
                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600">DL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.duty.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.duty.used}</span> used of {leaveBalances.duty.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.duty.used / leaveBalances.duty.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Extraordinary Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Extraordinary Leave</h4>
                    <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-50 hover:text-rose-600">EXL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.extraordinary.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.extraordinary.used}</span> used of {leaveBalances.extraordinary.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-rose-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.extraordinary.used / leaveBalances.extraordinary.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Academic Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Academic Leave</h4>
                    <Badge className="bg-violet-50 text-violet-600 hover:bg-violet-50 hover:text-violet-600">AL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.academic.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.academic.used}</span> used of {leaveBalances.academic.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-violet-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.academic.used / leaveBalances.academic.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Half Pay Leave */}
                <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex-shrink-0 hover:shadow-lg transition-shadow duration-200" style={{ minWidth: '200px', width: '200px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Half Pay Leave</h4>
                    <Badge className="bg-slate-50 text-slate-600 hover:bg-slate-50 hover:text-slate-600">HPL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">{leaveBalances.halfPay.remaining}</div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{leaveBalances.halfPay.used}</span> used of {leaveBalances.halfPay.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-slate-600 h-full rounded-full" 
                      style={{ width: `${(leaveBalances.halfPay.used / leaveBalances.halfPay.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Arrival/Departure Limits */}
            <div className="mt-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-amber-100 p-1.5 rounded-full">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Arrival/Departure Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#8B0000]" />
                      <span className="text-sm text-gray-600">Personal: </span>
                      <Badge className="bg-[#8B0000]/10 text-[#8B0000] hover:bg-[#8B0000]/20">
                        {arrivalDeparture.used}/{arrivalDeparture.total} Used
                      </Badge>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#8B0000]" />
                      <span className="text-sm text-gray-600">Eligible period: </span>
                      <span className="text-sm font-medium text-gray-700">3 days before/after from current date</span>
                    </div>
                  </div>
                </div>                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Apply Leaves Card */}
          <Link to="/faculty/leave/apply-form" className="block">
            <Card className="shadow-lg border-0 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] transform group cursor-pointer h-full">
              <CardHeader className="bg-[#F9E0E0] p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/40 p-3 rounded-lg group-hover:bg-white/60 transition-all duration-300">
                    <Building2 className="text-[#8B0000] h-10 w-10 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-[#8B0000] text-3xl font-bold">Apply Leaves</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-b from-white to-[#F9E0E0]/10">
                <div className="text-[#8B0000] group-hover:text-[#700000] text-lg font-medium py-3 px-4 rounded-md group-hover:bg-[#F9E0E0]/30 transition-all duration-300">
                  Apply CL, EL, Medical etc. Leaves here
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Leaves Reports Card */}
          <Link to="/faculty/leave/leave-reports" className="block">
            <Card className="shadow-lg border-0 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] transform group cursor-pointer h-full">
              <CardHeader className="bg-[#E0F0E9] p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/40 p-3 rounded-lg group-hover:bg-white/60 transition-all duration-300">
                    <FileText className="text-[#38786F] h-10 w-10 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-[#38786F] text-3xl font-bold">Leaves Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-b from-white to-[#E0F0E9]/10">
                <div className="text-[#38786F] group-hover:text-[#205E55] text-lg font-medium py-3 px-4 rounded-md group-hover:bg-[#E0F0E9]/30 transition-all duration-300">
                  View CL, EL, Medical etc. leaves Report
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Arrival/Departure Card */}
          <Link to="/faculty/leave/arrival-departure" className="block">
            <Card className="shadow-lg border-0 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] transform group cursor-pointer h-full">
              <CardHeader className="bg-[#E0F0F9] p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/40 p-3 rounded-lg group-hover:bg-white/60 transition-all duration-300">
                    <Calendar className="text-[#3878A6] h-10 w-10 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-[#3878A6] text-3xl font-bold">Arrival/Departure</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-b from-white to-[#E0F0F9]/10">
                <div className="text-[#3878A6] group-hover:text-[#205C90] text-lg font-medium py-3 px-4 rounded-md group-hover:bg-[#E0F0F9]/30 transition-all duration-300">
                  Apply Arrival/Departure/Duty Slip (w.e.f. 01/Feb/2020)
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* View Reports Card */}
          <Link to="/faculty/leave/duty-reports" className="block">
            <Card className="shadow-lg border-0 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] transform group cursor-pointer h-full">
              <CardHeader className="bg-[#E0F0E9] p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/40 p-3 rounded-lg group-hover:bg-white/60 transition-all duration-300">
                    <ClipboardList className="text-[#38786F] h-10 w-10 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-[#38786F] text-3xl font-bold">View Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-b from-white to-[#E0F0E9]/10">
                <div className="text-[#38786F] group-hover:text-[#205E55] text-lg font-medium py-3 px-4 rounded-md group-hover:bg-[#E0F0E9]/30 transition-all duration-300">
                  View Arrival/Departure/Duty Slip Report
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}