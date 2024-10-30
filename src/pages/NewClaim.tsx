import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClaimSubmissionForm } from '../components/ClaimSubmissionForm';
import { DetailedClaim } from '../types/claims';
import { ClaimService } from '../services/ClaimService';

export function NewClaim() {
  const navigate = useNavigate();

  const handleSubmit = async (claim: DetailedClaim) => {
    const claimService = ClaimService.getInstance();
    const result = await claimService.submitClaim(claim);
    navigate(`/claims/${result.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            New Claim
          </h2>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <ClaimSubmissionForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}