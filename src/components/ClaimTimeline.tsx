import React from 'react';
import { DetailedClaim } from '../types/claims';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ClaimTimelineProps {
  auditTrail: DetailedClaim['auditTrail'];
}

export function ClaimTimeline({ auditTrail }: ClaimTimelineProps) {
  const getStatusIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Claim Timeline</h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {auditTrail.map((event, eventIdx) => (
              <li key={event.timestamp}>
                <div className="relative pb-8">
                  {eventIdx !== auditTrail.length - 1 ? (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        {getStatusIcon(event.action)}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">{event.action}</p>
                        {event.notes && (
                          <p className="mt-0.5 text-sm text-gray-500">{event.notes}</p>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}