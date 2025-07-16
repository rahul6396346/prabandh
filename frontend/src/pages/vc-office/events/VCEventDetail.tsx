import React, { useEffect, useState } from "react";
import axios from  "axios"; 
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { axiosInstance } from "@/services/authService";
import { Badge } from "@/components/ui/badge";
import { schoolService, School } from '@/services/schoolService';

interface VCEventDetail {
  id: number;
  event_name: string;
  event_type: string;
  event_sub_type: string;
  school: string;
  course: string;
  bodies: string;
  event_remark: string;
  hod_remark: string;
  dean_remark: string;
  audience_type: string;
  fromdate: string;
  todate: string;
  timeslot: string;
  event_description: string;
  coordinator1: string;
  coordinator2: string;
  coordinator3: string;
  coordinator4: string;
  coordinator5: string;
  resource_person1: string;
  resource_person2: string;
  resource_person3: string;
  resource_person4: string;
  resource_person5: string;
  resource_person6: string;
  resource_person7: string;
  resource_person8: string;
  proposal_file: string;
  vcapproval_file: string;
  vcapproval_status: string;
  hodapproval_status: string;
  deanapproval_status: string;
  creatives: string;
  attendance_file: string;
  report_file: string;
  geotagpics_file1: string;
  geotagpics_file2: string;
  geotagpics_file3: string;
  news_social_media: string;
  news_print_media: string;
  videoclip: string;
  values_and_attributes: string;
  upload_by: string;
  event_budget: string;
  total_amount_spent: string;
  event_venue: string;
  event_outcomes: string;
  report_text: string;
  backdrop: string;
  standee: string;
  creative: string;
  certificate: string;
  other_requirements: string;
  members: string;
  created_at: string;
  files_uploaded: { label: string; url?: string }[];
  files_required: string[];
}

const VCEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<VCEventDetail | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/facultyservices/vc/events/${id}/`)
      .then((res) => {
        setEvent(res.data);
        if (res.data.school) {
          schoolService.getAllSchools().then((schools) => {
            const found = schools.find((s: School) => s.id === res.data.school);
            setSchoolName(found ? found.name : "");
          });
        }
      })
      .catch(() => setError("Failed to load event details."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Card className="mt-6 shadow-md max-w-5xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] text-white rounded-t-lg">
        <CardTitle className="text-xl font-semibold">Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading event details...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : event ? (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
            {/* Top Section: Title and Status */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-2">
              <div className="text-2xl font-bold text-[#8B0000]">{event.event_name}</div>
              <div>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${event.vcapproval_status === 'Approved' ? 'bg-green-100 text-green-800' : 
                    event.vcapproval_status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>{event.vcapproval_status || 'Pending'}</span>
              </div>
            </div>
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><b>Organizer:</b> {event.upload_by}</div>
              <div><b>School:</b> {schoolName}</div>
              <div><b>Course:</b> {event.course}</div>
              <div><b>Event Type:</b> {event.event_type} {event.event_sub_type && `- ${event.event_sub_type}`}</div>
              <div><b>Dates:</b> {event.fromdate} to {event.todate} {event.timeslot && `(${event.timeslot})`}</div>
              <div><b>Venue:</b> {event.event_venue}</div>
              <div><b>Participants:</b> {event.audience_type}</div>
              <div><b>Budget:</b> {event.event_budget}</div>
              <div><b>Total Amount Spent:</b> {event.total_amount_spent}</div>
              <div><b>Created At:</b> {event.created_at && new Date(event.created_at).toLocaleString()}</div>
            </div>
            {/* Description */}
            <div>
              <b>Description:</b>
              <div className="bg-gray-50 rounded p-3 mt-1 text-gray-800 whitespace-pre-line">{event.event_description}</div>
            </div>
            {/* Outcomes */}
            {event.event_outcomes && (
              <div>
                <b>Outcomes:</b>
                <div className="bg-gray-50 rounded p-3 mt-1 text-gray-800 whitespace-pre-line">{event.event_outcomes}</div>
              </div>
            )}
            {/* Files Required / Uploaded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <b>Files Required:</b>
                <div className="flex flex-wrap gap-1 mt-1">
                  {event.files_required && event.files_required.length > 0 ? event.files_required.map((file, idx) => (
                    <Badge key={file + idx} variant="outline" className="bg-red-100 text-red-800 border-red-200">{file}</Badge>
                  )) : <span className="text-green-600 text-xs">All uploaded</span>}
                </div>
              </div>
              <div>
                <b>Files Uploaded:</b>
                <div className="flex flex-wrap gap-1 mt-1">
                  {event.files_uploaded && event.files_uploaded.length > 0 ? event.files_uploaded.map((file, idx) => (
                    file.url ? (
                      <a key={file.label + idx} href={file.url} target="_blank" rel="noopener noreferrer" className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium underline hover:text-green-900">{file.label}</a>
                    ) : (
                      <span key={file.label + idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">{file.label}</span>
                    )
                  )) : <span className="text-red-600 text-xs">None</span>}
                </div>
              </div>
            </div>
            {/* SDG Goals and Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><b>Values & Attributes / SDG Goals:</b> {event.values_and_attributes}</div>
            </div>
            {/* Coordinators */}
            <div>
              <b>Coordinators:</b>
              <ul className="list-disc ml-6">
                {[event.coordinator1, event.coordinator2, event.coordinator3, event.coordinator4, event.coordinator5].filter(Boolean).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            {/* Resource Persons */}
            <div>
              <b>Resource Persons:</b>
              <ul className="list-disc ml-6">
                {[event.resource_person1, event.resource_person2, event.resource_person3, event.resource_person4, event.resource_person5, event.resource_person6, event.resource_person7, event.resource_person8].filter(Boolean).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            {/* Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><b>HOD Remark:</b> {event.hod_remark}</div>
              <div><b>Dean Remark:</b> {event.dean_remark}</div>
              <div><b>VC Remark:</b> {event.event_remark}</div>
            </div>
            {/* Members */}
            {event.members && (
              <div>
                <b>Members:</b>
                <div className="bg-gray-50 rounded p-3 mt-1 text-gray-800 whitespace-pre-line">{event.members}</div>
              </div>
            )}
            {/* Other Requirements */}
            {event.other_requirements && (
              <div>
                <b>Other Requirements:</b>
                <div className="bg-gray-50 rounded p-3 mt-1 text-gray-800 whitespace-pre-line">{event.other_requirements}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">Event not found.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default VCEventDetail; 