import React from 'react';
import { DetailedClaim } from '../types/claims';
import { format } from 'date-fns';
import { ClaimStatusBadge } from './ClaimStatusBadge';

interface RecentActivityProps {
  claims: DetailedClaim[];
}

export function RecentActivity({ claims }: RecentActivityProps) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {claims.map((claim, claimIdx) => (
          <li key={claim.id}>
            <div className="relative pb-8">
              {claimIdx !== claims.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <span className="font-medium text-gray-600">
                      {claim.providerId.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="font-medium text-gray-900">
                        Claim #{claim.id.slice(0, 8)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        by Provider {claim.providerId}
                      </span>
                    </div>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>
                      ${claim.totalAmount.toLocaleString()} • 
                    </span>
                    <span className="ml-2">
                      {format(new Date(claim.dateOfService), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}