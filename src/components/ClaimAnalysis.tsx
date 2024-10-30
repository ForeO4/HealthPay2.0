import React from 'react';
import { ClaimAnalysisResult } from '../types/claims';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface ClaimAnalysisProps {
  claimId: string;
  analysis: ClaimAnalysisResult;
}

export function ClaimAnalysis({ claimId, analysis }: ClaimAnalysisProps) {
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Claim Analysis</h3>

        {/* Risk Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Risk Score</span>
            <span className={`text-lg font-semibold ${getRiskColor(analysis.riskScore)}`}>
              {Math.round(analysis.riskScore)}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getRiskColor(analysis.riskScore)}`}
              style={{ width: `${analysis.riskScore}%` }}
            ></div>
          </div>
        </div>

        {/* Flags */}
        {analysis.flags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Flags</h4>
            <div className="space-y-2">
              {analysis.flags.map((flag, index) => (
                <div key={index} className="flex items-center text-yellow-700 bg-yellow-50 px-3 py-2 rounded-md">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Checks */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Compliance Checks</h4>
          <div className="space-y-2">
            {analysis.complianceChecks.map((check, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  check.passed ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                } px-3 py-2 rounded-md`}
              >
                {check.passed ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                <div>
                  <span className="text-sm font-medium">{check.name}</span>
                  {check.details && (
                    <p className="text-xs mt-1">{check.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
            <div className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center text-blue-700 bg-blue-50 px-3 py-2 rounded-md">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}