import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Home, UserPlus, BarChart2 } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-blue-600 font-bold text-xl">
                Zelis
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/claims/batch"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <FileText className="w-4 h-4 mr-2" />
                Claims
              </Link>
              <Link
                to="/reports"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Reports
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}