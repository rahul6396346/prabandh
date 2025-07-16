import React, { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';

const RED_BROWN = "#8B0000";
const WHITE = "#fff";

interface School { id: number; name: string; }
interface Programme { id: number; course: string; branch: string; academic_year: string; school: number; }
interface Subject {
  id?: number;
  subject_name: string;
  subject_code: string;
  subject_type: string;
  programme: number;
  schemes?: Scheme[];
}
interface Scheme {
  id?: number;
  subject: number;
  midterm1: number;
  midterm2: number;
  class_participation: number;
  total_credits: number;
  endterm_theory: number;
  endterm_practical: number;
  internal_viva: number;
  prograssive: number;
  total_practical_credits: number;
  total_tutorial_credits: number;
  updated_by?: string;
  is_new?: string;
  introduction_year?: string;
}

const initialSubject: Subject = {
  subject_name: '',
  subject_code: '',
  subject_type: 'Theory',
  programme: 0,
};

const initialScheme: Omit<Scheme, 'subject'> = {
  midterm1: 0,
  midterm2: 0,
  class_participation: 0,
  total_credits: 0,
  endterm_theory: 0,
  endterm_practical: 0,
  internal_viva: 0,
  prograssive: 0,
  total_practical_credits: 0,
  total_tutorial_credits: 0,
  updated_by: '',
  is_new: '',
  introduction_year: '',
};

const SubjectScheme: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedProgramme, setSelectedProgramme] = useState<number | null>(null);

  const [subjectForm, setSubjectForm] = useState<Subject>(initialSubject);
  const [schemeForm, setSchemeForm] = useState<Omit<Scheme, 'subject'>>(initialScheme);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch all schools on mount
  useEffect(() => {
    axiosInstance.get('/api/dr/organizations/schools/')
      .then(res => setSchools(res.data))
      .catch(() => setError('Failed to load schools'));
  }, []);

  // Fetch all programmes when school changes
  useEffect(() => {
    if (selectedSchool) {
      axiosInstance.get(`/api/dr/organizations/schools/?school=${selectedSchool}`)
        .then(res => {
          setProgrammes(res.data);
          const years = Array.from(new Set(res.data.map((p: Programme) => p.academic_year))) as string[];
          setSessions(years);
        })
        .catch(() => setError('Failed to load programmes'));
    } else {
      setProgrammes([]);
      setSessions([]);
    }
    setSelectedSession('');
    setSelectedProgramme(null);
  }, [selectedSchool]);

  // Filter programmes by session
  const filteredProgrammes = selectedSession
    ? programmes.filter(p => p.academic_year === selectedSession)
    : programmes;

  // Fetch all subjects with their schemes on mount and after registration
  useEffect(() => {
    axiosInstance.get('/api/dr/organizations/subjects/')
      .then(res => setSubjects(res.data))
      .catch(() => setError('Failed to load subjects'));
  }, [success]);

  // Auto-fill "Updated By" with logged-in user (from localStorage)
  // ...inside your component...
  useEffect(() => {
    let username = '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        username = userObj.primary_email || '';
      }
    } catch (e) {
      username = '';
    }
    setSchemeForm(prev => ({ ...prev, updated_by: username }));
  }, []);

  // Handle form input change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubjectForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSchemeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSchemeForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle subject+scheme registration
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // 1. Create subject
      const subjectRes = await axiosInstance.post('/api/dr/organizations/subjects/', { ...subjectForm, programme: selectedProgramme });
      const subjectId = subjectRes.data.id;
      // 2. Create scheme for this subject
      await axiosInstance.post('/api/dr/organizations/schemes/', { ...schemeForm, subject: subjectId });
      setSuccess('Subject and scheme registered successfully');
      setSubjectForm({ ...initialSubject, programme: selectedProgramme || 0 });
      setSchemeForm(prev => ({ ...initialScheme, updated_by: prev.updated_by }));
    } catch (err: any) {
      setError(err.message || 'Failed to register subject and scheme');
    } finally {
      setLoading(false);
    }
  };

  // Delete subject handler
  const handleDeleteSubject = async (subjectId: number) => {
    if (!window.confirm("Are you sure you want to delete this subject and its schemes?")) return;
    try {
      await axiosInstance.delete(`/api/dr/organizations/subjects/${subjectId}/`);
      setSuccess('Subject deleted successfully');
      // Refresh subjects list
      axiosInstance.get('/api/dr/organizations/subjects/')
        .then(res => setSubjects(res.data))
        .catch(() => setError('Failed to load subjects'));
    } catch (err: any) {
      setError('Failed to delete subject');
    }
  };

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ color: RED_BROWN, fontWeight: 700, fontSize: 32, marginBottom: 24, letterSpacing: 1 }}>
        <span style={{ verticalAlign: "middle", marginRight: 8 }}>📚</span>
        Subject Scheme Management
      </h1>
      <div style={{
        background: WHITE,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: 32,
        maxWidth: 1200,
        margin: "0 auto 2rem auto"
      }}>
        <h2 style={{ color: RED_BROWN, fontWeight: 600, fontSize: 20, marginBottom: 20 }}>
          <span style={{ verticalAlign: "middle", marginRight: 8 }}>📝</span>
          Register New Subject with Scheme
        </h2>
        <form onSubmit={handleSubjectSubmit}>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: RED_BROWN }}>School *</label>
              <select
                value={selectedSchool ?? ''}
                onChange={e => setSelectedSchool(Number(e.target.value))}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginTop: 4, background: "#fafafa" }}
                required
              >
                <option value="">Select School</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: RED_BROWN }}>Session *</label>
              <select
                value={selectedSession}
                onChange={e => setSelectedSession(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginTop: 4, background: "#fafafa" }}
                required
                disabled={!selectedSchool}
              >
                <option value="">Select Session</option>
                {sessions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: RED_BROWN }}>Programme *</label>
              <select
                value={selectedProgramme ?? ''}
                onChange={e => setSelectedProgramme(Number(e.target.value))}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginTop: 4, background: "#fafafa" }}
                required
                disabled={!selectedSession}
              >
                <option value="">Select Programme</option>
                {filteredProgrammes.map(p => (
                  <option key={p.id} value={p.id}>{p.course} - {p.branch}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: RED_BROWN }}>Subject Name *</label>
              <input
                name="subject_name"
                value={subjectForm.subject_name}
                onChange={handleSubjectChange}
                placeholder="Enter Subject Name"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginTop: 4, background: "#fafafa" }}
                required
                disabled={!selectedProgramme}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: RED_BROWN }}>Subject Code *</label>
              <input
                name="subject_code"
                value={subjectForm.subject_code}
                onChange={handleSubjectChange}
                placeholder="Enter Subject Code"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginTop: 4, background: "#fafafa" }}
                required
                disabled={!selectedProgramme}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: RED_BROWN }}>Subject Type *</label>
              <select
                name="subject_type"
                value={subjectForm.subject_type}
                onChange={handleSubjectChange}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginTop: 4, background: "#fafafa" }}
                required
                disabled={!selectedProgramme}
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
            {[
              { label: "Midterm 1", name: "midterm1" },
              { label: "Midterm 2", name: "midterm2" },
              { label: "Class Participation", name: "class_participation" },
              { label: "Total Credits", name: "total_credits" },
              { label: "Endterm Theory", name: "endterm_theory" },
              { label: "Endterm Practical", name: "endterm_practical" },
              { label: "Internal Viva", name: "internal_viva" },
              { label: "Prograssive", name: "prograssive" },
              { label: "Total Practical Credits", name: "total_practical_credits" },
              { label: "Total Tutorial Credits", name: "total_tutorial_credits" },
              { label: "Is New? (Yes/No)", name: "is_new" },
              { label: "Introduction Year", name: "introduction_year" }
            ].map(field => (
              <div key={field.name} style={{ flex: "1 1 180px" }}>
                <label style={{ fontWeight: 500, color: RED_BROWN }}>{field.label}</label>
                <input
                  name={field.name}
                  type={field.name.includes("midterm") || field.name.includes("Credits") || field.name.includes("class_participation") || field.name.includes("theory") || field.name.includes("practical") || field.name.includes("viva") || field.name === "prograssive" ? "number" : "text"}
                  value={(schemeForm as any)[field.name] || ''}
                  onChange={handleSchemeChange}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginTop: 4, background: "#fafafa" }}
                  disabled={!selectedProgramme}
                />
              </div>
            ))}
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontWeight: 500, color: RED_BROWN }}>Updated By</label>
              <input
                name="updated_by"
                value={schemeForm.updated_by}
                readOnly
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginTop: 4, background: "#f5f5f5" }}
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              background: RED_BROWN,
              color: WHITE,
              padding: "14px 0",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer",
              marginTop: 8,
              width: "100%"
            }}
            disabled={loading || !selectedProgramme}
          >
            {loading ? "Registering..." : "Register Subject"}
          </button>
          {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
          {success && <div style={{ color: "green", marginTop: 8 }}>{success}</div>}
        </form>
      </div>

      <div style={{
        background: WHITE,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ color: RED_BROWN, fontWeight: 600, fontSize: 20 }}>
            <span style={{ verticalAlign: "middle", marginRight: 8 }}>📋</span>
            Registered Subjects & Schemes
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: RED_BROWN, color: WHITE }}>
                <th style={{ padding: 8 }}>Subject Name</th>
                <th style={{ padding: 8 }}>Code</th>
                <th style={{ padding: 8 }}>Type</th>
                <th style={{ padding: 8 }}>Mid1</th>
                <th style={{ padding: 8 }}>Mid2</th>
                <th style={{ padding: 8 }}>Class Part.</th>
                <th style={{ padding: 8 }}>Credits</th>
                <th style={{ padding: 8 }}>Theory</th>
                <th style={{ padding: 8 }}>Practical</th>
                <th style={{ padding: 8 }}>Viva</th>
                <th style={{ padding: 8 }}>Progr.</th>
                <th style={{ padding: 8 }}>Prac Credits</th>
                <th style={{ padding: 8 }}>Tut Credits</th>
                <th style={{ padding: 8 }}>Updated By</th>
                <th style={{ padding: 8 }}>Is New</th>
                <th style={{ padding: 8 }}>Intro Year</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={17} style={{ textAlign: "center", color: "#888", padding: 16 }}>No subjects found.</td>
                </tr>
              ) : (
                subjects.flatMap(subject =>
                  (subject.schemes && subject.schemes.length > 0
                    ? subject.schemes.map((scheme, idx) => (
                      <tr key={scheme.id}>
                        <td style={{ padding: 8 }}>{subject.subject_name}</td>
                        <td style={{ padding: 8 }}>{subject.subject_code}</td>
                        <td style={{ padding: 8 }}>{subject.subject_type}</td>
                        <td style={{ padding: 8 }}>{scheme.midterm1}</td>
                        <td style={{ padding: 8 }}>{scheme.midterm2}</td>
                        <td style={{ padding: 8 }}>{scheme.class_participation}</td>
                        <td style={{ padding: 8 }}>{scheme.total_credits}</td>
                        <td style={{ padding: 8 }}>{scheme.endterm_theory}</td>
                        <td style={{ padding: 8 }}>{scheme.endterm_practical}</td>
                        <td style={{ padding: 8 }}>{scheme.internal_viva}</td>
                        <td style={{ padding: 8 }}>{scheme.prograssive}</td>
                        <td style={{ padding: 8 }}>{scheme.total_practical_credits}</td>
                        <td style={{ padding: 8 }}>{scheme.total_tutorial_credits}</td>
                        <td style={{ padding: 8 }}>{scheme.updated_by}</td>
                        <td style={{ padding: 8 }}>{scheme.is_new}</td>
                        <td style={{ padding: 8 }}>{scheme.introduction_year}</td>
                        {idx === 0 && (
                          <td style={{ padding: 8 }} rowSpan={subject.schemes.length}>
                            <button
                              style={{
                                background: "#e53935",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "6px 14px",
                                cursor: "pointer"
                              }}
                              onClick={() => handleDeleteSubject(subject.id!)}
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                    : (
                      <tr key={subject.id}>
                        <td style={{ padding: 8 }}>{subject.subject_name}</td>
                        <td style={{ padding: 8 }}>{subject.subject_code}</td>
                        <td style={{ padding: 8 }}>{subject.subject_type}</td>
                        <td colSpan={13} style={{ textAlign: "center", color: "#888" }}>No scheme</td>
                        <td style={{ padding: 8 }}>
                          <button
                            style={{
                              background: "#e53935",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "6px 14px",
                              cursor: "pointer"
                            }}
                            onClick={() => handleDeleteSubject(subject.id!)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubjectScheme;