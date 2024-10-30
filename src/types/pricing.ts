export interface InsuranceDetails {
  planType: 'HMO' | 'PPO' | 'EPO' | 'HDHP';
  deductible: number;
  deductibleMet: number;
  outOfPocketMax: number;
  outOfPocketMet: number;
  coinsurance: number;
  copay: number;
}

export interface PriceEstimate {
  totalCost: number;
  insurancePays: number;
  patientPays: number;
  breakdown: {
    deductible: number;
    coinsurance: number;
    copay: number;
  };
  confidence: number;
  factors: string[];
  similarClaims: number;
}

export interface NetworkStatus {
  isInNetwork: boolean;
  networkTier: 'preferred' | 'standard' | 'out-of-network';
  negotiatedRate?: number;
}