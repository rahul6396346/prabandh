import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Info, RefreshCw, Filter } from "lucide-react";
import axios from "@/lib/axios";
import { usePushNotify } from '@/hooks/usePushNotify';
import VerifiedBadge from '@/components/ui/verified-badge';
import staffService from '@/services/staffService';

const API_BASE = "/api/facultyservices";
const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Pending', value: 'Pending' },
];

const EventApprovals = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('event_name');
  const [organizer, setOrganizer] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [organizerDetails, setOrganizerDetails] = useState({});
  const { requestPermission, pushNotify } = usePushNotify();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    // Fetch all faculty emails and is_staff from backend
    const fetchFacultyDetails = async () => {
      try {
        const allFaculty = await staffService.getAllFacultyWithEmailAndStatus();
        // Map by name for quick lookup
        const detailsMap = {};
        for (const faculty of allFaculty) {
          detailsMap[faculty.full_name] = {
            email: faculty.email,
            is_staff: faculty.is_staff,
          };
        }
        setOrganizerDetails(detailsMap);
      } catch (err) {
        // Handle error (e.g., not HR user)
        setOrganizerDetails({});
      }
    };
    fetchFacultyDetails();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/vc/events/`);
      const data = res.data;

      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data?.results && Array.isArray(data.results)) {
        setEvents(data.results);
      } else {
        console.error("Unexpected API format:", data);
        setEvents([]);
      }
    } catch (err) {
      console.error("API call failed:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await axios.patch(`${API_BASE}/vc/events/${id}/approve/`, { vcapproval_status: "Approved" });
    pushNotify("Event Approved", {
      body: "The event has been approved by the VC.",
    });
    fetchEvents();
    setShowDialog(false);
  };

  const handleReject = async (id) => {
    await axios.patch(`${API_BASE}/vc/events/${id}/approve/`, { vcapproval_status: "Rejected" });
    fetchEvents();
    setShowDialog(false);
  };

  const openDetails = (event) => {
    setSelectedEvent(event);
    setShowDialog(true);
  };

  const handleCheckboxChange = (eventId: number) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(filteredEvents.map((event: any) => event.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Pending' && (!event.vcapproval_status || event.vcapproval_status === 'Pending')) ||
      event.vcapproval_status === statusFilter;
    let matchesSearch = true;
    if (searchType === 'event_name') {
      matchesSearch = event.event_name.toLowerCase().includes(search.toLowerCase());
    } else if (searchType === 'organizer') {
      matchesSearch = event.upload_by && event.upload_by.toLowerCase().includes(search.toLowerCase());
    }
    let matchesFromDate = true;
    let matchesToDate = true;
    if (fromDate) {
      matchesFromDate = event.fromdate >= fromDate;
    }
    if (toDate) {
      matchesToDate = event.todate <= toDate;
    }
    return matchesStatus && matchesSearch && matchesFromDate && matchesToDate;
  });

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-[#8B0000] to-[#A52A2A] text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold mb-4">Event Registration Approvals</CardTitle>
          <div className="w-full overflow-x-auto">
            <div className="flex flex-wrap items-center gap-2 w-full pb-2">
              <div className="flex gap-2 flex-wrap">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    className={`px-4 py-2 rounded-full border ${statusFilter === f.value ? 'bg-white text-[#8B0000] font-bold' : 'bg-[#8B0000]/10 text-white'} transition`}
                    onClick={() => setStatusFilter(f.value)}
                  >
                    <Filter className="inline-block mr-1 h-4 w-4" />{f.label}
                  </button>
                ))}
              </div>
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                className="border border-gray-300 rounded px-2 py-2 text-black min-w-[120px]"
              >
                <option value="event_name">Event Name</option>
                <option value="organizer">Organizer</option>
              </select>
              <input
                type="text"
                placeholder={searchType === 'event_name' ? 'Search by event name...' : 'Search by organizer...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] min-w-[180px] text-black"
                style={{ maxWidth: 220 }}
              />
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-2 text-black min-w-[120px]"
                placeholder="From Date"
                style={{ maxWidth: 140 }}
              />
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-2 text-black min-w-[120px]"
                placeholder="To Date"
                style={{ maxWidth: 140 }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-10">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No events found.</div>
          ) : (
            <div className="overflow-x-auto rounded-b-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#8B0000] to-[#A52A2A] text-white">
                    <TableHead className="text-white">
                      <input
                        type="checkbox"
                        checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                        onChange={e => handleSelectAll(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white">Event Name</TableHead>
                    <TableHead className="text-white">Organizer</TableHead>
                    <TableHead className="text-white">From Date</TableHead>
                    <TableHead className="text-white">To Date</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Files Required</TableHead>
                    <TableHead className="text-white">Files Uploaded</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map(event => (
                    <TableRow key={event.id} className="hover:bg-[#8B0000]/5">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => handleCheckboxChange(event.id)}
                        />
                      </TableCell>
                      <TableCell>{event.created_at ? new Date(event.created_at).toLocaleDateString() : ''}</TableCell>
                      <TableCell>{event.event_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{event.upload_by}</span>
                          {/* Show email and verified tick if available */}
                          {organizerDetails[event.upload_by]?.email && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              {organizerDetails[event.upload_by].email}
                              {organizerDetails[event.upload_by].is_staff && <VerifiedBadge />}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{event.fromdate}</TableCell>
                      <TableCell>{event.todate}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${event.vcapproval_status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            event.vcapproval_status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {event.vcapproval_status || 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {event.files_required && event.files_required.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {event.files_required.map((file, idx) => (
                              <span key={file + idx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">{file}</span>
                            ))}
                          </div>
                        ) : <span className="text-green-600 text-xs">All uploaded</span>}
                      </TableCell>
                      <TableCell>
                        {event.files_uploaded && event.files_uploaded.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {event.files_uploaded.map((file, idx) => (
                              file.url ? (
                                <a
                                  key={file.label + idx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium underline hover:text-green-900"
                                >
                                  {file.label}
                                </a>
                              ) : (
                                <span key={file.label + idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">{file.label}</span>
                              )
                            ))}
                          </div>
                        ) : <span className="text-red-600 text-xs">None</span>}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openDetails(event)}>
                          <Info className="h-4 w-4 mr-1" /> Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.event_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <div>
                  <strong>Organizer:</strong> {selectedEvent.upload_by}
                  {organizerDetails[selectedEvent.upload_by]?.email && (
                    <span className="text-xs text-blue-600 flex items-center gap-1 ml-2">
                      {organizerDetails[selectedEvent.upload_by].email}
                      {organizerDetails[selectedEvent.upload_by].is_staff && <VerifiedBadge />}
                    </span>
                  )}
                </div>
                <div><strong>Date:</strong> {selectedEvent.fromdate} - {selectedEvent.todate}</div>
                <div><strong>Location:</strong> {selectedEvent.event_venue}</div>
                <div><strong>Participants:</strong> {selectedEvent.audience_type}</div>
                <div><strong>Description:</strong> {selectedEvent.event_description}</div>
                <div><strong>Status:</strong> <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${selectedEvent.vcapproval_status === 'Approved' ? 'bg-green-100 text-green-800' : 
                    selectedEvent.vcapproval_status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>{selectedEvent.vcapproval_status || 'Pending'}</span></div>
              </div>
              {(selectedEvent.vcapproval_status === "Pending" || !selectedEvent.vcapproval_status) && (
                <DialogFooter className="gap-2">
                  <Button onClick={() => handleApprove(selectedEvent.id)} variant="default">
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button onClick={() => handleReject(selectedEvent.id)} variant="destructive">
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventApprovals; 