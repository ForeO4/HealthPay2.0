import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportData';
import { DetailedClaim } from '../types/claims';

interface ExportButtonProps {
  data: DetailedClaim[];
  filename?: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    switch (format) {
      case 'excel':
        exportToExcel(data, `${filename || 'export'}.xlsx`);
        break;
      case 'csv':
        exportToCSV(data, `${filename || 'export'}.csv`);
        break;
      case 'pdf':
        exportToPDF(data, `${filename || 'export'}.pdf`);
        break;
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            <button
              onClick={() => handleExport('excel')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Export to Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Export to CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Export to PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}