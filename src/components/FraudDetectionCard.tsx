import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Shield, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { DetailedClaim } from '../types/claims';
import { BarList, Card, Title, DonutChart } from '@tremor/react';

interface FraudDetectionCardProps {
  claims: DetailedClaim[];
}

export function FraudDetectionCard({ claims }: FraudDetectionCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Enhanced fraud pattern detection
  const fraudPatterns = [
    {
      name: 'Duplicate Claims',
      value: claims.filter(c => claims.some(other => 
        other.id !== c.id && 
        other.patientId === c.patientId && 
        other.dateOfService === c.dateOfService
      )).length,
      severity: 'high'
    },
    {
      name: 'Unusual Amounts',
      value: claims.filter(c => {
        const avg = claims.reduce((sum, claim) => sum + claim.totalAmount, 0) / claims.length;
        return c.totalAmount > avg * 2;
      }).length,
      severity: 'high'
    },
    {
      name: 'Frequency Anomalies',
      value: claims.filter(c => {
        const patientClaims = claims.filter(pc => pc.patientId === c.patientId);
        return patientClaims.length > 3;
      }).length,
      severity: 'medium'
    },
    {
      name: 'Upcoding Patterns',
      value: claims.filter(c => 
        c.items.some(item => item.unitPrice > claims
          .flatMap(oc => oc.items)
          .filter(i => i.code === item.code)
          .reduce((sum, i) => sum + i.unitPrice, 0) / claims.length * 1.5)
      ).length,
      severity: 'medium'
    }
  ].sort((a, b) => b.value - a.value);

  const riskScore = Math.min(
    100,
    (fraudPatterns.reduce((sum, p) => sum + (p.severity === 'high' ? p.value * 2 : p.value), 0) / 
    (claims.length * 2)) * 100
  );

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const severityDistribution = {
    high: fraudPatterns.filter(p => p.severity === 'high').reduce((sum, p) => sum + p.value, 0),
    medium: fraudPatterns.filter(p => p.severity === 'medium').reduce((sum, p) => sum + p.value, 0),
    low: fraudPatterns.filter(p => p.severity === 'low').reduce((sum, p) => sum + p.value, 0),
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <Title>Fraud Detection</Title>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-semibold ${getRiskColor(riskScore)}`}>
            {Math.round(riskScore)}% Risk
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">High Risk Claims</span>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-red-700">
            {severityDistribution.high}
          </p>
          <p className="mt-1 text-sm text-red-600">
            {((severityDistribution.high / claims.length) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-700">Total Patterns</span>
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-yellow-700">
            {fraudPatterns.reduce((sum, p) => sum + p.value, 0)}
          </p>
          <p className="mt-1 text-sm text-yellow-600">
            Across {fraudPatterns.length} categories
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Pattern Distribution</h3>
              <BarList
                data={fraudPatterns.map(pattern => ({
                  name: pattern.name,
                  value: pattern.value,
                  color: pattern.severity === 'high' ? 'rose' : 'orange',
                }))}
                valueFormatter={(value) => value.toString()}
                className="mt-2"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Severity Distribution</h3>
              <DonutChart
                data={[
                  { name: 'High', value: severityDistribution.high },
                  { name: 'Medium', value: severityDistribution.medium },
                  { name: 'Low', value: severityDistribution.low },
                ]}
                category="value"
                index="name"
                colors={['rose', 'orange', 'emerald']}
                valueFormatter={(value) => `${value} claims`}
                className="mt-2 h-32"
              />
            </div>
          </div>

          {fraudPatterns.some(p => p.value > 0) && (
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Risk Analysis</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {fraudPatterns
                        .filter(p => p.value > 0)
                        .map((pattern, index) => (
                          <li key={index}>
                            {pattern.name}: {pattern.value} instances detected
                            {pattern.severity === 'high' && ' (High Risk)'}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}