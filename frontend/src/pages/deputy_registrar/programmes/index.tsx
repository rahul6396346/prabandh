import React, { useState, useEffect, useCallback } from 'react';
import { Programme, programmeService, COURSE_TYPE, SYSTEM_TYPE, EDUCATION_LEVEL, REGULATORY_BODIES, NEP_OPTIONS, NAAC_OPTIONS } from '../../../services/programmeService';
import { School, schoolService } from '../../../services/schoolService';
import { Department, departmentService } from '../../../services/departmentService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Search, Trash2, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateFormData } from '@/lib/form-validation';

type ProgrammeFormData = Omit<Programme, 'id' | 'school_details' | 'department_details'>;

const initialFormData: ProgrammeFormData = {
  academic_year: '',
  course: '',
  branch: '',
  semester: '',
  school: 0,
  department: 0,
  type: 'SemesterWise',
  system_type: 'GradingWise',
  education_level: 'UG',
  regulatory_bodies: 'AICTE',
  nep_non_nep: 'Non-NEP',
  naac_non_naac: 'NAAC'
};

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<ProgrammeFormData>(initialFormData);

  // Filter state
  const [selectedSchool, setSelectedSchool] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [schoolsData, programmesData] = await Promise.all([
        schoolService.getAllSchools(),
        programmeService.getAllProgrammes(selectedSchool ? { school: selectedSchool } : undefined)
      ]);
      setSchools(schoolsData);
      setProgrammes(programmesData);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, toast]);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    // Fetch departments for the selected school
    if (formData.school) {
      departmentService.getAllDepartments().then(depts => {
        setDepartments(depts.filter(d => d.school === formData.school));
      });
      // Reset department selection when school changes
      setFormData(prev => ({ ...prev, department: 0 }));
    } else {
      setDepartments([]);
      setFormData(prev => ({ ...prev, department: 0 }));
    }
  }, [formData.school]);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['academic_year', 'course', 'branch', 'semester', 'school', 'department'];
    const validationErrors = validateFormData(formData, requiredFields);

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.map(err => `${err.field}: ${err.message}`).join('\n'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      const formattedData = {
        ...formData,
        academic_year: formData.academic_year.trim(),
        course: formData.course.trim(),
        branch: formData.branch.trim(),
        semester: formData.semester.trim(),
      };
      
      await programmeService.createProgramme(formattedData);
      resetForm();
      await loadData(); // Immediately reload after creation
      toast({
        title: "Success",
        description: "Programme created successfully",
      });
    } catch (error) {
      console.error('Error creating programme:', error);
      toast({
        title: "Error",
        description:  "Programme already exists ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this programme?')) return;

    try {
      setLoading(true);
      await programmeService.deleteProgramme(id);
      await loadData(); // Immediately reload after deletion
      toast({
        title: "Success",
        description: "Programme deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete programme",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProgrammes = programmes.filter(prog => {
    const searchMatch = searchTerm === '' || 
      prog.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.academic_year.toLowerCase().includes(searchTerm.toLowerCase());
    
    const tabMatch = activeTab === 'all' || 
      prog.education_level.toLowerCase() === activeTab.toLowerCase();
    
    return searchMatch && tabMatch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-[#8B0000]" />
          <h1 className="text-2xl font-bold text-[#8B0000]">Programme Management</h1>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#8B0000]" />
            Register New Programme
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <Select 
              value={formData.school ? formData.school.toString() : ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, school: parseInt(value) }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select School *" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id?.toString() || ''}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={formData.department ? formData.department.toString() : ''}
              onValueChange={value => setFormData(prev => ({ ...prev, department: parseInt(value) }))}
              disabled={!formData.school}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department *" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              value={formData.course}
              onChange={e => setFormData(prev => ({ ...prev, course: e.target.value }))}
              placeholder="Course *"
              className="border-gray-200"
              required
            />
            <Input
              type="text"
              value={formData.academic_year}
              onChange={e => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
              placeholder="Academic Year *"
              className="border-gray-200"
              required
            />
            <Input
              type="text"
              value={formData.branch}
              onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
              placeholder="Branch *"
              className="border-gray-200"
              required
            />
            <Input
              type="text"
              value={formData.semester}
              onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
              placeholder="Semester *"
              className="border-gray-200"
              required
            />
          
            <Select 
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_TYPE.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={formData.system_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, system_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select System Type" />
              </SelectTrigger>
              <SelectContent>
                {SYSTEM_TYPE.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={formData.education_level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, education_level: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Education Level" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVEL.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={formData.regulatory_bodies}
              onValueChange={(value) => setFormData(prev => ({ ...prev, regulatory_bodies: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Regulatory Body" />
              </SelectTrigger>
              <SelectContent>
                {REGULATORY_BODIES.map((body) => (
                  <SelectItem key={body.value} value={body.value}>
                    {body.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={formData.nep_non_nep}
              onValueChange={(value) => setFormData(prev => ({ ...prev, nep_non_nep: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select NEP Status" />
              </SelectTrigger>
              <SelectContent>
                {NEP_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={formData.naac_non_naac}
              onValueChange={(value) => setFormData(prev => ({ ...prev, naac_non_naac: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select NAAC Status" />
              </SelectTrigger>
              <SelectContent>
                {NAAC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="col-span-full">
              <Button 
                type="submit"
                className="w-full bg-[#8B0000] hover:bg-[#6d0000] text-white"
                disabled={loading || isSubmitting}
              >
                {(loading || isSubmitting) ? 'Creating...' : 'Create Programme'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <div className="space-y-4">
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#8B0000]" />
                Registered Programmes
              </div>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedSchool.toString()}
                  onValueChange={(value) => setSelectedSchool(parseInt(value))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by School" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Schools</SelectItem>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id?.toString() || ''}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Input
                    type="text"
                    placeholder="Search programmes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardTitle>
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Programmes</TabsTrigger>
                <TabsTrigger value="ug">UG</TabsTrigger>
                <TabsTrigger value="pg">PG</TabsTrigger>
                <TabsTrigger value="diploma">Diploma</TabsTrigger>
                <TabsTrigger value="pg_diploma">PG Diploma</TabsTrigger>
                <TabsTrigger value="phd">PhD</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Education Level</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProgrammes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      <div className="flex flex-col items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-gray-300" />
                        <p>{loading ? 'Loading programmes...' : programmes.length === 0 ? 'No programmes registered yet' : 'No programmes match your search'}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProgrammes.map((programme) => (
                    <TableRow key={programme.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-mono text-sm text-gray-500">#{programme.id}</TableCell>
                      <TableCell className="font-medium">{programme.course}</TableCell>
                      <TableCell>{programme.branch}</TableCell>
                      <TableCell>{programme.academic_year}</TableCell>
                      <TableCell>{programme.semester}</TableCell>
                      <TableCell>{programme.school_details?.name}</TableCell>
                      <TableCell>{programme.department_details?.name || ''}</TableCell>
                      <TableCell>{programme.type}</TableCell>
                      <TableCell>{programme.education_level}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => programme.id && handleDelete(programme.id)}
                          className="h-8 px-3"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}