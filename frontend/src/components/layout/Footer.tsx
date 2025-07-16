import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-university-dark text-white mt-auto">
      <div className="university-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-bold">Prabandh</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              ITM University's comprehensive management portal for scheduling, 
              timetables, and academic administration.
            </p>
            <img 
              src="/images/logo/Itm university white logo transparent.png" 
              alt="ITM University Logo" 
              className="h-16 mt-6"
            />
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xl font-medium border-b border-white/20 pb-3">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Timetable
                </Link>
              </li>
              <li>
                <Link to="/allotment/subject-count" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Allotment
                </Link>
              </li>
              <li>
                <Link to="/feedback/dashboard" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Student Feedback
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Login
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xl font-medium border-b border-white/20 pb-3">Contact</h4>
            <address className="text-sm text-white/70 not-italic space-y-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/60 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  ITM University<br />
                  NH-75, Jhansi Road<br />
                  Gwalior, Madhya Pradesh - 474001
                </div>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@itmuniversity.ac.in" className="text-white/70 hover:text-white">
                  info@itmuniversity.ac.in
                </a>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+917512440058" className="text-white/70 hover:text-white">
                  +91 751 2440058
                </a>
              </div>
            </address>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-14 pt-10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/60 mb-6 md:mb-0">
            © {year} Prabandh - ITM University. All rights reserved.
          </p>
          <div className="flex space-x-8 text-sm">
            <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
              Terms of Use
            </Link>
            <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
