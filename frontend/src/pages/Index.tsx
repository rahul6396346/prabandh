import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, User, BookOpen } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-university-primary to-university-secondary text-white py-16 md:py-24">
        <div className="university-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                Welcome to Prabandh Portal
              </h1>
              <p className="text-xl text-white/80">
                ITM University's comprehensive management system for academic scheduling, timetables, and resources.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-university-primary hover:bg-white/90">
                  <Link to="/login">
                    Login to Portal
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-white text-university-primary hover:bg-white/90">
                  <Link to="/login">
                    View Timetables
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <img 
                src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1074&auto=format&fit=crop"
                alt="ITM University Campus"
                className="rounded-lg shadow-2xl animate-fade-in"
              />
              <div className="absolute -bottom-6 -left-6 bg-university-accent p-4 rounded-lg shadow-lg">
                <p className="font-bold text-university-dark">Centre of Excellence</p>
                <p className="text-sm text-university-secondary">Recognized by UGC, AICTE & NAAC</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="university-section bg-university-light py-16">
        <div className="university-container">
          <h2 className="university-heading text-3xl text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow university-card h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-university-primary mb-4">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Timetable Management</h3>
                  <p className="text-gray-600 text-sm">
                    Efficiently manage and view class schedules across departments and faculty.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <Link to="/login" className="inline-flex items-center text-university-primary text-sm font-medium hover:underline">
                    View Timetables
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow university-card h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Course Allotment</h3>
                  <p className="text-gray-600 text-sm">
                    Streamlined process for course allocation and management for academic sessions.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <Link to="/allotment/subject-count" className="inline-flex items-center text-university-primary text-sm font-medium hover:underline">
                    Course Allocation
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow university-card h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Slot Status</h3>
                  <p className="text-gray-600 text-sm">
                    Real-time tracking of classroom availability and scheduling conflicts.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <Link to="/slot-status/available" className="inline-flex items-center text-university-primary text-sm font-medium hover:underline">
                    Check Slots
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow university-card h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                    <User size={24} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Student Feedback</h3>
                  <p className="text-gray-600 text-sm">
                    Collect and analyze student feedback for continuous improvement.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <Link to="/feedback/dashboard" className="inline-flex items-center text-university-primary text-sm font-medium hover:underline">
                    View Feedback
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* About University Section */}
      <section className="university-section">
        <div className="university-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="university-heading text-3xl mb-6">Why ITM University Gwalior</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-university-light flex items-center justify-center text-university-primary mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Recognized Globally</p>
                    <p className="text-gray-600 text-sm">By UGC, AICTE, COA, INC, PCI, NCTE, BCI, AIU, NAAC</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-university-light flex items-center justify-center text-university-primary mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Centre of Excellence</p>
                    <p className="text-gray-600 text-sm">In School of Management and Dept of Computer Science</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-university-light flex items-center justify-center text-university-primary mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">World Class Infrastructure</p>
                    <p className="text-gray-600 text-sm">State-of-the-art facilities and sports amenities</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-university-light flex items-center justify-center text-university-primary mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Industry Ready Curriculum</p>
                    <p className="text-gray-600 text-sm">Project-based learning with continuous assessment</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-university-light flex items-center justify-center text-university-primary mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Best Placements in Central India</p>
                    <p className="text-gray-600 text-sm">Excellent training and industry connections</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8">
                <a href="https://www.itmuniversity.ac.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-university-primary text-white hover:bg-university-primary/90 h-10 px-4 py-2">
                    Visit University Website
                </a>
              </div>
            </div>
            
            <div className="space-y-6">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop" 
                alt="ITM University Campus" 
                className="rounded-lg shadow-lg"
              />
              <p className="text-gray-600">
                At ITM University Gwalior, you get an opportunity to link your studies to your career plan and personal goals 
                by using a combination of compulsory credits, optional credits, self-learning credits, MOOC, and non-CGPA credits 
                for curricular and extra-curricular activities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
