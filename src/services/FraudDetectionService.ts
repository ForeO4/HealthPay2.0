import { DetailedClaim } from '../types/claims';

interface FraudPattern {
  type: 'duplicate' | 'unusual_amount' | 'frequency' | 'upcoding' | 'unbundling';
  confidence: number;
  affectedClaims: string[];
  description: string;
}

export class FraudDetectionService {
  private static instance: FraudDetectionService;

  private constructor() {}

  public static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }

  async analyzeClaim(claim: DetailedClaim, historicalClaims: DetailedClaim[]): Promise<FraudPattern[]> {
    const patterns: FraudPattern[] = [];

    // Detect duplicates
    const duplicates = this.detectDuplicates(claim, historicalClaims);
    if (duplicates.length > 0) {
      patterns.push({
        type: 'duplicate',
        confidence: 0.9,
        affectedClaims: duplicates,
        description: 'Duplicate claim submission detected'
      });
    }

    // Detect unusual amounts
    const amountAnomaly = this.detectUnusualAmount(claim, historicalClaims);
    if (amountAnomaly) {
      patterns.push({
        type: 'unusual_amount',
        confidence: amountAnomaly.confidence,
        affectedClaims: [claim.id],
        description: `Unusual claim amount: ${amountAnomaly.reason}`
      });
    }

    // Detect service frequency anomalies
    const frequencyPatterns = this.detectFrequencyAnomalies(claim, historicalClaims);
    patterns.push(...frequencyPatterns);

    // Detect potential upcoding
    const upcodingPattern = this.detectUpcoding(claim, historicalClaims);
    if (upcodingPattern) {
      patterns.push(upcodingPattern);
    }

    // Detect unbundling
    const unbundlingPattern = this.detectUnbundling(claim);
    if (unbundlingPattern) {
      patterns.push(unbundlingPattern);
    }

    return patterns;
  }

  private detectDuplicates(claim: DetailedClaim, historicalClaims: DetailedClaim[]): string[] {
    return historicalClaims
      .filter(historical => 
        historical.id !== claim.id &&
        historical.patientId === claim.patientId &&
        historical.dateOfService === claim.dateOfService &&
        this.hasSameServices(historical.items, claim.items)
      )
      .map(duplicate => duplicate.id);
  }

  private detectUnusualAmount(claim: DetailedClaim, historicalClaims: DetailedClaim[]): { confidence: number; reason: string } | null {
    const similarClaims = historicalClaims.filter(c => 
      this.hasSimilarServices(c.items, claim.items)
    );

    if (similarClaims.length === 0) return null;

    const amounts = similarClaims.map(c => c.totalAmount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length
    );

    const zScore = Math.abs((claim.totalAmount - mean) / stdDev);

    if (zScore > 3) {
      return {
        confidence: Math.min(0.9, zScore / 10),
        reason: `Amount deviates significantly from historical average (${zScore.toFixed(2)} standard deviations)`
      };
    }

    return null;
  }

  private detectFrequencyAnomalies(claim: DetailedClaim, historicalClaims: DetailedClaim[]): FraudPattern[] {
    const patterns: FraudPattern[] = [];
    const timeWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const claimDate = new Date(claim.dateOfService).getTime();

    // Group historical claims by service code
    const serviceFrequency = new Map<string, number>();
    
    claim.items.forEach(item => {
      const recentServices = historicalClaims
        .filter(c => 
          c.patientId === claim.patientId &&
          Math.abs(new Date(c.dateOfService).getTime() - claimDate) <= timeWindow
        )
        .flatMap(c => c.items)
        .filter(i => i.code === item.code)
        .length;

      serviceFrequency.set(item.code, recentServices);
    });

    serviceFrequency.forEach((frequency, code) => {
      if (frequency > 10) { // Threshold for suspicious frequency
        patterns.push({
          type: 'frequency',
          confidence: Math.min(0.8, frequency / 20),
          affectedClaims: [claim.id],
          description: `Unusual frequency of service ${code}: ${frequency} times in 30 days`
        });
      }
    });

    return patterns;
  }

  private detectUpcoding(claim: DetailedClaim, historicalClaims: DetailedClaim[]): FraudPattern | null {
    const evalVisitCodes = ['99211', '99212', '99213', '99214', '99215'];
    
    const visitCodes = claim.items
      .filter(item => evalVisitCodes.includes(item.code))
      .map(item => item.code);

    if (visitCodes.length === 0) return null;

    const patientHistory = historicalClaims
      .filter(c => c.patientId === claim.patientId)
      .flatMap(c => c.items)
      .filter(item => evalVisitCodes.includes(item.code))
      .map(item => evalVisitCodes.indexOf(item.code));

    if (patientHistory.length < 5) return null;

    const averageLevel = patientHistory.reduce((a, b) => a + b, 0) / patientHistory.length;
    const currentLevel = Math.max(...visitCodes.map(code => evalVisitCodes.indexOf(code)));

    if (currentLevel - averageLevel >= 2) {
      return {
        type: 'upcoding',
        confidence: 0.7,
        affectedClaims: [claim.id],
        description: 'Significant increase in visit level complexity'
      };
    }

    return null;
  }

  private detectUnbundling(claim: DetailedClaim): FraudPattern | null {
    const bundledProcedures = new Map<string, string[]>([
      ['80053', ['80048', '84443', '85025']],  // Comprehensive metabolic panel
      ['80076', ['80053', '82465', '83718']],  // Hepatic function panel
      // Add more bundled procedure combinations
    ]);

    for (const [bundled, components] of bundledProcedures.entries()) {
      const hasComponents = components.every(code =>
        claim.items.some(item => item.code === code)
      );

      if (hasComponents) {
        return {
          type: 'unbundling',
          confidence: 0.85,
          affectedClaims: [claim.id],
          description: `Potential unbundling of ${bundled}`
        };
      }
    }

    return null;
  }

  private hasSameServices(items1: DetailedClaim['items'], items2: DetailedClaim['items']): boolean {
    if (items1.length !== items2.length) return false;
    
    const codes1 = new Set(items1.map(item => item.code));
    return items2.every(item => codes1.has(item.code));
  }

  private hasSimilarServices(items1: DetailedClaim['items'], items2: DetailedClaim['items']): boolean {
    const codes1 = new Set(items1.map(item => item.code));
    const codes2 = new Set(items2.map(item => item.code));
    
    const intersection = new Set([...codes1].filter(x => codes2.has(x)));
    const union = new Set([...codes1, ...codes2]);
    
    return intersection.size / union.size >= 0.7; // 70% similarity threshold
  }
}