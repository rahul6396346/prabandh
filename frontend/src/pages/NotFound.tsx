import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[100vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-display font-bold text-[#8B0000] mb-2">404</h1>
        <p className="text-2xl text-gray-900 font-medium mb-6">Page Not Found</p>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to the home page.
        </p>
        <Button asChild size="lg" className="bg-[#8B0000] hover:bg-[#650000] text-white border-none">
          <Link to="/">
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
