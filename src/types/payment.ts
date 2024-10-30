export interface PaymentMethod {
  id: string;
  type: 'ach' | 'card' | 'check';
  lastFour: string;
  isDefault: boolean;
  metadata: {
    bankName?: string;
    cardBrand?: string;
    expiryDate?: string;
  };
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethod;
  metadata: {
    claimId?: string;
    providerId?: string;
    patientId?: string;
    description?: string;
  };
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  performedBy: {
    id: string;
    role: string;
  };
  details: Record<string, unknown>;
}

export interface PaymentProcessor {
  processPayment(transaction: PaymentTransaction): Promise<PaymentResult>;
  validatePaymentMethod(method: PaymentMethod): Promise<ValidationResult>;
  refundTransaction(transactionId: string, amount: number): Promise<RefundResult>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
}