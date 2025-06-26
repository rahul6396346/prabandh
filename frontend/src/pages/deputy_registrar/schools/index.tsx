import React, { useState, useEffect } from 'react';
import { School, schoolService } from '../../../services/schoolService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, Trash2, School as SchoolIcon, Search } from 'lucide-react';

export default function SchoolsPage() {
  console.log('SchoolsPage component mounted');
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('SchoolsPage useEffect running');
    // Always reload schools on mount and when the page becomes visible (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSchools();
      }
    };
    // Also reload on window focus (for browser compatibility)
    const handleWindowFocus = () => {
      loadSchools();
    };
    loadSchools();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadSchools();
    }, 30000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, []);

  const loadSchools = async () => {
    try {
      const data = await schoolService.getAllSchools();
      console.log('Schools API response:', data);
      setSchools(data);
    } catch (error) {
      console.error('Failed to load schools:', error);
      toast({
        title: "Error",
        description: "Failed to load schools",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    // Check for duplicate school name (case-insensitive)
    const duplicate = schools.some(school => school.name.trim().toLowerCase() === newSchoolName.trim().toLowerCase());
    if (duplicate) {
      toast({
        title: "Validation Error",
        description: "A school with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await schoolService.createSchool({ name: newSchoolName });
      setNewSchoolName('');
      await loadSchools(); // Immediately reload after creation
      toast({
        title: "Success",
        description: "School created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create school",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await schoolService.deleteSchool(id);
      await loadSchools(); // Immediately reload after deletion
      toast({
        title: "Success",
        description: "School deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete school",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-[#8B0000]" />
          <h1 className="text-2xl font-bold text-[#8B0000]">School Management</h1>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Add School Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <SchoolIcon className="h-5 w-5 text-[#8B0000]" />
              Register New School
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="Enter school name"
                  className="pl-10 border-gray-200 focus:border-[#8B0000] focus:ring-[#8B0000] transition-all duration-300"
                />
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <Button 
                type="submit"
                className="bg-[#8B0000] hover:bg-[#6d0000] text-white flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Plus className="h-5 w-5" />
                Add School
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Schools List Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#8B0000]" />
              Registered Schools
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[100px] font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">School Name</TableHead>
                    <TableHead className="w-[100px] text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Building2 className="h-8 w-8 text-gray-300" />
                          <p>No schools registered yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    schools.map((school) => (
                      <TableRow key={school.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono text-sm text-gray-500">#{school.id}</TableCell>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => school.id && handleDelete(school.id)}
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
