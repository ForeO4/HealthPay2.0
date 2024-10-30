import React from 'react';
import { PriceEstimate } from '../types/pricing';
import { DollarSign, AlertCircle, TrendingUp, Shield } from 'lucide-react';

interface PriceEstimatorProps {
  estimate: PriceEstimate;
}

export function PriceEstimator({ estimate }: PriceEstimatorProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Cost Estimate
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Total Cost</span>
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-blue-700">
              {formatCurrency(estimate.totalCost)}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Insurance Pays</span>
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-green-700">
              {formatCurrency(estimate.insurancePays)}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-700">You Pay</span>
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-purple-700">
              {formatCurrency(estimate.patientPays)}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(estimate.breakdown).map(([key, value]) => (
                value > 0 && (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 capitalize">{key}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(value)}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-sm font-medium text-gray-900">Estimate Confidence</h4>
              <div className="relative inline-block">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${estimate.confidence}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600">{estimate.confidence}%</span>
            </div>
            <p className="text-xs text-gray-500">
              Based on {estimate.similarClaims} similar claims
            </p>
          </div>

          {estimate.factors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Important Factors
              </h4>
              <div className="space-y-2">
                {estimate.factors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 text-sm text-gray-600"
                  >
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}