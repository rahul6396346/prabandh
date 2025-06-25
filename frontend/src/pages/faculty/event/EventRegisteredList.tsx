import React, { useEffect, useState } from 'react';
import { eventService } from '../../../services/eventService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Pending', value: 'Pending' },
];

// Mapping from display name to backend model field name
const fileTypeMap: Record<string, string> = {
  "Proposal": "proposal_file",
  "VC Approval": "vcapproval_file",
  "Creative": "creatives",
  "Attendance": "attendance_file",
  "Report": "report_file",
  "GeoTag Pic 1": "geotagpics_file1",
  "GeoTag Pic 2": "geotagpics_file2",
  "GeoTag Pic 3": "geotagpics_file3",
  "News Social Media": "news_social_media",
  "News Print Media": "news_print_media"
};

const EventRegisteredList: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedFileRequired, setSelectedFileRequired] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventService.getMyEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event: any) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Pending' && (!event.vcapproval_status || event.vcapproval_status === 'Pending')) ||
      event.vcapproval_status === statusFilter;
    const matchesSearch =
      event.event_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleFileBadgeClick = (event: any, fileName: string) => {
    setSelectedEvent(event);
    setSelectedFileRequired(fileName);
    setUploadDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload || !selectedEvent || !selectedFileRequired) return;
    const fileTypeField = fileTypeMap[selectedFileRequired] || selectedFileRequired;
    try {
      await eventService.uploadFile(selectedEvent.id, fileTypeField, fileToUpload);
      toast({ title: 'File uploaded', description: `${selectedFileRequired} uploaded for event ${selectedEvent.event_name}` });
      setUploadDialogOpen(false);
      setFileToUpload(null);
      setSelectedFileRequired(null);
      setSelectedEvent(null);
      await fetchEvents(); // Refresh the event list
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Could not upload file. Please try again.', variant: 'destructive' });
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-[#8B0000] border-b border-[#8B0000] pb-4">Registered Events</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`px-4 py-2 rounded-full border ${statusFilter === f.value ? 'bg-[#8B0000] text-white' : 'bg-gray-100 text-gray-700'} transition`}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by event name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] flex-1"
          />
          <button
            onClick={fetchEvents}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg shadow">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 sticky top-0">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Event Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">From Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">To Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Applied Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Approval Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Files Required</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Files Uploaded</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event: any, index: number) => (
                  <tr key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => handleCheckboxChange(event.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.created_at ? new Date(event.created_at).toLocaleDateString() : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.event_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.fromdate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.todate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.event_budget || 'Not specified'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${event.vcapproval_status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          event.vcapproval_status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {event.vcapproval_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.files_required && event.files_required.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {event.files_required.map((file: string, idx: number) => (
                            <span
                              key={file + idx}
                              className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium cursor-pointer hover:bg-red-200"
                              onClick={() => handleFileBadgeClick(event, file)}
                            >
                              {file}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-green-600 text-xs">All uploaded</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.files_uploaded && event.files_uploaded.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {event.files_uploaded.map((file: any, idx: number) => (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Upload File Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><strong>Event:</strong> {selectedEvent?.event_name}</div>
            <div><strong>File Required:</strong> {selectedFileRequired}</div>
            <input type="file" onChange={handleFileChange} />
          </div>
          <DialogFooter>
            <Button onClick={handleFileUpload} disabled={!fileToUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventRegisteredList;