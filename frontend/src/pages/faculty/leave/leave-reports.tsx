import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, Eye, FileText, Search, FileSpreadsheet, Clock, ArrowUpDown, Filter, Calendar as CalendarIcon2, Activity, Clock as ClockIcon, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import leaveService, { LeaveApplication } from "@/services/leaveService";
import authService from "@/services/authService";

const LeaveReports = () => {
  // Date filtering state
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [leaveReports, setLeaveReports] = useState<LeaveApplication[]>([]);
  const [filteredReports, setFilteredReports] = useState<LeaveApplication[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(true);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Get location to check if we're navigating from the apply form
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromApplyForm = searchParams.get('fromApply') === 'true';

  // Highlight row on hover
  const handleRowHover = (id: number | null) => {
    setActiveRow(id);
  };

  // Initial data load - runs only once
  useEffect(() => {
    console.log('LeaveReports mounted');
    console.log('Current URL params:', Object.fromEntries(searchParams.entries()));
    console.log('Coming from apply form?', fromApplyForm);
    
    // Only fetch data once when component mounts
    if (!initialDataLoaded) {
      fetchLeaveReports();
      setInitialDataLoaded(true);
    }
    
    // Set up polling for real-time updates
    pollingInterval.current = setInterval(() => {
      if (pollingEnabled) {
        fetchLeaveReports(true); // Silent refresh
      }
    }, 30000); // Refresh every 30 seconds
    
    // Clean up interval on component unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [pollingEnabled]);

  // Refresh data if we're coming from apply form
  useEffect(() => {
    if (fromApplyForm) {
      console.log('Triggered refresh from apply form redirect');
      fetchLeaveReports();
    }
  }, [fromApplyForm]);

  // Tab change handler
  useEffect(() => {
    console.log('Tab changed to:', activeTab);
    fetchLeaveReports();
  }, [activeTab]);

  // Apply filters manually, don't auto-filter on date changes
  useEffect(() => {
    if (leaveReports.length > 0) {
      applyFilters();
    }
  }, [leaveReports, searchTerm, filterType]);

  const applyFilters = () => {
    console.log('Applying filters, leave reports count:', leaveReports.length);
    if (!leaveReports.length) {
      setFilteredReports([]);
      return;
    }
    
    let filtered = [...leaveReports];
    
    // Apply date filters only if both dates are selected
    if (fromDate && toDate) {
      console.log('Filtering by date range:', fromDate, toDate);
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.from_date);
        return reportDate >= fromDate && reportDate <= toDate;
      });
    }
    
    // Apply leave type filter
    if (filterType !== "all") {
      console.log('Filtering by leave type:', filterType);
      filtered = filtered.filter(report => 
        report.leave_type.toLowerCase() === filterType.toLowerCase()
      );
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      console.log('Filtering by search term:', searchTerm);
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.reason?.toLowerCase().includes(searchLower) ||
        report.forward_to?.toLowerCase().includes(searchLower) ||
        report.status?.toLowerCase().includes(searchLower)
      );
    }
    
    console.log('Filtered results count:', filtered.length);
    setFilteredReports(filtered);
  };

  const fetchLeaveReports = async (silent: boolean = false) => {
    console.log('Fetch leave reports started with activeTab:', activeTab);
    
    // Debug user data
    const userData = localStorage.getItem('user');
    const currentUser = authService.getCurrentUser();
    console.log('User from localStorage:', userData);
    console.log('Current User from authService:', currentUser);
    
    if (!silent) {
      setIsLoading(true);
    }
    try {
      let reports;
      switch (activeTab) {
        case "pending":
          reports = await leaveService.getPendingLeaves();
          break;
        case "approved":
          reports = await leaveService.getApprovedLeaves();
          break;
        case "rejected":
          reports = await leaveService.getRejectedLeaves();
          break;
        default:
          reports = await leaveService.getAllLeaves();
          break;
      }
      console.log('Fetch results:', reports);
      
      if (reports && Array.isArray(reports)) {
        setLeaveReports(reports);
        // Only update filtered reports if no filters are applied
        if (filterType === "all" && !searchTerm && !fromDate && !toDate) {
          setFilteredReports(reports);
        } else {
          // Otherwise, reapply filters to the new data
          applyFiltersToData(reports);
        }
      }
    } catch (error) {
      console.error("Error fetching leave reports:", error);
      if (!silent) {
        setLeaveReports([]);
        setFilteredReports([]);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  // Apply current filters to new data
  const applyFiltersToData = (data) => {
    let filtered = [...data];
    
    // Filter by leave type
    if (filterType && filterType !== 'all') {
      filtered = filtered.filter(leave => leave.leave_type === filterType);
    }
    
    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter(leave => new Date(leave.from_date) >= fromDate);
    }
    
    if (toDate) {
      filtered = filtered.filter(leave => new Date(leave.to_date) <= toDate);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(leave => 
        leave.reason.toLowerCase().includes(term) || 
        leave.status.toLowerCase().includes(term)
      );
    }
    
    setFilteredReports(filtered);
  };

  // Manual refresh handler with visual feedback
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaveReports();
    setTimeout(() => setRefreshing(false), 500); // Visual feedback for the refresh action
  };

  const handleSearch = () => {
    applyFilters();
  };

  // Badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "sanctioned":
      case "approved":
      case "approved_by_hr":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "recommended":
      case "forwarded_to_hr":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "forwarded_to_dean":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "forwarded_to_vc":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "rejected":
      case "rejected_by_hr":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };
  
  // Format status for display
  const formatStatus = (status) => {
    switch (status.toLowerCase()) {
      case "approved_by_hr":
        return "Approved by HR";
      case "rejected_by_hr":
        return "Rejected by HR";
      case "forwarded_to_hr":
        return "Pending HR Approval";
      case "forwarded_to_dean":
        return "Forwarded to Dean";
      case "forwarded_to_vc":
        return "Forwarded to VC";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Add tabs for different leave statuses
  const renderTabs = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
      <button
        onClick={() => setActiveTab("all")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "all" ? "bg-white shadow-sm text-[#8B0000]" : "text-gray-600 hover:text-[#8B0000] hover:bg-white/50"}`}
      >
        All Requests
      </button>
      <button
        onClick={() => setActiveTab("pending")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "pending" ? "bg-white shadow-sm text-[#8B0000]" : "text-gray-600 hover:text-[#8B0000] hover:bg-white/50"}`}
      >
        Pending Requests
      </button>
      <button
        onClick={() => setActiveTab("approved")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "approved" ? "bg-white shadow-sm text-[#8B0000]" : "text-gray-600 hover:text-[#8B0000] hover:bg-white/50"}`}
      >
        Approved Requests
      </button>
      <button
        onClick={() => setActiveTab("rejected")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "rejected" ? "bg-white shadow-sm text-[#8B0000]" : "text-gray-600 hover:text-[#8B0000] hover:bg-white/50"}`}
      >
        Rejected Requests
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <Card className="mb-6 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] py-3 px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span>Report Leave</span>
            </CardTitle>
            <div className="flex items-center gap-2">
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Tabs */}
      {renderTabs()}
      
      {/* Date Filter Card */}
      <Card className="mb-6 border-0 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="space-y-2 md:col-span-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-[#8B0000]" />
                From Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 rounded-md border-gray-300 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5] hover:bg-[#F3E5E5] hover:text-[#8B0000] transition-all duration-200 shadow-sm",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    {fromDate ? format(fromDate, "PPP") : <span>Select date...</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 text-[#8B0000]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[#8B0000]/20 shadow-lg rounded-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate || undefined}
                    onSelect={(date) => {
                      setFromDate(date);
                      // Manually apply filters after date changes
                      setTimeout(() => applyFilters(), 100);
                    }}
                    initialFocus
                    className="[&_.selected]:bg-[#8B0000] [&_.selected]:text-white [&_.selected]:border-[#8B0000] [&_.selected]:ring-[#8B0000] [&_button:hover]:bg-[#F3E5E5]"
                  />
                </PopoverContent>
              </Popover>
            </div>
    
            <div className="space-y-2 md:col-span-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-[#8B0000]" />
                To Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 rounded-md border-gray-300 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5] hover:bg-[#F3E5E5] hover:text-[#8B0000] transition-all duration-200 shadow-sm",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    {toDate ? format(toDate, "PPP") : <span>Select date...</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 text-[#8B0000]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[#8B0000]/20 shadow-lg rounded-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate || undefined}
                    onSelect={(date) => {
                      setToDate(date);
                      // Manually apply filters after date changes
                      setTimeout(() => applyFilters(), 100);
                    }}
                    initialFocus
                    className="[&_.selected]:bg-[#8B0000] [&_.selected]:text-white [&_.selected]:border-[#8B0000] [&_.selected]:ring-[#8B0000] [&_button:hover]:bg-[#F3E5E5]"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-[#8B0000]" />
                Leave Type
              </Label>
              <Select value={filterType} onValueChange={(value) => {
                setFilterType(value);
                setTimeout(() => applyFilters(), 100);
              }}>
                <SelectTrigger className="h-10 rounded-md border-gray-300 focus:ring-[#8B0000] focus:ring-offset-[#F3E5E5] hover:border-[#8B0000]/50 transition-all duration-200 shadow-sm">
                  <SelectValue placeholder="Filter by leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="compensatory">Compensatory Leave</SelectItem>
                  <SelectItem value="earned">Earned Leave</SelectItem>
                  <SelectItem value="medical">Medical Leave</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="duty">Duty Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-[#8B0000]" />
                  Search
                </Label>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="h-5 p-0 text-xs text-[#8B0000] hover:underline"
                  onClick={() => {
                    setSearchTerm('');
                    setFromDate(null);
                    setToDate(null);
                    setFilterType('all');
                    setFilteredReports(leaveReports);
                  }}
                >
                </Button>
              </div>
              <div className="flex gap-2 w-full">
                <Input 
                  type="search" 
                  placeholder="Search in reason, status..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                  className="flex-[3] h-10 rounded-md border-gray-300 focus:ring-[#8B0000] focus:ring-offset-[#F3E5E5] hover:border-[#8B0000]/50 transition-all duration-200 shadow-sm bg-white px-3 py-2"
                />
                <Button 
                  type="button" 
                  className="h-10 px-3 py-2 bg-[#8B0000] hover:bg-[#700000] text-white whitespace-nowrap rounded-md flex items-center justify-center gap-1 transition-colors" 
                  onClick={() => applyFilters()}
                >
                  <Search className="h-4 w-4" />
                  <span></span>
                </Button>
              </div>
            </div>
    
            <div className="md:col-span-2 flex justify-end">
              <Button
                variant="outline"
                className="rounded-md h-10 border-[#8B0000] text-[#8B0000] hover:bg-[#F3E5E5] hover:text-[#8B0000] transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      
        {/* Results Table Card */}
        <Card className="border-0 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-0 overflow-x-auto">
            <div className="p-4 bg-white/50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">Leave Records</h3>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[#8B0000]/10 text-[#8B0000] hover:bg-[#8B0000]/20">
                  {isLoading ? "Loading..." : `${filteredReports.length} Records`}
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="flex border bg-background px-3 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-9 pr-4 py-2 h-9 w-64 rounded-full text-sm border-gray-300 focus-visible:ring-[#8B0000] focus-visible:border-[#8B0000] transition-all duration-200" 
                  placeholder="Search records..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // If cleared, reset filtered results
                    if (e.target.value === '') {
                      setTimeout(() => applyFilters(), 100);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyFilters();
                    }
                  }}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B0000] border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Loading records...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 text-center">#</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4">
                      <div className="flex items-center gap-1">
                        Apply Date
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4">
                      <div className="flex items-center gap-1">
                        From Date
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4">
                      <div className="flex items-center gap-1">
                        To Date
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4">Days</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4">Forward To</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center py-8 text-gray-500" colSpan={9}>
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B0000] mb-4"></div>
                          <p>Loading leave records...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length === 0 ? (
                    <TableRow className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center py-8 text-gray-500" colSpan={9}>
                        <div className="flex flex-col items-center justify-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">No leave records found</p>
                          {(searchTerm || filterType !== 'all' || fromDate || toDate) && (
                            <Button 
                              variant="link" 
                              className="text-[#8B0000] mt-2" 
                              onClick={() => {
                                setSearchTerm('');
                                setFromDate(null);
                                setToDate(null);
                                setFilterType('all');
                                setFilteredReports(leaveReports);
                              }}
                            >
                              Clear filters to see all records
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((leave, index) => (
                      <TableRow 
                        key={leave.id} 
                        className={cn(
                          "border-b transition-colors",
                          activeRow === leave.id ? "bg-[#F3E5E5]" : "hover:bg-muted/50"
                        )}
                        onMouseEnter={() => handleRowHover(leave.id)}
                        onMouseLeave={() => handleRowHover(null)}
                      >
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {format(new Date(leave.applied_on), 'dd MMM, yyyy')}
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {format(new Date(leave.from_date), 'dd MMM, yyyy')}
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {format(new Date(leave.to_date), 'dd MMM, yyyy')}
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
                            {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {leave.no_of_days}
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {leave.forward_to.charAt(0).toUpperCase() + leave.forward_to.slice(1)}
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          <Badge className={getStatusBadgeColor(leave.status)}>
                            {formatStatus(leave.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
            
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">
                    {filteredReports.length > 0 ? `1-${filteredReports.length}` : '0'}
                  </span> of <span className="font-medium">{filteredReports.length}</span> entries
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 rounded-md border-gray-300 text-gray-500"
                >
                  <span>1</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 px-3 rounded-md text-gray-500 hover:text-[#8B0000] hover:bg-[#F3E5E5]"
                  disabled={filteredReports.length === 0}
                >
                  Next →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  export default LeaveReports;
