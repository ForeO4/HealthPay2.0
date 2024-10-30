export interface ClaimItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface Diagnosis {
  code: string;
  type: 'primary' | 'secondary';
  description: string;
}

export interface AuditEvent {
  timestamp: string;
  action: string;
  notes?: string;
  userId?: string;
}

export interface DetailedClaim {
  id: string;
  status: 'pending' | 'approved' | 'denied' | 'review';
  providerId: string;
  patientId: string;
  dateOfService: string;
  submissionDate: string;
  totalAmount: number;
  items: ClaimItem[];
  diagnoses: Diagnosis[];
  auditTrail: AuditEvent[];
}

export interface ClaimAnalysisResult {
  riskScore: number;
  flags: string[];
  recommendations: string[];
  similarClaims: string[];
  complianceChecks: {
    passed: boolean;
    name: string;
    details?: string;
  }[];
}