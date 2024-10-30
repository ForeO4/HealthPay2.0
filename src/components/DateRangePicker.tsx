import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  value: [Date, Date];
  onChange: (dates: [Date, Date]) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center space-x-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <input
        type="date"
        value={value[0].toISOString().split('T')[0]}
        onChange={(e) => onChange([new Date(e.target.value), value[1]])}
        className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
      <span className="text-gray-500">to</span>
      <input
        type="date"
        value={value[1].toISOString().split('T')[0]}
        onChange={(e) => onChange([value[0], new Date(e.target.value)])}
        className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>
  );
}