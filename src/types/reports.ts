export interface ReportMetric {
  value: number;
  trend: number;
  label: string;
  description?: string;
}

export interface FraudIndicator {
  type: 'high' | 'medium' | 'low';
  description: string;
  claimIds: string[];
  pattern: string;
}

export interface ValidationReport {
  totalClaims: number;
  errorRate: number;
  commonErrors: {
    code: string;
    count: number;
    description: string;
  }[];
  trendsOverTime: {
    date: string;
    errorCount: number;
  }[];
}

export interface FraudReport {
  suspiciousClaimsCount: number;
  totalFlagged: number;
  riskScore: number;
  indicators: FraudIndicator[];
  patterns: {
    type: string;
    frequency: number;
    description: string;
  }[];
}

export interface FinancialReport {
  totalAmount: number;
  deniedAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  averageProcessingTime: number;
  paymentTrends: {
    date: string;
    amount: number;
    status: string;
  }[];
}

export interface ComplianceReport {
  score: number;
  violations: {
    type: string;
    count: number;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }[];
  recommendations: string[];
}

export interface ProviderReport {
  providerId: string;
  claimVolume: number;
  approvalRate: number;
  averageClaimAmount: number;
  specialtyBenchmark: {
    average: number;
    percentile: number;
  };
  commonProcedures: {
    code: string;
    count: number;
    amount: number;
  }[];
}</content></file>
<boltAction type="file" filePath="src/services/ReportingService.ts">import {
  ValidationReport,
  FraudReport,
  FinancialReport,
  ComplianceReport,
  ProviderReport,
  FraudIndicator
} from '../types/reports';
import { DetailedClaim } from '../types/claims';

export class ReportingService {
  private static instance: ReportingService;

  private constructor() {}

  public static getInstance(): ReportingService {
    if (!ReportingService.instance) {
      ReportingService.instance = new ReportingService();
    }
    return ReportingService.instance;
  }

  async generateValidationReport(claims: DetailedClaim[]): Promise<ValidationReport> {
    const errors = this.analyzeValidationErrors(claims);
    const trends = this.calculateErrorTrends(claims);

    return {
      totalClaims: claims.length,
      errorRate: errors.length / claims.length,
      commonErrors: this.aggregateCommonErrors(errors),
      trendsOverTime: trends
    };
  }

  async generateFraudReport(claims: DetailedClaim[]): Promise<FraudReport> {
    const indicators = this.detectFraudPatterns(claims);
    const riskScore = this.calculateRiskScore(indicators);

    return {
      suspiciousClaimsCount: indicators.reduce((sum, i) => sum + i.claimIds.length, 0),
      totalFlagged: indicators.length,
      riskScore,
      indicators,
      patterns: this.analyzeFraudPatterns(indicators)
    };
  }

  async generateFinancialReport(claims: DetailedClaim[]): Promise<FinancialReport> {
    const amounts = this.calculateAmounts(claims);
    const processingTime = this.calculateProcessingTime(claims);
    const trends = this.analyzePaymentTrends(claims);

    return {
      ...amounts,
      averageProcessingTime: processingTime,
      paymentTrends: trends
    };
  }

  async generateComplianceReport(claims: DetailedClaim[]): Promise<ComplianceReport> {
    const violations = this.checkComplianceViolations(claims);
    const score = this.calculateComplianceScore(violations);

    return {
      score,
      violations,
      recommendations: this.generateComplianceRecommendations(violations)
    };
  }

  async generateProviderReport(providerId: string, claims: DetailedClaim[]): Promise<ProviderReport> {
    const providerClaims = claims.filter(claim => claim.providerId === providerId);
    const benchmark = await this.calculateSpecialtyBenchmark(providerId);

    return {
      providerId,
      claimVolume: providerClaims.length,
      approvalRate: this.calculateApprovalRate(providerClaims),
      averageClaimAmount: this.calculateAverageAmount(providerClaims),
      specialtyBenchmark: benchmark,
      commonProcedures: this.analyzeCommonProcedures(providerClaims)
    };
  }

  private detectFraudPatterns(claims: DetailedClaim[]): FraudIndicator[] {
    const indicators: FraudIndicator[] = [];

    // Duplicate claims detection
    this.detectDuplicateClaims(claims, indicators);

    // Unusual billing patterns
    this.detectUnusualBillingPatterns(claims, indicators);

    // Service frequency analysis
    this.analyzeServiceFrequency(claims, indicators);

    // Provider pattern analysis
    this.analyzeProviderPatterns(claims, indicators);

    return indicators;
  }

  private detectDuplicateClaims(claims: DetailedClaim[], indicators: FraudIndicator[]): void {
    const claimMap = new Map<string, DetailedClaim[]>();
    
    claims.forEach(claim => {
      const key = `${claim.patientId}-${claim.dateOfService}`;
      const existing = claimMap.get(key) || [];
      claimMap.set(key, [...existing, claim]);
    });

    claimMap.forEach((duplicates, key) => {
      if (duplicates.length > 1) {
        indicators.push({
          type: 'high',
          description: 'Multiple claims for same patient on same date',
          claimIds: duplicates.map(d => d.id),
          pattern: 'duplicate_claims'
        });
      }
    });
  }

  private detectUnusualBillingPatterns(claims: DetailedClaim[], indicators: FraudIndicator[]): void {
    // Analyze billing amounts
    const amounts = claims.map(c => c.totalAmount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length
    );

    claims.forEach(claim => {
      if (claim.totalAmount > mean + 3 * stdDev) {
        indicators.push({
          type: 'medium',
          description: 'Unusually high claim amount',
          claimIds: [claim.id],
          pattern: 'high_amount'
        });
      }
    });
  }

  private analyzeServiceFrequency(claims: DetailedClaim[], indicators: FraudIndicator[]): void {
    const serviceMap = new Map<string, number>();
    
    claims.forEach(claim => {
      claim.items.forEach(item => {
        const count = serviceMap.get(item.code) || 0;
        serviceMap.set(item.code, count + 1);
      });
    });

    serviceMap.forEach((count, code) => {
      if (count > 100) { // Threshold for suspicious frequency
        const affectedClaims = claims
          .filter(c => c.items.some(i => i.code === code))
          .map(c => c.id);

        indicators.push({
          type: 'medium',
          description: `Unusually high frequency of service ${code}`,
          claimIds: affectedClaims,
          pattern: 'high_frequency'
        });
      }
    });
  }

  private analyzeProviderPatterns(claims: DetailedClaim[], indicators: FraudIndicator[]): void {
    const providerMap = new Map<string, DetailedClaim[]>();
    
    claims.forEach(claim => {
      const existing = providerMap.get(claim.providerId) || [];
      providerMap.set(claim.providerId, [...existing, claim]);
    });

    providerMap.forEach((providerClaims, providerId) => {
      // Check for unusual daily claim volumes
      const dailyVolumes = new Map<string, number>();
      providerClaims.forEach(claim => {
        const date = claim.dateOfService.split('T')[0];
        const count = dailyVolumes.get(date) || 0;
        dailyVolumes.set(date, count + 1);
      });

      dailyVolumes.forEach((count, date) => {
        if (count > 50) { // Threshold for suspicious daily volume
          indicators.push({
            type: 'high',
            description: `Unusually high daily claim volume for provider ${providerId}`,
            claimIds: providerClaims
              .filter(c => c.dateOfService.startsWith(date))
              .map(c => c.id),
            pattern: 'high_volume'
          });
        }
      });
    });
  }

  private calculateRiskScore(indicators: FraudIndicator[]): number {
    const weights = {
      high: 1.0,
      medium: 0.6,
      low: 0.3
    };

    const totalWeight = indicators.reduce((sum, i) => sum + weights[i.type], 0);
    const maxPossibleWeight = indicators.length;
    
    return (totalWeight / maxPossibleWeight) * 100;
  }

  private checkComplianceViolations(claims: DetailedClaim[]): any[] {
    // Implement compliance checks
    return [];
  }

  private calculateComplianceScore(violations: any[]): number {
    // Implement compliance scoring
    return 0;
  }

  private generateComplianceRecommendations(violations: any[]): string[] {
    // Generate recommendations based on violations
    return [];
  }

  private calculateSpecialtyBenchmark(providerId: string): Promise<any> {
    // Calculate specialty benchmarks
    return Promise.resolve({
      average: 0,
      percentile: 0
    });
  }

  private analyzeCommonProcedures(claims: DetailedClaim[]): any[] {
    // Analyze common procedures
    return [];
  }

  private calculateAmounts(claims: DetailedClaim[]): any {
    // Calculate financial amounts
    return {
      totalAmount: 0,
      deniedAmount: 0,
      approvedAmount: 0,
      pendingAmount: 0
    };
  }

  private calculateProcessingTime(claims: DetailedClaim[]): number {
    // Calculate average processing time
    return 0;
  }

  private analyzePaymentTrends(claims: DetailedClaim[]): any[] {
    // Analyze payment trends
    return [];
  }

  private analyzeValidationErrors(claims: DetailedClaim[]): any[] {
    // Analyze validation errors
    return [];
  }

  private calculateErrorTrends(claims: DetailedClaim[]): any[] {
    // Calculate error trends
    return [];
  }

  private aggregateCommonErrors(errors: any[]): any[] {
    // Aggregate common errors
    return [];
  }

  private calculateApprovalRate(claims: DetailedClaim[]): number {
    // Calculate approval rate
    return 0;
  }

  private calculateAverageAmount(claims: DetailedClaim[]): number {
    // Calculate average amount
    return 0;
  }
}</content></file>
<boltAction type="file" filePath="src/pages/Reports.tsx">import React, { useState, useEffect } from 'react';
import { ReportingService } from '../services/ReportingService';
import { 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Shield, 
  TrendingUp,
  User
} from 'lucide-react';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<string>('fraud');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadReport();
  }, [selectedReport]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const service = ReportingService.getInstance();
      let data;

      switch (selectedReport) {
        case 'fraud':
          data = await service.generateFraudReport([]);
          break;
        case 'validation':
          data = await service.generateValidationReport([]);
          break;
        case 'financial':
          data = await service.generateFinancialReport([]);
          break;
        case 'compliance':
          data = await service.generateComplianceReport([]);
          break;
        case 'provider':
          data = await service.generateProviderReport('test-provider', []);
          break;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Reports
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <div className="sm:hidden">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="fraud">Fraud Detection</option>
            <option value="validation">Validation Errors</option>
            <option value="financial">Financial Analysis</option>
            <option value="compliance">Compliance</option>
            <option value="provider">Provider Analysis</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setSelectedReport('fraud')}
              className={`${
                selectedReport === 'fraud'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              <AlertTriangle className="h-5 w-5 inline-block mr-2" />
              Fraud Detection
            </button>
            <button
              onClick={() => setSelectedReport('validation')}
              className={`${
                selectedReport === 'validation'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              <FileText className="h-5 w-5 inline-block mr-2" />
              Validation Errors
            </button>
            <button
              onClick={() => setSelectedReport('financial')}
              className={`${
                selectedReport === 'financial'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              <DollarSign className="h-5 w-5 inline-block mr-2" />
              Financial Analysis
            </button>
            <button
              onClick={() => setSelectedReport('compliance')}
              className={`${
                selectedReport === 'compliance'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              <Shield className="h-5 w-5 inline-block mr-2" />
              Compliance
            </button>
            <button
              onClick={() => setSelectedReport('provider')}
              className={`${
                selectedReport === 'provider'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              <User className="h-5 w-5 inline-block mr-2" />
              Provider Analysis
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {selectedReport === 'fraud' && reportData && (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div className="px-4 py-6 sm:p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Fraud Detection Report
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-700">Risk Score</span>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-red-700">
                      {reportData.riskScore.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-700">
                        Suspicious Claims
                      </span>
                      <FileText className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-yellow-700">
                      {reportData.suspiciousClaimsCount}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">
                        Patterns Detected
                      </span>
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-blue-700">
                      {reportData.patterns.length}
                    </p>
                  </div>
                </div>

                {/* Fraud Indicators */}
                <div className="space-y-6">
                  <h4 className="text-sm font-medium text-gray-900">
                    Detected Patterns
                  </h4>
                  <div className="space-y-4">
                    {reportData.indicators.map((indicator: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          indicator.type === 'high'
                            ? 'bg-red-50'
                            : indicator.type === 'medium'
                            ? 'bg-yellow-50'
                            : 'bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              indicator.type === 'high'
                                ? 'text-red-500'
                                : indicator.type === 'medium'
                                ? 'text-yellow-500'
                                : 'text-blue-500'
                            } mt-0.5`}
                          />
                          <div className="ml-3">
                            <p
                              className={`text-sm font-medium ${
                                indicator.type === 'high'
                                  ? 'text-red-800'
                                  : indicator.type === 'medium'
                                  ? 'text-yellow-800'
                                  : 'text-blue-800'
                              }`}
                            >
                              {indicator.description}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              Affected Claims: {indicator.claimIds.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add similar sections for other report types */}
        </div>
      )}
    </div>
  );
}</content></file>
<boltAction type="shell">
<command>npm run dev</command>