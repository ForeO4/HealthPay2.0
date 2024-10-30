import React from 'react';
import { DetailedClaim } from '../types/claims';
import { CheckCircle, DollarSign, FileText } from 'lucide-react';

interface BatchProcessingSummaryProps {
  claims: DetailedClaim[];
}

export function BatchProcessingSummary({ claims }: BatchProcessingSummaryProps) {
  const totalAmount = claims.reduce((sum, claim) => sum + claim.totalAmount, 0);
  const uniqueProviders = new Set(claims.map(claim => claim.providerId)).size;
  const uniquePatients = new Set(claims.map(claim => claim.patientId)).size;

  return (
    <div className="rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-green-800">
            Successfully Processed Claims
          </h3>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  {claims.length} Claims
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {uniqueProviders} Providers
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-sm font-medium text-gray-900">
                  {uniquePatients} Patients
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">Processing Details</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• All claims have been validated and processed</li>
              <li>• Data has been normalized and standardized</li>
              <li>• Claims are ready for review and submission</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}