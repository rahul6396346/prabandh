import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, Eye, FileText, Search, FileSpreadsheet, Clock, ArrowUpDown, Filter, Calendar as CalendarIcon2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
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
import axios from 'axios';
import authService from "@/services/authService";

// Define interface for duty report data
interface DutyReport {
  id: number;
  serialNo?: string;
  applyDate: string;
  leaveDateTime: string;
  dutyType: string;
  forwardTo: string;
  status: string;
  description: string;
  edit: boolean;
  delete: boolean;
}

const DutySlipReports = () => {
  // Date filtering state
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [dutyReports, setDutyReports] = useState<DutyReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DutyReport[]>([]);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Fetch duty reports on component mount
  useEffect(() => {
    fetchDutyReports();
  }, []);
  
  // Auto refresh interval - background updates without visual disruption
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoRefreshEnabled) {
      intervalId = setInterval(() => {
        // Fetch data silently in background without showing loading state
        fetchDutyReportsBackground();
      }, 30000); // 30 seconds instead of 100ms
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefreshEnabled]);
  
  // Apply filters when search term or filter type changes
  useEffect(() => {
    applyFilters();
  }, [dutyReports, searchTerm, filterType, fromDate, toDate]);

  const fetchDutyReports = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be a call to your API
      // For now, we'll use the mock data but wrap it in a timeout to simulate an API call
      
      // The code below should be replaced with an actual API call when the endpoint is available
      // const response = await axios.get('http://localhost:8000/api/faculty/leave/duty-reports/', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}` || `Token ${localStorage.getItem('token')}` || ''
      //   }
      // });
      // setDutyReports(response.data);
      
      // Mock data for now
      setTimeout(() => {
        const mockReports = [
          {
            id: 1,
            serialNo: "1",
            applyDate: "11-01-2025",
            leaveDateTime: "11-01-2025 03:00 PM / 11-01-2025 05:00 PM",
            dutyType: "Departure (Personal)",
            forwardTo: "erp@itmuniversity.ac.in",
            status: "Recommended",
            description: "due to some urgent work",
            edit: false,
            delete: false
          },
          {
            id: 2,
            serialNo: "2",
            applyDate: "29-11-2024",
            leaveDateTime: "25-11-2024 03:00 PM / 25-11-2024 05:00 PM",
            dutyType: "Departure (Personal)",
            forwardTo: "erp@itmuniversity.ac.in",
            status: "Sanctioned",
            description: "beause of some personal work",
            edit: false,
            delete: false
          },
          {
            id: 3,
            serialNo: "3",
            applyDate: "25-10-2024",
            leaveDateTime: "22-10-2024 03:00 PM / 22-10-2024 05:00 PM",
            dutyType: "Departure (Personal)",
            forwardTo: "erp@itmuniversity.ac.in",
            status: "Sanctioned",
            description: "i have to go one of my relatives thirteenth",
            edit: false,
            delete: false
          }
        ];
        setDutyReports(mockReports);
        setFilteredReports(mockReports);
        setLastRefreshed(new Date());
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching duty reports:", error);
      setDutyReports([]);
      setFilteredReports([]);
      setLastRefreshed(new Date());
      setIsLoading(false);
    }
  };

  // Background fetch without loading states to prevent blinking
  const fetchDutyReportsBackground = async () => {
    try {
      // In a real implementation, this would be a call to your API
      // const response = await axios.get('http://localhost:8000/api/faculty/leave/duty-reports/', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}` || `Token ${localStorage.getItem('token')}` || ''
      //   }
      // });
      // setDutyReports(response.data);
      
      // Mock data for background refresh
      const mockReports = [
        {
          id: 1,
          serialNo: "1",
          applyDate: "11-01-2025",
          leaveDateTime: "11-01-2025 03:00 PM / 11-01-2025 05:00 PM",
          dutyType: "Departure (Personal)",
          forwardTo: "erp@itmuniversity.ac.in",
          status: "Recommended",
          description: "due to some urgent work",
          edit: false,
          delete: false
        },
        {
          id: 2,
          serialNo: "2",
          applyDate: "29-11-2024",
          leaveDateTime: "25-11-2024 03:00 PM / 25-11-2024 05:00 PM",
          dutyType: "Departure (Personal)",
          forwardTo: "erp@itmuniversity.ac.in",
          status: "Sanctioned",
          description: "beause of some personal work",
          edit: false,
          delete: false
        },
        {
          id: 3,
          serialNo: "3",
          applyDate: "25-10-2024",
          leaveDateTime: "22-10-2024 03:00 PM / 22-10-2024 05:00 PM",
          dutyType: "Departure (Personal)",
          forwardTo: "erp@itmuniversity.ac.in",
          status: "Sanctioned",
          description: "i have to go one of my relatives thirteenth",
          edit: false,
          delete: false
        }
      ];
      
      // Only update if data has actually changed
      const currentDataString = JSON.stringify(dutyReports);
      const newDataString = JSON.stringify(mockReports);
      
      if (currentDataString !== newDataString) {
        setDutyReports(mockReports);
        setFilteredReports(mockReports);
      }
      
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error fetching duty reports in background:", error);
    }
  };

  const applyFilters = () => {
    if (!dutyReports.length) return;
    
    let filtered = [...dutyReports];
    
    // Apply date filters
    if (fromDate && toDate) {
      filtered = filtered.filter(report => {
        // Since our mock data doesn't have actual Date objects,
        // we'll just pretend to filter here. In real implementation, 
        // you would parse the dates and do proper comparison.
        return true; 
      });
    }
    
    // Apply duty type filter
    if (filterType !== "all") {
      filtered = filtered.filter(report => 
        report.dutyType.toLowerCase().includes(filterType.toLowerCase())
      );
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.description?.toLowerCase().includes(searchLower) ||
        report.forwardTo?.toLowerCase().includes(searchLower) ||
        report.status?.toLowerCase().includes(searchLower) ||
        report.dutyType?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredReports(filtered);
  };

  // Handle search button click
  const handleSearch = () => {
    applyFilters();
  };

  // Highlight row on hover
  const handleRowHover = (id: number | null) => {
    setActiveRow(id);
  };

  // Badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "sanctioned":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "recommended":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <Card className="mb-6 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] py-3 px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span>Arrival/Departure/Duty Slip Reports</span>
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

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
                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 text-[#8B0000]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[#8B0000]/20 shadow-lg rounded-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
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
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 text-[#8B0000]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[#8B0000]/20 shadow-lg rounded-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                    className="[&_.selected]:bg-[#8B0000] [&_.selected]:text-white [&_.selected]:border-[#8B0000] [&_.selected]:ring-[#8B0000] [&_button:hover]:bg-[#F3E5E5]"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2 md:col-span-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-[#8B0000]" />
                Duty Type
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-10 rounded-md border-gray-300 focus:ring-[#8B0000] focus:ring-offset-[#F3E5E5] hover:border-[#8B0000]/50 transition-all duration-200 shadow-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-[#8B0000]/20 shadow-lg rounded-lg">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="arrival">Arrival</SelectItem>
                  <SelectItem value="departure">Departure</SelectItem>
                  <SelectItem value="duty">Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#8B0000] text-white rounded-md h-10 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="rounded-md h-10 border-[#8B0000] text-[#8B0000] hover:bg-[#F3E5E5] hover:text-[#8B0000] transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="border-0 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0 overflow-x-auto">
          <div className="p-4 bg-white/50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">Duty Records</h3>
              <Badge className="bg-[#8B0000]/10 text-[#8B0000] hover:bg-[#8B0000]/20">{filteredReports.length} Records</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 h-9 w-64 rounded-full text-sm border-gray-300 focus-visible:ring-[#8B0000] focus-visible:border-[#8B0000] transition-all duration-200"
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
                    Leave Date & Time
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-3 px-4">Duty Type</TableHead>
                <TableHead className="font-semibold text-gray-700 py-3 px-4">Forward To</TableHead>
                <TableHead className="font-semibold text-gray-700 py-3 px-4">Description</TableHead>
                <TableHead className="font-semibold text-gray-700 py-3 px-4">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 py-3 px-4 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No duty records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report, index) => (
                  <TableRow 
                    key={report.id} 
                    className={cn(
                      "border-b border-gray-100 transition-colors duration-200",
                      activeRow === report.id ? "bg-[#F3E5E5]" : "hover:bg-gray-50"
                    )}
                    onMouseEnter={() => handleRowHover(report.id)}
                    onMouseLeave={() => handleRowHover(null)}
                  >
                    <TableCell className="py-4 px-4 text-center font-medium text-gray-700">{index + 1}</TableCell>
                    <TableCell className="py-4 px-4 text-gray-700">{report.applyDate}</TableCell>
                    <TableCell className="py-4 px-4 text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#8B0000]" />
                        <span>{report.leaveDateTime}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-gray-700">
                      {report.dutyType}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-gray-700">
                      <span className="text-blue-600 hover:underline cursor-pointer">{report.forwardTo}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-gray-700">
                      <span className="text-sm">{report.description}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge className={cn("rounded-full px-2.5 py-1 text-xs font-medium", getStatusBadgeColor(report.status))}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 hover:bg-[#8B0000]/10 hover:text-[#8B0000]">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 hover:bg-[#8B0000]/10 hover:text-[#8B0000]">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
          
          {/* Pagination */}
          {!isLoading && filteredReports.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">1-{filteredReports.length}</span> of <span className="font-medium">{filteredReports.length}</span> entries
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md border-gray-300 text-gray-500">
                  <span>1</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3 rounded-md text-gray-500 hover:text-[#8B0000] hover:bg-[#F3E5E5]">
                  Next &rarr;
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DutySlipReports;
