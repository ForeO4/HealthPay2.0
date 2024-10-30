import React from 'react';
import { Card, BarList, DonutChart } from '@tremor/react';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { DetailedClaim } from '../types/claims';

interface FraudAnalysisPanelProps {
  claim: DetailedClaim;
  similarClaims: DetailedClaim[];
}

export function FraudAnalysisPanel({ claim, similarClaims }: FraudAnalysisPanelProps) {
  // Calculate risk metrics
  const riskMetrics = {
    duplicateClaims: similarClaims.filter(c => 
      c.patientId === claim.patientId && 
      c.dateOfService === claim.dateOfService &&
      c.id !== claim.id
    ).length,
    
    unusualAmount: Math.abs(
      (claim.totalAmount - 
        similarClaims.reduce((sum, c) => sum + c.totalAmount, 0) / similarClaims.length
      ) / claim.totalAmount
    ) * 100,
    
    frequencyAnomaly: similarClaims.filter(c => 
      c.patientId === claim.patientId &&
      new Date(c.dateOfService).getTime() - new Date(claim.dateOfService).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length,
  };

  const riskScore = Math.min(100, (
    (riskMetrics.duplicateClaims * 30) +
    (riskMetrics.unusualAmount > 50 ? 40 : 0) +
    (riskMetrics.frequencyAnomaly > 3 ? 30 : 0)
  ));

  const riskPatterns = [
    {
      name: 'Duplicate Claims',
      value: riskMetrics.duplicateClaims,
      color: riskMetrics.duplicateClaims > 0 ? 'rose' : 'emerald',
    },
    {
      name: 'Unusual Amount',
      value: Math.round(riskMetrics.unusualAmount),
      color: riskMetrics.unusualAmount > 50 ? 'rose' : 'emerald',
    },
    {
      name: 'Frequency Anomaly',
      value: riskMetrics.frequencyAnomaly,
      color: riskMetrics.frequencyAnomaly > 3 ? 'rose' : 'emerald',
    },
  ];

  const severityDistribution = {
    high: riskScore > 70 ? 1 : 0,
    medium: riskScore > 30 && riskScore <= 70 ? 1 : 0,
    low: riskScore <= 30 ? 1 : 0,
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Fraud Analysis</h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            riskScore > 70 ? 'bg-red-100 text-red-700' :
            riskScore > 30 ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {riskScore}% Risk
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Risk Patterns</h3>
            <BarList data={riskPatterns} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Risk Distribution</h3>
            <DonutChart
              data={[
                { name: 'High Risk', value: severityDistribution.high },
                { name: 'Medium Risk', value: severityDistribution.medium },
                { name: 'Low Risk', value: severityDistribution.low },
              ]}
              category="value"
              index="name"
              colors={['rose', 'amber', 'emerald']}
              className="h-32"
            />
          </div>
        </div>

        {riskScore > 30 && (
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Risk Factors</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {riskMetrics.duplicateClaims > 0 && (
                      <li>Multiple claims found for same service date</li>
                    )}
                    {riskMetrics.unusualAmount > 50 && (
                      <li>Claim amount significantly deviates from average</li>
                    )}
                    {riskMetrics.frequencyAnomaly > 3 && (
                      <li>Unusual frequency of claims for this patient</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start">
            <TrendingUp className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">Analysis Summary</h3>
              <p className="mt-1 text-sm text-gray-600">
                Based on analysis of {similarClaims.length} similar claims over the past 30 days.
                {riskScore <= 30 && " No significant risk factors detected."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}