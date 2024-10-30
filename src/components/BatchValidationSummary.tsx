import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ValidationResult {
  code: string;
  description: string;
  count: number;
  type: 'error' | 'warning' | 'success';
}

interface BatchValidationSummaryProps {
  results: ValidationResult[];
  totalClaims: number;
  processedClaims: number;
}

export function BatchValidationSummary({ results, totalClaims, processedClaims }: BatchValidationSummaryProps) {
  const errors = results.filter(r => r.type === 'error');
  const warnings = results.filter(r => r.type === 'warning');
  const successes = results.filter(r => r.type === 'success');

  const getIcon = (type: 'error' | 'warning' | 'success') => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-800">Processed Claims</h3>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-green-700">
            {processedClaims}/{totalClaims}
          </p>
          <p className="mt-1 text-sm text-green-600">
            {((processedClaims / totalClaims) * 100).toFixed(1)}% complete
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-red-700">
            {errors.length}
          </p>
          <p className="mt-1 text-sm text-red-600">
            Issues requiring attention
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-yellow-800">Warnings</h3>
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-yellow-700">
            {warnings.length}
          </p>
          <p className="mt-1 text-sm text-yellow-600">
            Potential issues detected
          </p>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {['error', 'warning', 'success'].map((type) => {
            const typeResults = results.filter(r => r.type === type);
            if (typeResults.length === 0) return null;

            return (
              <div
                key={type}
                className={`rounded-md ${
                  type === 'error'
                    ? 'bg-red-50'
                    : type === 'warning'
                    ? 'bg-yellow-50'
                    : 'bg-green-50'
                } p-4`}
              >
                <div className="flex">
                  {getIcon(type as 'error' | 'warning' | 'success')}
                  <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${
                      type === 'error'
                        ? 'text-red-800'
                        : type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-green-800'
                    }`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}s
                    </h3>
                    <div className="mt-2 space-y-1">
                      {typeResults.map((result, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className={`text-sm ${
                            type === 'error'
                              ? 'text-red-700'
                              : type === 'warning'
                              ? 'text-yellow-700'
                              : 'text-green-700'
                          }`}>
                            {result.description}
                          </span>
                          <span className={`text-sm font-medium ${
                            type === 'error'
                              ? 'text-red-700'
                              : type === 'warning'
                              ? 'text-yellow-700'
                              : 'text-green-700'
                          }`}>
                            {result.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}