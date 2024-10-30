import { DetailedClaim } from '../types/claims';
import { InsuranceDetails, NetworkStatus, PriceEstimate } from '../types/pricing';

export class PriceEstimationService {
  private static instance: PriceEstimationService;

  private constructor() {}

  public static getInstance(): PriceEstimationService {
    if (!PriceEstimationService.instance) {
      PriceEstimationService.instance = new PriceEstimationService();
    }
    return PriceEstimationService.instance;
  }

  async estimatePrice(
    claim: DetailedClaim,
    insurance: InsuranceDetails,
    networkStatus: NetworkStatus
  ): Promise<PriceEstimate> {
    // Calculate base cost
    const totalCost = networkStatus.negotiatedRate || claim.totalAmount;
    
    // Calculate remaining deductible
    const remainingDeductible = Math.max(
      0,
      insurance.deductible - insurance.deductibleMet
    );

    // Calculate patient responsibility
    const deductiblePortion = Math.min(remainingDeductible, totalCost);
    const afterDeductible = Math.max(0, totalCost - deductiblePortion);
    
    // Calculate coinsurance
    const coinsurancePortion = networkStatus.isInNetwork
      ? afterDeductible * (insurance.coinsurance / 100)
      : afterDeductible * 0.5; // 50% for out-of-network

    // Apply copay if applicable
    const copayPortion = insurance.planType === 'HMO' ? insurance.copay : 0;

    // Calculate total patient responsibility
    const patientPays = Math.min(
      deductiblePortion + coinsurancePortion + copayPortion,
      insurance.outOfPocketMax - insurance.outOfPocketMet
    );

    // Calculate insurance portion
    const insurancePays = totalCost - patientPays;

    return {
      totalCost,
      insurancePays,
      patientPays,
      breakdown: {
        deductible: deductiblePortion,
        coinsurance: coinsurancePortion,
        copay: copayPortion,
      },
      confidence: this.calculateConfidence(claim, networkStatus),
      factors: this.getRelevantFactors(claim, insurance, networkStatus),
      similarClaims: 15 // In real implementation, this would be from historical data
    };
  }

  private calculateConfidence(
    claim: DetailedClaim,
    networkStatus: NetworkStatus
  ): number {
    let score = 75; // Base confidence score

    // Adjust based on network status
    if (networkStatus.isInNetwork) {
      score += 15;
    } else {
      score -= 20;
    }

    // Adjust based on claim complexity
    if (claim.items.length > 5) {
      score -= 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private getRelevantFactors(
    claim: DetailedClaim,
    insurance: InsuranceDetails,
    networkStatus: NetworkStatus
  ): string[] {
    const factors: string[] = [];

    if (!networkStatus.isInNetwork) {
      factors.push('Out-of-network provider may result in higher costs');
    }

    if (insurance.deductibleMet < insurance.deductible) {
      factors.push('Deductible not yet met');
    }

    if (claim.items.length > 5) {
      factors.push('Complex procedure with multiple components');
    }

    return factors;
  }
}