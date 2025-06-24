import React, { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface Programme {
  id: number;
  course: string;
  branch: string;
  academic_year: string;
}

interface Subject {
  id?: number;
  subject_name: string;
  programme: number;
  subject_code: string;
  subject_type: string;
}

export default function SubjectPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [form, setForm] = useState<Subject>({
    programme: 0,
    subject_name: '',
    subject_code: '',
    subject_type: 'Theory',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use correct API URLs for backend
        const programmesRes = await axiosInstance.get('/api/dr/organizations/programmes/');
        setProgrammes(programmesRes.data || []);
        const subjectsRes = await axiosInstance.get('/api/dr/organizations/subjects/');
        setSubjects(subjectsRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Reset subject fields when programme changes
  const handleProgrammeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({
      programme: Number(e.target.value),
      subject_name: '',
      subject_code: '',
      subject_type: 'Theory',
    });
  };

  const handleSubmit = async () => {
    try {
      await axiosInstance.post('api/dr/organizations/subjects', form);
      const res = await axiosInstance.get('/api/dr/organizations/subjects/');
      setSubjects(res.data || []);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit form.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const filteredSubjects = Array.isArray(subjects)
    ? subjects.filter(sub =>
        sub.subject_name.toLowerCase().includes(filter.toLowerCase()) ||
        sub.subject_code.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[#8B0000]">Register Subject</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-white rounded-lg shadow p-6 mb-8 space-y-4">
        <div>
          <label className="block font-medium mb-1">Programme <span className="text-red-500">*</span></label>
          <select
            name="programme"
            value={form.programme}
            onChange={handleProgrammeChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select Programme</option>
            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.course} - {programme.branch} ({programme.academic_year})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Subject Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="subject_name"
            value={form.subject_name}
            onChange={handleChange}
            placeholder="Enter Subject Name"
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
            disabled={!form.programme}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Subject Code <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="subject_code"
            value={form.subject_code}
            onChange={handleChange}
            placeholder="Enter Subject Code"
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
            disabled={!form.programme}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Subject Type <span className="text-red-500">*</span></label>
          <select
            name="subject_type"
            value={form.subject_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
            disabled={!form.programme}
          >
            <option value="Theory">Theory</option>
            <option value="Practical">Practical</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-[#8B0000] text-white py-2 rounded hover:bg-[#a80000] transition">Register Subject</button>
      </form>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#8B0000]">Registered Subjects</h2>
        <input
          type="text"
          placeholder="Filter subjects..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 w-64"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Programme</TableHead>
            <TableHead>Subject Name</TableHead>
            <TableHead>Subject Code</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">No subjects found.</TableCell>
            </TableRow>
          ) : (
            filteredSubjects.map((subject) => {
              const prog = programmes.find(p => p.id === subject.programme);
              return (
                <TableRow key={subject.id}>
                  <TableCell>{prog ? `${prog.course} - ${prog.branch} (${prog.academic_year})` : subject.programme}</TableCell>
                  <TableCell>{subject.subject_name}</TableCell>
                  <TableCell>{subject.subject_code}</TableCell>
                  <TableCell>{subject.subject_type}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}