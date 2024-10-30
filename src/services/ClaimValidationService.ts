import { DetailedClaim, ClaimItem, Diagnosis } from '../types/claims';

export class ClaimValidationService {
  private static instance: ClaimValidationService;

  private constructor() {}

  public static getInstance(): ClaimValidationService {
    if (!ClaimValidationService.instance) {
      ClaimValidationService.instance = new ClaimValidationService();
    }
    return ClaimValidationService.instance;
  }

  validateClaim(claim: DetailedClaim): string[] {
    const errors: string[] = [];

    // Required fields validation
    if (!claim.providerId) {
      errors.push('Provider ID is required');
    }

    if (!claim.items || !Array.isArray(claim.items) || claim.items.length === 0) {
      errors.push('Items must be a non-empty array');
    } else {
      claim.items.forEach((item, index) => {
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Item quantity must be greater than 0`);
        }
        if (item.unitPrice < 0) {
          errors.push(`Item ${index + 1}: Unit price cannot be negative`);
        }
        if (item.totalAmount < 0) {
          errors.push(`Item ${index + 1}: Total amount cannot be negative`);
        }
      });
    }

    return errors;
  }

  validateClaimItem(item: ClaimItem): string[] {
    const errors: string[] = [];

    if (!item.code) {
      errors.push('Procedure code is required');
    }

    if (item.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (item.unitPrice < 0) {
      errors.push('Unit price cannot be negative');
    }

    if (item.totalAmount !== item.quantity * item.unitPrice) {
      errors.push('Total amount does not match quantity * unit price');
    }

    return errors;
  }

  validateDiagnosis(diagnosis: Diagnosis): string[] {
    const errors: string[] = [];

    if (!diagnosis.code) {
      errors.push('Diagnosis code is required');
    }

    if (!diagnosis.type) {
      errors.push('Diagnosis type is required');
    }

    return errors;
  }
}