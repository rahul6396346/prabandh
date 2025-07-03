import React, { useState, useEffect } from 'react';
import { Department, departmentService } from '../../../services/departmentService';
import { School, schoolService } from '../../../services/schoolService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, Trash2, School as SchoolIcon, Search } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDepartments();
    loadSchools();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    }
  };

  const loadSchools = async () => {
    try {
      const data = await schoolService.getAllSchools();
      setSchools(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load schools",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim() || !selectedSchool) return;

    // Check for duplicate department name under the same school
    const duplicate = departments.some(
      dept => dept.name.trim().toLowerCase() === newDepartmentName.trim().toLowerCase() && dept.school === selectedSchool
    );
    if (duplicate) {
      toast({
        title: "Validation Error",
        description: "A department with this name already exists under the selected school.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await departmentService.createDepartment({ name: newDepartmentName, school: selectedSchool });
      setNewDepartmentName('');
      setSelectedSchool('');
      await loadDepartments();
      toast({
        title: "Success",
        description: "Department created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await departmentService.deleteDepartment(id);
      await loadDepartments();
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-[#8B0000]" />
          <h1 className="text-2xl font-bold text-[#8B0000]">Department Management</h1>
        </div>
      </div>
      <div className="grid gap-6">
        {/* Add Department Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <SchoolIcon className="h-5 w-5 text-[#8B0000]" />
              Register New Department
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap items-center">
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedSchool}
                  onChange={e => setSelectedSchool(Number(e.target.value))}
                  className="w-full border-gray-200 rounded px-3 py-2 focus:border-[#8B0000] focus:ring-[#8B0000]"
                  required
                >
                  <option value="">Select School</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <Input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="Enter department name"
                  className="pl-10 border-gray-200 focus:border-[#8B0000] focus:ring-[#8B0000] transition-all duration-300"
                  disabled={!selectedSchool}
                />
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <Button
                type="submit"
                className="bg-[#8B0000] hover:bg-[#6d0000] text-white flex items-center gap-2"
                disabled={isSubmitting || !selectedSchool || !newDepartmentName.trim()}
              >
                <Plus className="h-5 w-5" />
                Add Department
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Departments List Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#8B0000]" />
              Registered Departments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[100px] font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Department Name</TableHead>
                    <TableHead className="font-semibold">School</TableHead>
                    <TableHead className="w-[100px] text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Building2 className="h-8 w-8 text-gray-300" />
                          <p>No departments registered yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((dept) => (
                      <TableRow key={dept.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono text-sm text-gray-500">#{dept.id}</TableCell>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell className="font-medium">{dept.school_name || (schools.find(s => s.id === dept.school)?.name || dept.school)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => dept.id && handleDelete(dept.id)}
                            className="h-8 px-3"
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
    </div>
  );
} 