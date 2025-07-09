import React, { useEffect, useState } from 'react';
import staffService, { StaffListItem } from '@/services/staffService';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import hrRoutes from "@/routes/hr-routes";


const ViewStaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    staffService.getAllStaff()
      .then(data => setStaff(data))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredStaff = staff.filter(item => {
    const q = search.toLowerCase();
    return (
      item.full_name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q) ||
      item.school.toLowerCase().includes(q) ||
      item.employee_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#8B0000] mb-6">View Staff</h1>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <Input
          type="text"
          placeholder="Search by name, email, department, school, or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="bg-white rounded-md shadow-sm p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email ID</TableHead>
              <TableHead>Employee Type</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No staff found.</TableCell>
              </TableRow>
            ) : (
              filteredStaff.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.full_name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.employee_type}</TableCell>
                  <TableCell>{item.school}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/hr/staff/view/${item.id}`)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ViewStaffPage; 