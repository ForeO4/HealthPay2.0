import React from 'react';
import { DetailedClaim } from '../types/claims';
import { Table } from '@tremor/react';
import { FileText, AlertCircle } from 'lucide-react';
import { ClaimStatusBadge } from './ClaimStatusBadge';

interface BatchClaimPreviewProps {
  claims: DetailedClaim[];
  validationErrors: Record<string, string[]>;
  onClaimSelect?: (claim: DetailedClaim) => void;
}

export function BatchClaimPreview({ claims, validationErrors, onClaimSelect }: BatchClaimPreviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Claims Preview</h3>
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Claim ID
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Provider
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Patient
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Date of Service
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Amount
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Issues</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {claims.map((claim) => (
              <tr
                key={claim.id}
                onClick={() => onClaimSelect?.(claim)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors duration-150 ease-in-out`}
              >
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    {claim.id.slice(0, 8)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {claim.providerId}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {claim.patientId}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(claim.dateOfService).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${claim.totalAmount.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <ClaimStatusBadge status={claim.status} />
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  {validationErrors[claim.id]?.length > 0 && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      {validationErrors[claim.id].length}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}