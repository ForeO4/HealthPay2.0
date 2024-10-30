import { 
  PaymentMethod, 
  PaymentTransaction, 
  PaymentProcessor, 
  PaymentResult,
  ValidationResult 
} from '../types/payment';

class PaymentService implements PaymentProcessor {
  private static instance: PaymentService;
  private readonly API_BASE_URL = '/api/payments';

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private async request<T>(
    endpoint: string, 
    method: string, 
    data?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Transaction-ID': crypto.randomUUID(),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Payment request failed: ${response.statusText}`);
    }

    return response.json();
  }

  public async processPayment(
    transaction: PaymentTransaction
  ): Promise<PaymentResult> {
    try {
      // Pre-processing validation
      await this.validatePaymentMethod(transaction.paymentMethod);
      
      // Process the payment
      const result = await this.request<PaymentResult>(
        '/process',
        'POST',
        transaction
      );

      // Log the transaction
      await this.logTransaction({
        ...transaction,
        status: result.success ? 'completed' : 'failed',
      });

      return result;
    } catch (error) {
      // Handle errors and logging
      await this.logError(transaction.id, error);
      throw error;
    }
  }

  public async validatePaymentMethod(
    method: PaymentMethod
  ): Promise<ValidationResult> {
    // Implement validation logic based on payment method type
    switch (method.type) {
      case 'ach':
        return this.validateACH(method);
      case 'card':
        return this.validateCard(method);
      case 'check':
        return this.validateCheck(method);
      default:
        return {
          isValid: false,
          errors: ['Unsupported payment method'],
        };
    }
  }

  public async refundTransaction(
    transactionId: string,
    amount: number
  ): Promise<RefundResult> {
    return this.request<RefundResult>('/refund', 'POST', {
      transactionId,
      amount,
    });
  }

  private async validateACH(method: PaymentMethod): Promise<ValidationResult> {
    // Implement ACH-specific validation
    const errors: string[] = [];
    
    if (!method.metadata.bankName) {
      errors.push('Bank name is required');
    }
    
    if (!/^\d{4}$/.test(method.lastFour)) {
      errors.push('Invalid account number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async validateCard(method: PaymentMethod): Promise<ValidationResult> {
    // Implement card-specific validation
    const errors: string[] = [];
    
    if (!method.metadata.cardBrand) {
      errors.push('Card brand is required');
    }
    
    if (!method.metadata.expiryDate) {
      errors.push('Expiry date is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async validateCheck(method: PaymentMethod): Promise<ValidationResult> {
    // Implement check-specific validation
    const errors: string[] = [];
    
    if (!method.metadata.bankName) {
      errors.push('Bank name is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async logTransaction(transaction: PaymentTransaction): Promise<void> {
    await this.request('/logs', 'POST', {
      transactionId: transaction.id,
      status: transaction.status,
      timestamp: new Date().toISOString(),
      metadata: transaction.metadata,
    });
  }

  private async logError(
    transactionId: string, 
    error: unknown
  ): Promise<void> {
    await this.request('/logs/error', 'POST', {
      transactionId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}