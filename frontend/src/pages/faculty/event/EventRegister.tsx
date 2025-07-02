import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from '@/lib/axios';
import { schoolService, School } from '@/services/schoolService';
import { programmeService } from '@/services/programmeService';
import { eventService } from '@/services/eventService';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { set } from 'date-fns';
import { usePushNotify } from '@/hooks/usePushNotify';

interface EventType {
  id: number;
  type: string;
}

interface EventSubType {
  id: number;
  name: string;
  event_type: number;
}

const initialState = {
  academic_slot: '',
  school: '',
  course: '',
  event_name: '',
  bodies: '',
  event_type: '',
  event_sub_type: '',
  event_budget: '',
  total_amount_spent: '',
  event_venue: '',
  audience_type: '',
  fromdate: '',
  todate: '',
  timeslot: '',
  event_description: '',
  event_outcomes: '',
  coordinator1: '',
  coordinator2: '',
  coordinator3: '',
  coordinator4: '',
  coordinator5: '',
  resource_person1: '',
  resource_person2: '',
  resource_person3: '',
  resource_person4: '',
  resource_person5: '',
  resource_person6: '',
  resource_person7: '',
  resource_person8: '',
  event_remark: '',
  hod_remark: '',
  dean_remark: '',
  upload_by: '',
  values_and_attributes: '',
  event_outcomes_text: '',
  backdrop: '',
  standee: '',
  creative: '',
  certificate: '',
  other_requirements: '',
};

const EventRegister: React.FC = () => {
  const { toast } = useToast();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventSubTypes, setEventSubTypes] = useState<EventSubType[]>([]);
  const [filteredSubTypes, setFilteredSubTypes] = useState<EventSubType[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [facultyByDept, setFacultyByDept] = useState<{ [key: string]: any[] }>({});
  const [coordinatorDepartments, setCoordinatorDepartments] = useState<string[]>(['', '', '', '', '']);
  const [coordinatorFaculty, setCoordinatorFaculty] = useState<string[]>(['', '', '', '', '']);

  // Resource Persons Tabs State
  const [resourceTabs, setResourceTabs] = useState([
    { id: 1, value: form.resource_person1 || '' }
  ]);

  // Add state for dynamic dropdowns
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>([]);

  // Other Bodies static options
  const OTHER_BODIES_OPTIONS = [
    { value: 'WEC', label: 'WEC' },
    { value: 'TAP', label: 'TAP' },
    { value: 'DSW', label: 'DSW' },
  ];

  // Venue static options
  const VENUE_OPTIONS = [
    { value: 'Madhulmaye Hall', label: 'Madhulmaye Hall' },
    { value: 'LDV', label: 'LDV' },
  ];

  const { requestPermission, pushNotify } = usePushNotify();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    axios.get('/api/facultyservices/event-types/')
      .then(res => setEventTypes(res.data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load event types', variant: 'destructive' }));
  }, [toast]);

  useEffect(() => {
    if (form.event_type) {
      axios.get(`/api/facultyservices/event-subtypes/?event_type=${form.event_type}`)
        .then(res => setFilteredSubTypes(res.data))
        .catch(() => toast({ title: 'Error', description: 'Failed to load event subtypes', variant: 'destructive' }));
    } else {
      setFilteredSubTypes([]);
      setForm(f => ({ ...f, event_sub_type: '' }));
    }
  }, [form.event_type, toast]);

  useEffect(() => {
    schoolService.getAllSchools()
      .then(
        (schools)=>{
          setSchools(schools);
        }
      )
      .catch(() => toast({ title: 'Error', description: 'Failed to load schools', variant: 'destructive' }));
  }, [toast]);

  // Fetch departments on mount
  useEffect(() => {
    axios.get('/api/auth/departments/')
      .then(res => setDepartments(res.data.departments))
      .catch(() => toast({ title: 'Error', description: 'Failed to load departments', variant: 'destructive' }));
  }, [toast]);

  // Fetch faculty for each selected department
  useEffect(() => {
    coordinatorDepartments.forEach((dept, idx) => {
      if (dept && !facultyByDept[dept]) {
        axios.get(`/api/auth/faculty-by-department/?department=${encodeURIComponent(dept)}`)
          .then(res => setFacultyByDept(prev => ({ ...prev, [dept]: res.data.faculty })))
          .catch(() => toast({ title: 'Error', description: `Failed to load faculty for ${dept}`, variant: 'destructive' }));
      }
    });
  }, [coordinatorDepartments, facultyByDept, toast]);

  // Fetch courses when school changes
  useEffect(() => {
    if (form.school) {
      programmeService.getCoursesBySchool(Number(form.school))
        .then(courses => {
          // Remove duplicates
          const uniqueCourses = Array.from(new Set(courses));
          setCourseOptions(uniqueCourses);
        })
        .catch(() => setCourseOptions([]));
      setForm(f => ({ ...f, course: '', academic_slot: '' }));
      setYearOptions([]);
    } else {
      setCourseOptions([]);
      setYearOptions([]);
    }
  }, [form.school]);

  //Fetch academic years when course changes
  useEffect(() => {
    if (form.school && form.course) {
      programmeService.getYearsByCourse(Number(form.school), form.course)
        .then(setYearOptions)
        .catch(() => setYearOptions([]));
      setForm(f => ({ ...f, academic_slot: '' }));
    } else {
      setYearOptions([]);
    }
  }, [form.school, form.course]);

  // Auto-refresh event types and subtypes every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('/api/facultyservices/event-types/')
        .then(res => setEventTypes(res.data))
        .catch(() => toast({ title: 'Error', description: 'Failed to load event types', variant: 'destructive' }));
      if (form.event_type) {
        axios.get(`/api/facultyservices/event-subtypes/?event_type=${form.event_type}`)
          .then(res => setFilteredSubTypes(res.data))
          .catch(() => toast({ title: 'Error', description: 'Failed to load event subtypes', variant: 'destructive' }));
      }
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, [form.event_type, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Filtered faculty options for each coordinator (to prevent duplicate selection)
  const getAvailableFacultyOptions = (idx: number) => {
    // Get all selected faculty except for the current index
    const selectedFaculty = coordinatorFaculty.filter((f, i) => f && i !== idx);
    const dept = coordinatorDepartments[idx];
    return (facultyByDept[dept] || []).filter(fac => !selectedFaculty.includes(fac.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // At least one coordinator must be selected
    if (!coordinatorFaculty[0]) {
      toast({ title: 'Validation Error', description: 'At least one event coordinator is required.', variant: 'destructive' });
      return;
    }
    // At least one value/SDG must be selected
    if (form.values_and_attributes.split(',').filter(Boolean).length === 0) {
      toast({ title: 'Validation Error', description: 'Please select at least one value or SDG goal.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Find the event type name from the selected id
      const selectedType = eventTypes.find(type => String(type.id) === String(form.event_type));
      const formToSend = {
        ...form,
        event_type: selectedType ? selectedType.type : form.event_type,
      };
      await eventService.registerEvent(formToSend);
      toast({ title: 'Success', description: 'Event registered and sent for approval.' });
      pushNotify("New Event Submitted", {
        body: `Your event \"${form.event_name}\" has been submitted for approval.`,
      });
      setForm(initialState);
    } catch {
      toast({ title: 'Error', description: 'Failed to register event.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Resource Person tab value change
  const handleResourceTabChange = (idx: number, value: string) => {
    setResourceTabs(tabs => tabs.map((tab, i) => i === idx ? { ...tab, value } : tab));
    // Optionally, update form state for the first 8 resource persons
    if (idx < 8) {
      setForm(f => ({ ...f, [`resource_person${idx + 1}`]: value }));
    }
  };

  // Add new Resource Person tab
  const handleAddResourceTab = () => {
    setResourceTabs(tabs => [...tabs, { id: tabs.length + 1, value: '' }]);
  };

  // Remove Resource Person tab
  const handleRemoveResourceTab = (idx: number) => {
    setResourceTabs(tabs => tabs.length === 1 ? tabs : tabs.filter((_, i) => i !== idx));
    // Optionally, clear the corresponding form field if within first 8
    if (idx < 8) {
      setForm(f => ({ ...f, [`resource_person${idx + 1}`]: '' }));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#8B0000] to-[#A52A2A] text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Register Event</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#8B0000] border-b-2 border-[#8B0000] pb-2">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="school" value={form.school} onChange={handleChange} required className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]">
                  <option value="">Select School *</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
                <Select
                  value={form.course}
                  onValueChange={value => setForm(f => ({ ...f, course: value }))}
                  required
                  disabled={!form.school || schools.length === 0}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-[#8B0000]">
                  <SelectValue placeholder="Select Course *" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseOptions.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={form.academic_slot}
                  onValueChange={value => setForm(f => ({ ...f, academic_slot: value }))}
                  required
                  disabled={!form.school || !form.course || yearOptions.length === 0}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-[#8B0000]">
                    <SelectValue placeholder="Select Academic Year *" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  name="event_name" 
                  value={form.event_name} 
                  onChange={handleChange} 
                  placeholder="Event Name" 
                  required 
                  className="focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                />
                <select 
                  name="event_type" 
                  value={form.event_type} 
                  onChange={handleChange} 
                  required 
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                >
                  <option value="">Select Event Type *</option>
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.type}</option>
                  ))}
                </select>
                <select 
                  name="event_sub_type" 
                  value={form.event_sub_type} 
                  onChange={handleChange} 
                  required 
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]" 
                  disabled={!form.event_type}
                >
                  <option value="">Select Event Subtype *</option>
                  {filteredSubTypes.map(sub => (
                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Event Details Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#8B0000] border-b-2 border-[#8B0000] pb-2">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-gray-700">Other Bodies</label>
                  <div className="border border-gray-300 rounded px-3 py-2 bg-white">
                    {OTHER_BODIES_OPTIONS.map(opt => (
                      <label key={opt.value} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={form.bodies.split(',').includes(opt.value)}
                          onChange={e => {
                            const selected = form.bodies ? form.bodies.split(',').filter(Boolean) : [];
                            let updated;
                            if (e.target.checked) {
                              updated = [...selected, opt.value];
                            } else {
                              updated = selected.filter(v => v !== opt.value);
                            }
                            setForm(f => ({ ...f, bodies: updated.join(',') }));
                          }}
                          className="mr-1"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
                <Input 
                  name="event_budget" 
                  value={form.event_budget} 
                  onChange={handleChange} 
                  placeholder="Event Budget" 
                  className="focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                />
                <Input 
                  name="total_amount_spent" 
                  value={form.total_amount_spent} 
                  onChange={handleChange} 
                  placeholder="Total Amount Spent" 
                  className="focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                />
                <select
                  name="event_venue"
                  value={form.event_venue}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                  required
                >
                  <option value="">Select Venue</option>
                  {VENUE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select 
                  name="audience_type" 
                  value={form.audience_type} 
                  onChange={handleChange} 
                  required 
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                >
                  <option value="">Audience Type</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Students">Students</option>
                  <option value="Admin Staff">Admin Staff</option>
                  <option value="Research Scholar">Research Scholar</option>
                  <option value="External Faculty">External Faculty</option>
                  <option value="General Public">General Public</option>
                </select>
              </div>
            </div>

            {/* Duration Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#8B0000] border-b-2 border-[#8B0000] pb-2">Duration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-gray-700">From Date:</label>
                  <Input 
                    name="fromdate" 
                    value={form.fromdate} 
                    onChange={handleChange} 
                    placeholder="From Date" 
                    type="date" 
                    required 
                    className="focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-gray-700">To Date:</label>
                  <Input 
                    name="todate" 
                    value={form.todate} 
                    onChange={handleChange} 
                    placeholder="To Date" 
                    type="date" 
                    required 
                    className="focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-gray-700">Time Slot:</label>
                  <select 
                    name="timeslot" 
                    value={form.timeslot} 
                    onChange={handleChange} 
                    required 
                    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                  >
                    <option value="">Select Time Slot</option>
                    <option value="9-12">9:00 AM - 12:00 PM</option>
                    <option value="1-5">1:00 PM - 5:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Event Description Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#8B0000] border-b-2 border-[#8B0000] pb-2">Event Description</h2>
              <div className="flex flex-col">
                <textarea
                  name="event_description"
                  value={form.event_description}
                  onChange={handleChange}
                  placeholder="Enter detailed event description..."
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] min-h-[100px]"
                />
              </div>
            </div>

            {/* Event Outcomes Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#8B0000] border-b-2 border-[#8B0000] pb-2">Event Outcomes</h2>
              <div className="flex flex-col">
                <span className="text-gray-600 text-sm mb-2">
                  After attending this event the beneficiaries will be able to:
                </span>
                <textarea
                  name="event_outcomes"
                  value={form.event_outcomes}
                  onChange={handleChange}
                  placeholder="List at least 3 outcomes in terms of Values, Attributes and SDG Goals..."
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] min-h-[100px]"
                />
              </div>
            </div>

            {/* Event Coordinators Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#8B0000] border-b-2 border-[#8B0000] pb-2">Event Coordinators</h2>
              <div className="grid grid-cols-1 gap-4">
                {[0,1,2,3,4].map(idx => (
                  <React.Fragment key={idx}>
                    <div className="flex gap-2 items-center bg-gray-50 p-4 rounded-lg">
                      <select
                        value={coordinatorDepartments[idx]}
                        onChange={e => {
                          const newDepts = [...coordinatorDepartments];
                          newDepts[idx] = e.target.value;
                          setCoordinatorDepartments(newDepts);
                          const newFaculty = [...coordinatorFaculty];
                          newFaculty[idx] = '';
                          setCoordinatorFaculty(newFaculty);
                        }}
                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] flex-1"
                        required={idx === 0}
                      >
                        <option value="">Choose Department</option>
                        {departments.map(dep => (
                          <option key={dep} value={dep}>{dep}</option>
                        ))}
                      </select>
                      <select
                        value={coordinatorFaculty[idx]}
                        onChange={e => {
                          const newFaculty = [...coordinatorFaculty];
                          newFaculty[idx] = e.target.value;
                          setCoordinatorFaculty(newFaculty);
                        }}
                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] flex-1"
                        disabled={!coordinatorDepartments[idx]}
                        required={idx === 0}
                      >
                        <option value="">Choose Faculty</option>
                        {getAvailableFacultyOptions(idx).map(fac => (
                          <option key={fac.id} value={fac.name}>{fac.name} ({fac.designation})</option>
                        ))}
                      </select>
                      {idx > 0 && (
                        <Button
                          type="button"
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 h-7 w-7 flex items-center justify-center rounded-full text-xs"
                          onClick={() => {
                            const newDepts = [...coordinatorDepartments];
                            const newFaculty = [...coordinatorFaculty];
                            newDepts.splice(idx, 1);
                            newFaculty.splice(idx, 1);
                            while (newDepts.length < 5) newDepts.push("");
                            while (newFaculty.length < 5) newFaculty.push("");
                            setCoordinatorDepartments(newDepts);
                            setCoordinatorFaculty(newFaculty);
                          }}
                          title="Remove"
                        >
                          x
                        </Button>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Resource Persons Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#8B0000] border-b-2 border-[#8B0000] pb-2">Resource Persons</h2>
              <div className="flex gap-2 mb-4 justify-end">
                <Button 
                  type="button" 
                  onClick={handleAddResourceTab} 
                  className="bg-[#8B0000] hover:bg-[#A52A2A] text-white"
                >
                  Add Resource Person
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {resourceTabs.map((tab, idx) => (
                  <div key={tab.id} className="flex gap-2 items-start">
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] min-h-[80px]"
                      placeholder={`Resource Person details${resourceTabs.length > 1 ? ` (${idx + 1})` : ''}`}
                      value={tab.value}
                      onChange={e => handleResourceTabChange(idx, e.target.value)}
                    />
                    {resourceTabs.length > 1 && (
                      <Button 
                        type="button" 
                        onClick={() => handleRemoveResourceTab(idx)} 
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 h-8"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Values and Attributes, SDG(Goals) Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#8B0000] border-b-2 border-[#8B0000] pb-2">Values and Attributes, SDG(Goals)</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                {[
                  'Skill Development',
                  'SDG1',
                  'No poverty',
                  'Entrepreneurship',
                  'Employability',
                  'Professional Ethics',
                  'Gender',
                  'Zero hunger',
                  'SDG3',
                  'Good health and well-being',
                  'SDG4',
                  'Quality education',
                  'SDG5',
                  'Gender equality',
                ].map(option => (
                  <label key={option} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      value={option}
                      checked={form.values_and_attributes.split(',').includes(option)}
                      onChange={e => {
                        const selected = form.values_and_attributes ? form.values_and_attributes.split(',').filter(Boolean) : [];
                        let updated;
                        if (e.target.checked) {
                          updated = [...selected, option];
                        } else {
                          updated = selected.filter(v => v !== option);
                        }
                        setForm(f => ({ ...f, values_and_attributes: updated.join(',') }));
                      }}
                      className="w-4 h-4 text-[#8B0000] focus:ring-[#8B0000] border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {form.values_and_attributes.split(',').filter(Boolean).length === 0 && (
                <div className="text-red-600 text-sm mt-2">Please select at least one value or SDG goal.</div>
              )}
            </div>

            {/* Design Cell Requirements Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#8B0000] border-b-2 border-[#8B0000] pb-2">Design Cell Requirements</h2>
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="min-w-[180px] font-medium text-gray-700">Backdrop Venue</span>
                  <Input
                    name="backdrop"
                    value={form.backdrop}
                    onChange={handleChange}
                    placeholder="If required, enter venue otherwise leave it blank"
                    className="focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <span className="min-w-[180px] font-medium text-gray-700">Standee</span>
                  <Input
                    name="standee"
                    value={form.standee}
                    onChange={handleChange}
                    placeholder="If required, enter number otherwise leave it blank"
                    className="focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <span className="min-w-[80px] font-medium text-gray-700">Creative</span>
                  <div className="flex flex-wrap gap-4">
                    {['Facebook', 'Instagram', 'LMS', 'LinkedIn', 'MIS'].map((platform) => (
                      <label key={platform} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                        <input
                          type="checkbox"
                          checked={form.creative?.split(',').includes(platform)}
                          onChange={e => {
                            const selected = form.creative ? form.creative.split(',').filter(Boolean) : [];
                            let updated;
                            if (e.target.checked) {
                              updated = [...selected, platform];
                            } else {
                              updated = selected.filter(p => p !== platform);
                            }
                            setForm(f => ({ ...f, creative: updated.length > 0 ? updated.join(',') : '' }));
                          }}
                          className="w-4 h-4 text-[#8B0000] focus:ring-[#8B0000] border-gray-300 rounded"
                        />
                        <span className="text-gray-700">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="min-w-[180px] font-medium text-gray-700">Certificate Quantity</span>
                  <Input
                    name="certificate"
                    value={form.certificate}
                    onChange={handleChange}
                    placeholder="If required, enter number otherwise leave it blank"
                    className="focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <span className="min-w-[180px] font-medium text-gray-700">Other Requirements</span>
                  <Input
                    name="other_requirements"
                    value={form.other_requirements}
                    onChange={handleChange}
                    placeholder="If required, enter value otherwise leave it blank"
                    className="focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-[#8B0000] hover:bg-[#A52A2A] text-white px-8 py-2"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Register & Send for VC Approval'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventRegister;
