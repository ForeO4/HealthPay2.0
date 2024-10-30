import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ValidationError {
  line: number;
  field: string;
  message: string;
}

interface FileUploadPreviewProps {
  files: File[];
  errors: ValidationError[];
  warnings: ValidationError[];
  onRemoveFile: (index: number) => void;
}

export function FileUploadPreview({
  files,
  errors,
  warnings,
  onRemoveFile,
}: FileUploadPreviewProps) {
  return (
    <div className="mt-4 space-y-4">
      {/* Files List */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Selected Files:</h3>
        <ul className="mt-2 divide-y divide-gray-200">
          {files.map((file, index) => (
            <li key={index} className="py-2 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Validation Results */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-4">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Validation Errors
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>
                          Line {error.line}: {error.field} - {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Validation Warnings
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {warnings.map((warning, index) => (
                        <li key={index}>
                          Line {warning.line}: {warning.field} - {warning.message}
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
    </div>
  );
}