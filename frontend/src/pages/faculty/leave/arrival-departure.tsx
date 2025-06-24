import { useState, useEffect } from "react";
import { CalendarIcon, Clock, MapPin, User, ChevronDown, Activity, PlaneTakeoff, PlaneLanding, AlertCircle, Send, Briefcase, CalendarDays, CheckCircle2, HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import authService from "@/services/authService";
import { usePoll } from "@/hooks/usePoll";
import axios from 'axios';

// Custom styles for maroon border focus
const maroonRingStyles = "focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5]";

export default function ArrivalDeparture() {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    arrivalType: '',
    departureType: '',
    description: '',
    hours: '',
    to: '',
    contactNo: '',
    addressDuring: '',
    forwardTo: '',
    status: 'Pending'
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    department: "",
    email: "",
    name: "",
    employeeCode: "",
    personalArrivalDeparture: "0",
    officialArrivalDeparture: "0"
  });
  const [arrivalDepartureDetails, setArrivalDepartureDetails] = useState({
    eligible: 2,
    personalUsed: 0,
    officialUsed: 0,
    daysBeforeAfter: 3
  });

  // Auto refresh polling functionality
  const pollCallback = async () => {
    await fetchArrivalDepartureDetails();
  };

  const {
    pollingEnabled,
    setPollingEnabled,
    lastPolled,
    isPolling,
    manualRefresh
  } = usePoll({
    interval: 100, // 100 milliseconds
    initialEnabled: true,
    callback: pollCallback,
    onError: (error) => {
      console.error("Polling error:", error);
    }
  });

  // Load user data when component mounts
  useEffect(() => {
    loadUserData();
    fetchArrivalDepartureDetails();
  }, []);

  const loadUserData = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserData({
        department: currentUser.department || "Not specified",
        email: currentUser.primary_email || currentUser.official_email || "Not available",
        name: currentUser.name || "Faculty",
        employeeCode: currentUser.registration_no || "Not available",
        personalArrivalDeparture: "2", // This would ideally come from an API
        officialArrivalDeparture: "0"  // This would ideally come from an API
      });

      // Set contact number from user data
      setFormData(prev => ({
        ...prev,
        contactNo: '' // Would come from user data when API is updated
      }));
    }
  };

  const fetchArrivalDepartureDetails = async () => {
    try {
      // This would be replaced by a real API call when implemented
      // const response = await axios.get('http://localhost:8000/api/faculty/leave/arrival-departure-details/', {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('accessToken')}` || `Token ${localStorage.getItem('token')}` || ''
      //   }
      // });
      // setArrivalDepartureDetails(response.data);
      
      // For now, we'll use mock data
      setTimeout(() => {
        setArrivalDepartureDetails({
          eligible: 2,
          personalUsed: 1,
          officialUsed: 0,
          daysBeforeAfter: 3
        });
      }, 300);
    } catch (error) {
      console.error("Error fetching arrival/departure details:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.arrivalType || !formData.departureType || !formData.description || !date || !formData.hours 
      || !formData.to || !formData.contactNo || !formData.addressDuring || !formData.forwardTo) {
      setSubmitStatus("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // The following would be the actual API call
      // const response = await axios.post('http://localhost:8000/api/faculty/leave/arrival-departure/', {
      //   ...formData,
      //   date: format(date, 'yyyy-MM-dd')
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}` || `Token ${localStorage.getItem('token')}` || ''
      //   }
      // });
      
      // Simulate API call
      setTimeout(() => {
        setSubmitStatus("Arrival/Departure application submitted successfully!");
        
        // Reset form fields
        setFormData({
          arrivalType: '',
          departureType: '',
          description: '',
          hours: '',
          to: '',
          contactNo: userData.employeeCode || '',
          addressDuring: '',
          forwardTo: '',
          status: 'Pending'
        });
        setDate(undefined);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error submitting arrival/departure application:", error);
      setSubmitStatus("Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <Card className="mb-6 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-[#8B0000] to-[#AA0000] py-3 px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="tracking-tight text-white text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span>Arrival/Departure/Duty Slip</span>
            </CardTitle>
          </div>
          {/* Real-time status indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
          
            </div>
            {lastPolled && (
              <>
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Status Message */}
      {submitStatus && (
        <div className={`p-4 mb-6 rounded-lg ${submitStatus.includes('successfully') ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>
          {submitStatus}
        </div>
      )}

      {/* Applicant Info Card */}
      <Card className="mb-6 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
        <CardContent className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 text-sm text-white">
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-white/10 p-1.5 rounded-full">
              <AlertCircle className="h-5 w-5 text-amber-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                For Applicant Use Only
                <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 ml-2">Important</Badge>
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Eligible Arrival/Departure: <span className="font-bold">{arrivalDepartureDetails.eligible}</span> (Per Month for Personal)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-blue-400" />
                  <span>Only {arrivalDepartureDetails.daysBeforeAfter} days before/after from current date are eligible</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details Card */}
      <Card className="mb-6 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb] py-3 px-4 border-b">
          <CardTitle className="text-gray-800 text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-[#8B0000]" />
            <span>User Information</span>
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm mt-1">
            Faculty details and arrival/departure status
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wide font-semibold text-gray-500">Department</Label>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-[#8B0000]" />
                <p className="font-medium text-gray-900">{userData.department}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-xs uppercase tracking-wide font-semibold text-gray-500">Email Address</Label>
              <div className="mt-1.5 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#8B0000]" />
                <p className="font-medium text-gray-900 hover:text-[#8B0000] hover:underline cursor-pointer">{userData.email}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-xs uppercase tracking-wide font-semibold text-gray-500">Arrival/Departure</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <PlaneTakeoff className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">Personal: <Badge className="ml-1 bg-[#8B0000]/10 text-[#8B0000] hover:bg-[#8B0000]/20">{arrivalDepartureDetails.personalUsed}/{arrivalDepartureDetails.eligible}</Badge></span>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1">
                  <PlaneLanding className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">Official: <Badge className="ml-1 bg-blue-100 text-blue-800 hover:bg-blue-200">{arrivalDepartureDetails.officialUsed}</Badge></span>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-xs uppercase tracking-wide font-semibold text-gray-500">Faculty Name</Label>
              <div className="mt-1.5 flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#8B0000]" />
                <p className="font-medium text-gray-900">{userData.name}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-xs uppercase tracking-wide font-semibold text-gray-500">Employee Code</Label>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-mono">{userData.employeeCode}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card className="mb-6 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb] py-3 px-4 border-b">
          <CardTitle className="text-gray-800 text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#8B0000]" />
            <span>Application Details</span>
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm mt-1">
            Please fill in the arrival or departure details
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white p-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalType" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <PlaneTakeoff className="h-3.5 w-3.5 text-[#8B0000]" />
                  Arrival/Departure Type<span className="text-red-600 ml-0.5">*</span>
                </Label>
                <Select
                  name="arrivalType"
                  onValueChange={(value) => setFormData(prev => ({ ...prev, arrivalType: value }))}
                >
                  <SelectTrigger className="h-10 mt-1.5 rounded-md border-gray-300 focus:ring-[#8B0000] focus:ring-offset-[#F3E5E5] hover:border-[#8B0000]/50 transition-all duration-200 shadow-sm">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="border-[#8B0000]/20 shadow-lg rounded-lg">
                    <SelectItem value="arrival" className="focus:bg-[#F3E5E5] focus:text-[#8B0000]">
                      <div className="flex items-center gap-2">
                        <PlaneLanding className="h-4 w-4" />
                        <span>Arrival</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="departure" className="focus:bg-[#F3E5E5] focus:text-[#8B0000]">
                      <div className="flex items-center gap-2">
                        <PlaneTakeoff className="h-4 w-4" />
                        <span>Departure</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="departureType" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#8B0000]" />
                  Select Arrival/Departure<span className="text-red-600 ml-0.5">*</span>
                </Label>
                <Select
                  name="departureType"
                  onValueChange={(value) => setFormData(prev => ({ ...prev, departureType: value }))}
                >
                  <SelectTrigger className="h-10 mt-1.5 rounded-md border-gray-300 focus:ring-[#8B0000] focus:ring-offset-[#F3E5E5] hover:border-[#8B0000]/50 transition-all duration-200 shadow-sm">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="border-[#8B0000]/20 shadow-lg rounded-lg">
                    <SelectItem value="personal" className="focus:bg-[#F3E5E5] focus:text-[#8B0000]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Personal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="official" className="focus:bg-[#F3E5E5] focus:text-[#8B0000]">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Official</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-[#f9fafb] p-4 rounded-lg border border-gray-100 shadow-sm">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-[#8B0000]" />
                Please Describe<span className="text-red-600 ml-0.5">*</span>
              </Label>
              <div className="mt-2">
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please provide details about your arrival or departure"
                  className={cn("w-full min-h-[100px] rounded-md border-gray-300 focus:border-[#8B0000] shadow-sm", maroonRingStyles)}
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>Please provide detailed information about the purpose of your arrival/departure</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date" className="text-gray-700 font-medium mb-1 block">
                  Date<span className="text-red-600 ml-0.5">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-9 focus-visible:ring-[#8B0000] focus-visible:ring-offset-[#F3E5E5] hover:bg-[#F3E5E5] hover:text-[#8B0000]",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="[&_.selected]:bg-[#F3E5E5] [&_.selected]:text-[#8B0000] [&_.selected]:border-[#8B0000] [&_.selected]:ring-[#8B0000]"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="hours" className="text-gray-700 font-medium mb-1 block">
                  Hours<span className="text-red-600 ml-0.5">*</span>
                </Label>
                <Select
                  name="hours"
                  onValueChange={(value) => setFormData(prev => ({ ...prev, hours: value }))}
                >
                  <SelectTrigger className="h-9 mt-1 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] focus:bg-[#F3E5E5]">
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent className="[&_[data-state=checked]]:bg-[#F3E5E5] [&_[data-state=checked]]:text-[#8B0000] [&_[data-highlighted]]:bg-[#F3E5E5] [&_[data-highlighted]]:text-[#8B0000]">
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i}:00`}>{`${i}:00`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="to" className="text-gray-700 font-medium mb-1 block">
                  To<span className="text-red-600 ml-0.5">*</span>
                </Label>
                <Select
                  name="to"
                  onValueChange={(value) => setFormData(prev => ({ ...prev, to: value }))}
                >
                  <SelectTrigger className="h-9 mt-1 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] focus:bg-[#F3E5E5]">
                    <SelectValue placeholder="Up to" />
                  </SelectTrigger>
                  <SelectContent className="[&_[data-state=checked]]:bg-[#F3E5E5] [&_[data-state=checked]]:text-[#8B0000] [&_[data-highlighted]]:bg-[#F3E5E5] [&_[data-highlighted]]:text-[#8B0000]">
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i}:00`}>{`${i}:00`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactNo" className="text-gray-700 font-medium mb-1 block">
                  Contact No.<span className="text-red-600 ml-0.5">*</span>
                </Label>
                <Input
                  type="text"
                  id="contactNo"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  className={maroonRingStyles}
                />
              </div>
              
              <div>
                <Label htmlFor="addressDuring" className="text-gray-700 font-medium mb-1 block">
                  Address during<span className="text-red-600 ml-0.5">*</span>
                </Label>
                <Input
                  type="text"
                  id="addressDuring"
                  name="addressDuring"
                  value={formData.addressDuring}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  className={maroonRingStyles}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="forwardTo" className="text-gray-700 font-medium mb-1 block">
                Forward to<span className="text-red-600 ml-0.5">*</span>
              </Label>
              <Select
                name="forwardTo"
                onValueChange={(value) => setFormData(prev => ({ ...prev, forwardTo: value }))}
              >
                <SelectTrigger className="h-9 mt-1 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] focus:bg-[#F3E5E5]">
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent className="[&_[data-state=checked]]:bg-[#F3E5E5] [&_[data-state=checked]]:text-[#8B0000] [&_[data-highlighted]]:bg-[#F3E5E5] [&_[data-highlighted]]:text-[#8B0000]">
                  <SelectItem value="hod">HOD</SelectItem>
                  <SelectItem value="dean">Dean</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-6 pb-2 flex justify-end">
              <Button 
                type="submit" 
                className="bg-[#8B0000] hover:bg-red-950 text-white w-full md:w-auto rounded-md px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
