import React, { useEffect, useState } from "react";
import axios from  "axios"; 
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { axiosInstance } from "@/services/authService";

interface VCEventDetail {
  id: number;
  title: string;
  description: string;
  school: string;
  department: string;
  event_type: string;
  duration: string;
  va_goals: string;
  sdg_goals: string;
  uploaded_by: string;
  file_requirements: string;
  approval_status: string;
  hod_approval: string;
  dean_approval: string;
  vc_approval: string;
  hod_remarks: string;
  dean_remarks: string;
  vc_remarks: string;
  created_at: string;
  updated_at: string;
}

const VCEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<VCEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/facultyservices/vc/events/${id}/`)
      .then((res) => setEvent(res.data))
      .catch(() => setError("Failed to load event details."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Card className="mt-6 shadow-md max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold">Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading event details...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : event ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-medium text-gray-600">Event Name:</span> {event.title}</div>
              <div><span className="font-medium text-gray-600">Event Type:</span> {event.event_type}</div>
              <div><span className="font-medium text-gray-600">School:</span> {event.school}</div>
              <div><span className="font-medium text-gray-600">Department:</span> {event.department}</div>
              <div><span className="font-medium text-gray-600">Duration:</span> {event.duration}</div>
              <div><span className="font-medium text-gray-600">Uploaded By:</span> {event.uploaded_by}</div>
              <div><span className="font-medium text-gray-600">File Requirements:</span> {event.file_requirements}</div>
              <div><span className="font-medium text-gray-600">Approval Status:</span> {event.approval_status}</div>
              <div><span className="font-medium text-gray-600">Created At:</span> {event.created_at}</div>
              <div><span className="font-medium text-gray-600">Updated At:</span> {event.updated_at}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Description:</span>
              <div className="bg-gray-50 rounded p-3 mt-1 text-gray-800 whitespace-pre-line">{event.description}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-medium text-gray-600">VA Goals:</span> {event.va_goals}</div>
              <div><span className="font-medium text-gray-600">SDG Goals:</span> {event.sdg_goals}</div>
              <div><span className="font-medium text-gray-600">HOD Approval:</span> {event.hod_approval}</div>
              <div><span className="font-medium text-gray-600">Dean Approval:</span> {event.dean_approval}</div>
              <div><span className="font-medium text-gray-600">VC Approval:</span> {event.vc_approval}</div>
              <div><span className="font-medium text-gray-600">HOD Remarks:</span> {event.hod_remarks}</div>
              <div><span className="font-medium text-gray-600">Dean Remarks:</span> {event.dean_remarks}</div>
              <div><span className="font-medium text-gray-600">VC Remarks:</span> {event.vc_remarks}</div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">Event not found.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default VCEventDetail; 