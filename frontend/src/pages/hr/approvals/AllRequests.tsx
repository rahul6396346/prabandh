import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, FileText, Clock, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import VerifiedBadge from '@/components/ui/verified-badge';

interface LeaveApplication {
  id: number;
  faculty_details: {
    name: string;
    department: string;
    registration_no: string;
    email?: string; // Added email for verification badge
    is_staff?: boolean; // Added is_staff for verification badge
  };
  leave_type: string;
  from_date: string;
  to_date: string;
  no_of_days: number;
  reason: string;
  contact_during_leave: string;
  address_during_leave: string;
  status: string;
  applied_on: string;
  remarks?: string;
  processed_by?: string;
  processed_on?: string;
}

const AllRequests = () => {
  const [allRequests, setAllRequests] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [remarks, setRemarks] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(true);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [faculties, setFaculties] = useState([]);

  const [faculty, setFaculty] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    // Initial fetch
    fetchAllRequests();
    
    // Set up polling for real-time updates
    pollingInterval.current = setInterval(() => {
      if (pollingEnabled) {
        fetchAllRequests(true); // Pass true to indicate this is a silent refresh
      }
    }, 10000); // Refresh every 10 seconds
    
    // Clean up interval on component unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [pollingEnabled]);

  useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const token = localStorage.getItem('token');
      let authHeader = '';
      if (accessToken) authHeader = `Bearer ${accessToken}`;
      else if (token) authHeader = `Token ${token}`;
      const res = await axios.get('http://localhost:8000//api/auth/departments/', {
        headers: { 'Authorization': authHeader }
      });
      console.log(res.data);
      setDepartments(res.data);
    } catch {
      toast.error('Failed to load departments');
    }
  };
  fetchDepartments();
}, []);

useEffect(() => {
  const fetchFaculties = async () => {
    if (!selectedDepartment) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      const token = localStorage.getItem("token");
      let authHeader = "";
      if (accessToken) authHeader = `Bearer ${accessToken}`;
      else if (token) authHeader = `Token ${token}`;

      const res = await axios.get(
        `http://localhost:8000/api/auth/faculty-by-department/?department=${encodeURIComponent(selectedDepartment)}`,
        {
          headers: { Authorization: authHeader },
        }
      );

      console.log("Faculties:", res.data); // For debugging
      setFaculties(res.data); // Assuming it's an array of faculty names or objects
    } catch (err) {
      toast.error("Failed to load faculty list");
      console.error(err);
    }
  };

  fetchFaculties();
}, [selectedDepartment]);


  const fetchAllRequests = async (silent: boolean = false) => {
    try {
      // Only show loading indicator for manual refreshes, not silent ones
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      
      // Get the access token or regular token
      const accessToken = localStorage.getItem('accessToken');
      const token = localStorage.getItem('token');
      
      // Set the appropriate Authorization header
      let authHeader = '';
      if (accessToken) {
        authHeader = `Bearer ${accessToken}`;
      } else if (token) {
        authHeader = `Token ${token}`;
      }
      
      if (!authHeader) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.get('http://localhost:8000/api/faculty/leave/applications/', {
        headers: {
          'Authorization': authHeader
        }
      });
      
      if (Array.isArray(response.data)) {
        setAllRequests(response.data);
        console.log('Fetched all leave applications:', response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Received invalid data format from server.');
        setAllRequests([]);
      }
    } catch (err) {
      console.error('Error fetching all leave applications:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Disable polling on authentication failure
          setPollingEnabled(false);
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view HR applications.');
        } else {
          setError(`Failed to fetch leave applications: ${err.response?.data?.error || err.message || 'Unknown error'}`);
        }
      } else {
        setError('Failed to fetch leave applications. Please try again.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    
    try {
      // Get the access token or regular token
      const accessToken = localStorage.getItem('accessToken');
      const token = localStorage.getItem('token');
      
      // Set the appropriate Authorization header
      let authHeader = '';
      if (accessToken) {
        authHeader = `Bearer ${accessToken}`;
      } else if (token) {
        authHeader = `Token ${token}`;
      }
      
      if (!authHeader) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      await axios.post(`http://localhost:8000/api/faculty/leave/applications/${selectedApplication.id}/hr_approve/`, 
        { remarks },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          }
        }
      );
      
      setActionSuccess('Leave application approved successfully');
      // Refresh the list
      fetchAllRequests();
      // Reset states
      setSelectedApplication(null);
      setRemarks("");
    } catch (err) {
      console.error('Error approving leave application:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(`Failed to approve application: ${err.response?.data?.error || err.message || 'Unknown error'}`);
        }
      } else {
        setError('Failed to approve leave application. Please try again.');
      }
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    
    try {
      // Get the access token or regular token
      const accessToken = localStorage.getItem('accessToken');
      const token = localStorage.getItem('token');
      
      // Set the appropriate Authorization header
      let authHeader = '';
      if (accessToken) {
        authHeader = `Bearer ${accessToken}`;
      } else if (token) {
        authHeader = `Token ${token}`;
      }
      
      if (!authHeader) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      await axios.post(`http://localhost:8000/api/faculty/leave/applications/${selectedApplication.id}/hr_reject/`, 
        { remarks },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          }
        }
      );
      
      setActionSuccess('Leave application rejected successfully');
      // Refresh the list
      fetchAllRequests();
      // Reset states
      setSelectedApplication(null);
      setRemarks("");
    } catch (err) {
      console.error('Error rejecting leave application:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(`Failed to reject application: ${err.response?.data?.error || err.message || 'Unknown error'}`);
        }
      } else {
        setError('Failed to reject leave application. Please try again.');
      }
    }
  };

  const fetch = async (silent: boolean = false) => {
  try {
    if (!silent) setLoading(true);
    setError(null);

    const accessToken = localStorage.getItem('accessToken');
    const token = localStorage.getItem('token');
    let authHeader = '';
    if (accessToken) authHeader = `Bearer ${accessToken}`;
    else if (token) authHeader = `Token ${token}`;
    if (!authHeader) throw new Error('Authentication token not found. Please log in again.');

    // Build query params
    const params: any = {};
    if (departments) params.department = departments;
    if (faculty) params.faculty = faculty;
    if (status) params.status = status;

    const response = await axios.get('http://localhost:8000/api/faculty/leave/applications/', {
      headers: { 'Authorization': authHeader },
      params,
    });

    if (Array.isArray(response.data)) {
      setAllRequests(response.data);
    } else {
      setError('Received invalid data format from server.');
      setAllRequests([]);
    }
  } catch (err) {
    // ...existing error handling...
  } finally {
    if (!silent) setLoading(false);
  }
};

  const getLeaveTypeLabel = (type: string) => {
    const types = {
      'earned': 'Earned Leave',
      'medical': 'Medical Leave',
      'compensatory': 'Compensatory Leave',
      'semester': 'Semester Break',
      'casual': 'Casual Leave',
      'duty': 'Duty Leave'
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-200 text-amber-600 bg-amber-50 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "forwarded_to_dean":
        return (
          <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Forwarded to Dean
          </Badge>
        );
      case "forwarded_to_vc":
        return (
          <Badge variant="outline" className="border-purple-200 text-purple-600 bg-purple-50 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Forwarded to VC
          </Badge>
        );
      case "forwarded_to_hr":
        return (
          <Badge variant="outline" className="border-indigo-200 text-indigo-600 bg-indigo-50 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending HR Review
          </Badge>
        );
      case "approved":
      case "approved_by_hr":
        return (
          <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
      case "rejected_by_hr":
        return (
          <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-gray-200 text-gray-600 bg-gray-50">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Leave Requests</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={pollingEnabled ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-1 ${pollingEnabled ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={() => setPollingEnabled(!pollingEnabled)}
          >
            {pollingEnabled ? (
              <>
                <Clock className="h-4 w-4" />
                Auto-Refresh On
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Auto-Refresh Off
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => fetchAllRequests()}>
            <Filter size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{actionSuccess}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setActionSuccess(null)}>
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg">All Leave Requests
            <span className="flex gap-4 mb-4">
  <select
  value={selectedDepartment}
  onChange={e => setSelectedDepartment(e.target.value)}
  className="border p-2 rounded"
>
  <option value="">Select Department</option>
  {Object.entries(departments).map(([key, value]) => (
  <option key={key} value={key}>{value}</option>
))}
</select>
 
{/* Faculty Dropdown */}
<select>
  <option value="">Select Faculty</option>
  {Object.entries(faculties).map(([key,value]) => (
    <option key={key} value={value.id || value.name}>{value.name || faculty}</option>
  ))}
</select>

  <select
    value={status}
    onChange={e => setStatus(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="">All Status</option>
    <option value="pending">Pending</option>
    <option value="approved">Approved</option>
    <option value="rejected">Rejected</option>
    {/* Add more statuses as needed */}
  </select>
</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading leave applications...</p>
            </div>
          ) : allRequests.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No leave applications found.</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {allRequests.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-mono text-xs">{application.faculty_details.registration_no}</TableCell>
                    <TableCell>{application.faculty_details.name}</TableCell>
                    <TableCell>{application.faculty_details.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50">
                        {getLeaveTypeLabel(application.leave_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(application.from_date)}</TableCell>
                    <TableCell>{formatDate(application.to_date)}</TableCell>
                    <TableCell>{application.no_of_days}</TableCell>
                    <TableCell>{formatDate(application.applied_on)}</TableCell>
                    <TableCell>{renderStatusBadge(application.status)}</TableCell>
                  <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => setSelectedApplication(application)}
                          >
                      <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Leave Application Details</DialogTitle>
                            <DialogDescription>
                              Review the leave application details.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedApplication && (
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Employee Name</h4>
                                  <p>{selectedApplication.faculty_details.name}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Employee ID</h4>
                                  <p className="font-mono">{selectedApplication.faculty_details.registration_no}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Department</h4>
                                  <p>{selectedApplication.faculty_details.department}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Leave Type</h4>
                                  <p>{getLeaveTypeLabel(selectedApplication.leave_type)}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">From Date</h4>
                                  <p>{formatDate(selectedApplication.from_date)}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">To Date</h4>
                                  <p>{formatDate(selectedApplication.to_date)}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Number of Days</h4>
                                  <p>{selectedApplication.no_of_days}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Applied On</h4>
                                  <p>{formatDate(selectedApplication.applied_on)}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                  <p>{renderStatusBadge(selectedApplication.status)}</p>
                                </div>
                                {selectedApplication.processed_by && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Processed By</h4>
                                    <p>{selectedApplication.processed_by}</p>
                                  </div>
                                )}
                                {selectedApplication.processed_on && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Processed On</h4>
                                    <p>{formatDate(selectedApplication.processed_on)}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Reason for Leave</h4>
                                <p className="p-2 bg-gray-50 rounded mt-1">{selectedApplication.reason}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Contact During Leave</h4>
                                  <p>{selectedApplication.contact_during_leave}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Address During Leave</h4>
                                  <p>{selectedApplication.address_during_leave || 'Not provided'}</p>
                                </div>
                              </div>
                              
                              {selectedApplication.remarks && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Remarks</h4>
                                  <p className={`p-2 rounded mt-1 ${
                                    selectedApplication.status === 'rejected' 
                                      ? 'bg-red-50 text-red-700'
                                      : selectedApplication.status === 'approved'
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-gray-50 text-gray-700'
                                  }`}>
                                    {selectedApplication.remarks}
                                  </p>
                                </div>
                              )}
                              
                              {selectedApplication.status === "pending" && (
                                <>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Add Remarks</h4>
                                    <Textarea 
                                      placeholder="Add your remarks here..."
                                      value={remarks}
                                      onChange={(e) => setRemarks(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  
                                  <DialogFooter className="flex justify-end space-x-2 mt-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                                          Take Action
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem 
                                          onClick={handleApprove}
                                          className="text-green-700 hover:text-green-800 hover:bg-green-50 cursor-pointer"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve Application
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={handleReject}
                                          className="text-red-700 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject Application
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </DialogFooter>
                                </>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllRequests;