import React from 'react';
import { DetailedClaim } from '../types/claims';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ClaimStatusBadgeProps {
  status: DetailedClaim['status'];
}

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const getStatusConfig = (status: DetailedClaim['status']) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-700/10',
        };
      case 'denied':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-700/10',
        };
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-700/10',
        };
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-700/10',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      <Icon className="mr-1.5 h-4 w-4" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}