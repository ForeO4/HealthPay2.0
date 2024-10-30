import React, { useState, useCallback } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { ClaimsPreprocessor } from '../services/ClaimsPreprocessor';
import { ClaimValidationService } from '../services/ClaimValidationService';
import { DetailedClaim } from '../types/claims';
import { useClaimStore } from '../store/claimStore';
import { FileUploadPreview } from '../components/FileUploadPreview';
import { BatchValidationSummary } from '../components/BatchValidationSummary';
import { BatchClaimPreview } from '../components/BatchClaimPreview';
import { BatchProcessingSummary } from '../components/BatchProcessingSummary';
import { FraudAnalysisPanel } from '../components/FraudAnalysisPanel';
import { PriceTransparencyCard } from '../components/PriceTransparencyCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ExportButton } from '../components/ExportButton';

interface ValidationError {
  line: number;
  field: string;
  message: string;
}

interface ValidationResult {
  code: string;
  description: string;
  count: number;
  type: 'error' | 'warning' | 'success';
}

export function BatchClaims() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  const [processedClaims, setProcessedClaims] = useState<DetailedClaim[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [selectedClaim, setSelectedClaim] = useState<DetailedClaim | null>(null);
  const addClaim = useClaimStore((state) => state.addClaim);
  const existingClaims = useClaimStore((state) => state.claims);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setErrors([]);
      setWarnings([]);
      setProcessedClaims([]);
      setProgress(0);
      setValidationResults([]);
      setValidationErrors({});
      setSelectedClaim(null);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(files => files.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setProgress(0);

    try {
      const preprocessor = ClaimsPreprocessor.getInstance();
      const validator = ClaimValidationService.getInstance();
      const results: ValidationResult[] = [];
      const newClaims: DetailedClaim[] = [];
      const newErrors: Record<string, string[]> = {};

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const claims = await preprocessor.processFile(file);
          
          for (const claim of claims) {
            const validationErrors = validator.validateClaim(claim);
            
            if (validationErrors.length > 0) {
              newErrors[claim.id] = validationErrors;
              results.push({
                code: 'VALIDATION_ERROR',
                description: `Validation failed for claim ${claim.id}`,
                count: validationErrors.length,
                type: 'error'
              });
            } else {
              newClaims.push(claim);
              results.push({
                code: 'SUCCESS',
                description: `Successfully processed claim ${claim.id}`,
                count: 1,
                type: 'success'
              });
            }
          }
        } catch (fileError) {
          results.push({
            code: 'FILE_ERROR',
            description: `Failed to process file ${file.name}`,
            count: 1,
            type: 'error'
          });
        }
        setProgress(((i + 1) / files.length) * 100);
      }

      setValidationResults(results);
      setValidationErrors(newErrors);
      setProcessedClaims(newClaims);
      
      // Add valid claims to the store
      newClaims.forEach(claim => addClaim(claim));
    } catch (err) {
      setErrors([{
        line: 0,
        field: 'general',
        message: err instanceof Error ? err.message : 'Failed to process claims'
      }]);
    } finally {
      setProcessing(false);
    }
  };

  const handleClaimSelect = useCallback((claim: DetailedClaim) => {
    setSelectedClaim(claim);
  }, []);

  const getSimilarClaims = useCallback((claim: DetailedClaim) => {
    return existingClaims.filter(c => 
      c.id !== claim.id && 
      c.items.some(item => 
        claim.items.some(claimItem => claimItem.code === item.code)
      )
    );
  }, [existingClaims]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Batch Claims Processing
          </h2>
        </div>
        {processedClaims.length > 0 && (
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <ExportButton data={processedClaims} filename="batch-claims" />
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Claims Files
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept=".json,.csv,.xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">
                    JSON, CSV, Excel files supported
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <FileUploadPreview
                files={files}
                errors={errors}
                warnings={warnings}
                onRemoveFile={removeFile}
              />
            )}

            {processing ? (
              <div className="space-y-4">
                <LoadingSpinner />
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        Processing Files
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={files.length === 0}
                  className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                >
                  Process Claims
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {validationResults.length > 0 && (
        <div className="mt-8">
          <BatchValidationSummary
            results={validationResults}
            totalClaims={files.length}
            processedClaims={processedClaims.length}
          />
        </div>
      )}

      {processedClaims.length > 0 && (
        <div className="space-y-6 mt-8">
          <BatchProcessingSummary claims={processedClaims} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedClaim && (
              <>
                <FraudAnalysisPanel
                  claim={selectedClaim}
                  similarClaims={getSimilarClaims(selectedClaim)}
                />
                <PriceTransparencyCard
                  claim={selectedClaim}
                  similarClaims={getSimilarClaims(selectedClaim)}
                />
              </>
            )}
          </div>

          <BatchClaimPreview
            claims={processedClaims}
            validationErrors={validationErrors}
            onClaimSelect={handleClaimSelect}
          />
        </div>
      )}
    </div>
  );
}