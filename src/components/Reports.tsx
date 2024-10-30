import React, { useState } from 'react';
import { AlertTriangle, DollarSign, FileText, Shield, TrendingUp, User } from 'lucide-react';
import { useClaimStore } from '../store/claimStore';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState('fraud');
  const claims = useClaimStore((state) => state.claims);

  // Calculate metrics directly in component
  const calculateMetrics = () => {
    const totalClaims = claims.length;
    const totalAmount = claims.reduce((sum, claim) => sum + claim.totalAmount, 0);
    const deniedClaims = claims.filter(claim => claim.status === 'denied').length;
    const suspiciousClaims = claims.filter(claim => {
      const hasUnusualAmount = claim.totalAmount > 10000;
      const hasMultipleDiagnoses = claim.diagnoses.length > 3;
      return hasUnusualAmount || hasMultipleDiagnoses;
    }).length;

    return {
      totalClaims,
      totalAmount,
      deniedClaims,
      suspiciousClaims,
      riskScore: Math.min(100, (suspiciousClaims / totalClaims) * 100 || 0)
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Reports
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            {[
              { id: 'fraud', label: 'Fraud Detection', icon: AlertTriangle },
              { id: 'validation', label: 'Validation', icon: FileText },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'compliance', label: 'Compliance', icon: Shield },
              { id: 'provider', label: 'Provider', icon: User },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedReport(id)}
                className={`${
                  selectedReport === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md inline-flex items-center`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-700">Risk Score</span>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-red-700">
                {metrics.riskScore.toFixed(1)}%
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-700">Suspicious Claims</span>
                <FileText className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-yellow-700">
                {metrics.suspiciousClaims}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Total Claims</span>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-blue-700">
                {metrics.totalClaims}
              </p>
            </div>
          </div>

          {claims.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No claims data available. Process some claims to see reports.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}