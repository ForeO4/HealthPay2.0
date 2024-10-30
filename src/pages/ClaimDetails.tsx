import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClaimService } from '../services/ClaimService';
import { PriceEstimationService } from '../services/PriceEstimationService';
import { DetailedClaim } from '../types/claims';
import { InsuranceDetails, NetworkStatus } from '../types/pricing';
import { ClaimAnalysis } from '../components/ClaimAnalysis';
import { ClaimTimeline } from '../components/ClaimTimeline';
import { ClaimStatusBadge } from '../components/ClaimStatusBadge';
import { PriceEstimator } from '../components/PriceEstimator';
import { CostComparison } from '../components/CostComparison';
import { NetworkAnalysis } from '../components/NetworkAnalysis';
import { SavingsOpportunities } from '../components/SavingsOpportunities';
import { FileText, DollarSign, Calendar, Building } from 'lucide-react';

export function ClaimDetails() {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<DetailedClaim | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const [similarClaims, setSimilarClaims] = useState<DetailedClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadClaimDetails(id);
    }
  }, [id]);

  const loadClaimDetails = async (claimId: string) => {
    try {
      const claimService = ClaimService.getInstance();
      const priceEstimationService = PriceEstimationService.getInstance();

      const [claimData, analysisData, similarClaimsData] = await Promise.all([
        claimService.getClaim(claimId),
        claimService.analyzeClaim(claimId),
        claimService.getSimilarClaims(claimId),
      ]);

      // Mock insurance and network data
      const mockInsurance: InsuranceDetails = {
        planType: 'PPO',
        deductible: 2000,
        deductibleMet: 500,
        outOfPocketMax: 6000,
        outOfPocketMet: 1000,
        coinsurance: 20,
        copay: 30,
      };

      const mockNetworkStatus: NetworkStatus = {
        isInNetwork: true,
        networkTier: 'preferred',
        negotiatedRate: claimData.totalAmount * 0.7,
      };

      const estimateData = await priceEstimationService.estimatePrice(
        claimData,
        mockInsurance,
        mockNetworkStatus
      );

      setClaim(claimData);
      setAnalysis(analysisData);
      setPriceEstimate(estimateData);
      setSimilarClaims(similarClaimsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error || 'Claim not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Claim #{claim.id.slice(0, 8)}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Building className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              Provider {claim.providerId}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Calendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              {new Date(claim.dateOfService).toLocaleDateString()}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <DollarSign className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              ${claim.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <ClaimStatusBadge status={claim.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <PriceEstimator estimate={priceEstimate} />
          <CostComparison claim={claim} similarClaims={similarClaims} />
          <NetworkAnalysis claim={claim} similarClaims={similarClaims} />
        </div>

        <div className="space-y-6">
          <SavingsOpportunities claim={claim} similarClaims={similarClaims} />
          <ClaimAnalysis claimId={claim.id} analysis={analysis} />
          <ClaimTimeline auditTrail={claim.auditTrail} />
        </div>
      </div>
    </div>
  );
}