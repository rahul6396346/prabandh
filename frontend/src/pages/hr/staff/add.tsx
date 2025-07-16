import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const AddStaffPage = () => {
  const [formData, setFormData] = useState({
    school: '',
    department: '',
    employType: '',
    registrationNo: '',
    name: '',
    fatherName: '',
    gender: '',
    category: '',
    dob: '',
    designation: '',
    contactNo: '',
    primaryEmail: '',
    officialEmail: '',
    address: '',
    joiningDate: '',
    qualification: '',
    experience: '',
    maritalStatus: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    // Add API call to submit data here
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#8B0000] mb-6">Add Staff</h1>
      
      <div className="bg-white rounded-md shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* School Selection */}
            <div className="form-group">
              <label htmlFor="school" className="block text-sm font-medium mb-2">Select School</label>
              <select 
                id="school"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                required
              >
                <option value="">Select School</option>
                <option value="engineering">School of Engineering</option>
                <option value="management">School of Management</option>
                <option value="science">School of Science</option>
                <option value="arts">School of Arts</option>
                <option value="commerce">School of Commerce</option>
              </select>
            </div>

            {/* Department */}
            <div className="form-group">
              <label htmlFor="department" className="block text-sm font-medium mb-2">Department</label>
              <select 
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                required
              >
                <option value="">Department</option>
                <option value="cs">Computer Science</option>
                <option value="it">Information Technology</option>
                <option value="ec">Electronics & Communication</option>
                <option value="me">Mechanical Engineering</option>
                <option value="ce">Civil Engineering</option>
              </select>
            </div>

            {/* Employee Type */}
            <div className="form-group">
              <label htmlFor="employType" className="block text-sm font-medium mb-2">Select Employ Type</label>
              <select 
                id="employType"
                name="employType"
                value={formData.employType}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                required
              >
                <option value="">Select Employ Type</option>
                <option value="permanent">Permanent</option>
                <option value="contractual">Contractual</option>
                <option value="visiting">Visiting</option>
                <option value="adhoc">Ad-hoc</option>
              </select>
            </div>

            {/* Registration No */}
            <div className="form-group">
              <label htmlFor="registrationNo" className="block text-sm font-medium mb-2">Enter Registration no.</label>
              <input 
                type="text"
                id="registrationNo"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                placeholder="Enter Registration no."
                required
              />
            </div>

            {/* Name */}
            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium mb-2">Enter Name</label>
              <input 
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                placeholder="Enter Name"
                required
              />
            </div>

            {/* Father's Name */}
            <div className="form-group">
              <label htmlFor="fatherName" className="block text-sm font-medium mb-2">Enter Father name</label>
              <input 
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                placeholder="Enter Father name"
                required
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender" className="block text-sm font-medium mb-2">Select Gender</label>
              <select 
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="block text-sm font-medium mb-2">Select Category</label>
              <select 
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                <option value="general">General</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
                <option value="obc">OBC</option>
                <option value="ews">EWS</option>
              </select>
            </div>

            {/* DOB */}
            <div className="form-group">
              <label htmlFor="dob" className="block text-sm font-medium mb-2">DOB</label>
              <div className="relative">
                <input 
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  required
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Designation */}
            <div className="form-group">
              <label htmlFor="designation" className="block text-sm font-medium mb-2">Select Designation</label>
              <select 
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                required
              >
                <option value="">Select Designation</option>
                <option value="professor">Professor</option>
                <option value="associate-professor">Associate Professor</option>
                <option value="assistant-professor">Assistant Professor</option>
                <option value="lecturer">Lecturer</option>
                <option value="lab-assistant">Lab Assistant</option>
              </select>
            </div>

            {/* Contact No */}
            <div className="form-group">
              <label htmlFor="contactNo" className="block text-sm font-medium mb-2">Enter Contact No.</label>
              <input 
                type="tel"
                id="contactNo"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                placeholder="Enter Contact No."
                required
              />
            </div>

            {/* Primary Email */}
            <div className="form-group">
              <label htmlFor="primaryEmail" className="block text-sm font-medium mb-2">Enter Primary Email</label>
              <input 
                type="email"
                id="primaryEmail"
                name="primaryEmail"
                value={formData.primaryEmail}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                placeholder="Enter Primary Email"
                required
              />
            </div>

            {/* Official Email */}
            <div className="form-group">
              <label htmlFor="officialEmail" className="block text-sm font-medium mb-2">Enter Official Email</label>
              <input 
                type="email"
                id="officialEmail"
                name="officialEmail"
                value={formData.officialEmail}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                placeholder="Enter Official Email"
              />
            </div>

            {/* Joining Date */}
            <div className="form-group">
              <label htmlFor="joiningDate" className="block text-sm font-medium mb-2">Joining date</label>
              <div className="relative">
                <input 
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  required
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Qualification */}
            <div className="form-group">
              <label htmlFor="qualification" className="block text-sm font-medium mb-2">Enter Qualification</label>
              <input 
                type="text"
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                placeholder="Enter Qualification"
                required
              />
            </div>

            {/* Experience */}
            <div className="form-group">
              <label htmlFor="experience" className="block text-sm font-medium mb-2">Enter Experience</label>
              <input 
                type="text"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                placeholder="Enter Experience"
                required
              />
            </div>

            {/* Marital Status */}
            <div className="form-group">
              <label htmlFor="maritalStatus" className="block text-sm font-medium mb-2">Married??</label>
              <select 
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address" className="block text-sm font-medium mb-2">Enter Address</label>
            <textarea 
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
              placeholder="Enter Address"
              rows={4}
              required
            ></textarea>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
              placeholder="****"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="form-group">
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#8B0000] text-white rounded-md hover:bg-[#650000] focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:ring-offset-2 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffPage;
