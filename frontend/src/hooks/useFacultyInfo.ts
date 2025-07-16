import { useState, useEffect } from 'react';
import authService from '@/services/authService';

// Interface for faculty information
export interface FacultyInfo {
  id: string;
  name: string;
  department: string;
  email: string;
  designation: string;
  emptype: string;
  isLoading: boolean;
}

// Default faculty info state
const defaultFacultyInfo: FacultyInfo = {
  id: '',
  name: '',
  department: '',
  email: '',
  designation: '',
  emptype: '',
  isLoading: true
};

/**
 * Custom hook to get faculty information including department
 * @returns Faculty information and loading state
 */
export function useFacultyInfo() {
  const [facultyInfo, setFacultyInfo] = useState<FacultyInfo>(defaultFacultyInfo);

  useEffect(() => {
    // Function to load faculty data
    const loadFacultyData = async () => {
      try {
        // First try to get from current user data
        const currentUser = authService.getCurrentUser();
        
        if (currentUser) {
          // Set info from current user
          setFacultyInfo({
            id: currentUser.registration_no || '',
            name: currentUser.name || '',
            department: currentUser.department || 'Not Specified',
            email: currentUser.primary_email || '',
            designation: currentUser.designation || 'Faculty',
            emptype: currentUser.emptype || '',
            isLoading: false
          });
        } else {
          // If no current user, try to fetch from API
          try {
            const userInfo = await authService.getUserInfo();
            
            setFacultyInfo({
              id: userInfo.registration_no || '',
              name: userInfo.name || '',
              department: userInfo.department || 'Not Specified',
              email: userInfo.primary_email || '',
              designation: userInfo.designation || 'Faculty',
              emptype: userInfo.emptype || '',
              isLoading: false
            });
          } catch (error) {
            console.error('Error fetching user info:', error);
            setFacultyInfo({
              ...defaultFacultyInfo,
              isLoading: false
            });
          }
        }
      } catch (error) {
        console.error('Error in useFacultyInfo hook:', error);
        setFacultyInfo({
          ...defaultFacultyInfo,
          isLoading: false
        });
      }
    };

    loadFacultyData();
  }, []);

  return facultyInfo;
}

export default useFacultyInfo; 