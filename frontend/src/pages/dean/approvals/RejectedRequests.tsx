import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle, Filter, FileText, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

interface LeaveApplication {
  id: number;
  faculty_details: {
    name: string;
    department: string;
    registration_no: string;
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

const RejectedRequests = () => {
  const [rejectedRequests, setRejectedRequests] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(true);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchRejectedRequests();
    
    // Set up polling for real-time updates
    pollingInterval.current = setInterval(() => {
      if (pollingEnabled) {
        fetchRejectedRequests(true); // Pass true to indicate this is a silent refresh
      }
    }, 10000); // Refresh every 10 seconds
    
    // Clean up interval on component unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [pollingEnabled]);

  const fetchRejectedRequests = async (silent: boolean = false) => {
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
        params: { 
          dean_approvals: 'true',
          status: 'rejected,rejected_by_dean' // Include both status values
        },
        headers: {
          'Authorization': authHeader
        }
      });
      
      if (Array.isArray(response.data)) {
        setRejectedRequests(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Received invalid data format from server.');
        setRejectedRequests([]);
      }
    } catch (err) {
      console.error('Error fetching rejected leave applications:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Disable polling on authentication failure
          setPollingEnabled(false);
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view Dean applications.');
        } else {
          setError(`Failed to fetch rejected applications: ${err.response?.data?.error || err.message || 'Unknown error'}`);
        }
      } else {
        setError('Failed to fetch rejected leave applications. Please try again.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rejected Requests</h1>
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
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => fetchRejectedRequests()}>
            <Filter size={16} />
            Refresh
          </Button>
        </div>
      </div>

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
          <CardTitle className="text-lg flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Rejected Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading rejected applications...</p>
            </div>
          ) : rejectedRequests.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No rejected leave applications yet.</p>
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
                  <TableHead>Rejected On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejectedRequests.map((application) => (
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
                    <TableCell>{application.processed_on ? formatDate(application.processed_on) : "-"}</TableCell>
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
                            <DialogTitle>Rejected Leave Application Details</DialogTitle>
                            <DialogDescription>
                              Review the rejected leave application details.
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
                                  <h4 className="text-sm font-medium text-gray-500">Rejected By</h4>
                                  <p>{selectedApplication.processed_by || "-"}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Rejected On</h4>
                                  <p>{selectedApplication.processed_on ? formatDate(selectedApplication.processed_on) : "-"}</p>
                                </div>
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
                                  <h4 className="text-sm font-medium text-gray-500">Rejection Reason</h4>
                                  <p className="p-2 bg-red-50 rounded mt-1 text-red-700">{selectedApplication.remarks}</p>
                                </div>
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

export default RejectedRequests;