import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  return (
    <div className="min-h-[100vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-display font-bold text-red-500 mb-2">403</h1>
        <p className="text-2xl text-university-dark font-medium mb-6">Access Denied</p>
        <p className="text-gray-600 mb-8">
          You do not have permission to access this page. Please log in with appropriate credentials or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/login">
              Log In
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 