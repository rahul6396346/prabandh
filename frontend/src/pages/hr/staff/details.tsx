import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import staffService from '@/services/staffService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VerifiedBadge from '@/components/ui/verified-badge';

const StaffDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    staffService.getStaffDetails(Number(id))
      .then(data => setDetails(data))
      .catch(() => setError('Failed to fetch details'))
      .finally(() => setLoading(false));
    staffService.getFacultyDocuments(Number(id))
      .then(async data => {
        console.log('Faculty documents API response (HR endpoint):', data);
        let docs = [];
        if (Array.isArray(data)) {
          docs = data;
        } else if (data && Array.isArray(data.results)) {
          docs = data.results;
        }
        // Fallback: if no docs, try the faculty endpoint
        if (docs.length === 0) {
          try {
            const fallback = await staffService.getFacultyDocumentsFallback(Number(id));
            console.log('Faculty documents API response (fallback endpoint):', fallback.data);
            if (Array.isArray(fallback)) {
              docs = fallback;
            } else if (fallback && Array.isArray(fallback.results)) {
              docs = fallback.results;
            }
          } catch {}
        }
        setDocuments(docs);
      })
      .catch(() => setDocuments([]));
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!details) return <div className="p-6">No details found.</div>;

  // Debug: log and show documents
  console.log('Documents to render:', documents);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
        &larr; Back to Staff List
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-[#8B0000] flex items-center gap-2">
            Faculty Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(details).map(([key, value]) => (
              <div key={key}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{key.replace(/_/g, ' ')}</div>
                <div className="font-medium text-gray-900 break-all flex items-center gap-1">
                  {key === 'email' ? (
                    <>
                      {String(value) || '-'}
                      {details.is_staff && <VerifiedBadge />}
                    </>
                  ) : (
                    String(value) || '-'
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Documents Section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#8B0000] mb-2">Uploaded Documents</h2>
            {/* Debug output for documents */}
            {/* <pre className="text-xs text-gray-400 bg-gray-100 p-2 rounded mb-2">{JSON.stringify(documents, null, 2)}</pre> */}
            {documents.length === 0 ? (
              <div className="text-gray-500">No documents uploaded.</div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col md:flex-row md:items-center md:gap-4 border-b pb-2">
                    <div className="font-medium text-gray-800">{doc.document_type}</div>
                    <div className="text-xs text-gray-500">Uploaded: {new Date(doc.uploaded_at).toLocaleString()}</div>
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mt-1 md:mt-0"
                    >
                      View/Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        {/* Approval Button at the end of details page */}
        {details.is_staff === false && (
          <div className="p-6 flex justify-end">
            <Button
              variant="default"
              color="green"
              onClick={async () => {
                try {
                  await staffService.approveStaff(details.id);
                  setDetails({ ...details, is_staff: true });
                  alert('Staff approved successfully!');
                } catch (e) {
                  alert('Failed to approve staff.');
                }
              }}
            >
              Approve
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StaffDetailsPage; 