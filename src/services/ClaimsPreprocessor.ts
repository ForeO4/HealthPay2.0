import { DetailedClaim } from '../types/claims';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export class ClaimsPreprocessor {
  private static instance: ClaimsPreprocessor;

  private constructor() {}

  public static getInstance(): ClaimsPreprocessor {
    if (!ClaimsPreprocessor.instance) {
      ClaimsPreprocessor.instance = new ClaimsPreprocessor();
    }
    return ClaimsPreprocessor.instance;
  }

  async processFile(file: File): Promise<DetailedClaim[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'json':
        return this.processJSON(file);
      case 'csv':
        return this.processCSV(file);
      case 'xlsx':
      case 'xls':
        return this.processExcel(file);
      default:
        throw new Error('Unsupported file format');
    }
  }

  private async processJSON(file: File): Promise<DetailedClaim[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          const claims = Array.isArray(content) ? content : [content];
          resolve(claims);
        } catch (error) {
          reject(new Error('Invalid JSON format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private async processCSV(file: File): Promise<DetailedClaim[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          try {
            const claims = results.data.map(row => this.mapCSVToClaim(row));
            resolve(claims);
          } catch (error) {
            reject(new Error('Invalid CSV format'));
          }
        },
        error: (error) => reject(new Error(`CSV parsing error: ${error}`))
      });
    });
  }

  private async processExcel(file: File): Promise<DetailedClaim[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(worksheet);
          const claims = rows.map(row => this.mapExcelToClaim(row));
          resolve(claims);
        } catch (error) {
          reject(new Error('Invalid Excel format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  }

  private mapCSVToClaim(row: any): DetailedClaim {
    return {
      id: crypto.randomUUID(),
      providerId: row.providerId,
      patientId: row.patientId,
      dateOfService: row.dateOfService,
      submissionDate: new Date().toISOString(),
      status: 'pending',
      items: [{
        id: crypto.randomUUID(),
        code: row.procedureCode,
        description: row.description,
        quantity: Number(row.quantity),
        unitPrice: Number(row.unitPrice),
        totalAmount: Number(row.totalAmount)
      }],
      diagnoses: [{
        code: row.diagnosisCode,
        type: row.diagnosisType || 'primary',
        description: row.diagnosisDescription
      }],
      totalAmount: Number(row.totalAmount),
      auditTrail: [{
        timestamp: new Date().toISOString(),
        action: 'submitted',
        notes: 'Claim submitted via CSV upload'
      }]
    };
  }

  private mapExcelToClaim(row: any): DetailedClaim {
    return {
      id: crypto.randomUUID(),
      providerId: row.ProviderId,
      patientId: row.PatientId,
      dateOfService: row.DateOfService,
      submissionDate: new Date().toISOString(),
      status: 'pending',
      items: [{
        id: crypto.randomUUID(),
        code: row.ProcedureCode,
        description: row.Description,
        quantity: Number(row.Quantity),
        unitPrice: Number(row.UnitPrice),
        totalAmount: Number(row.TotalAmount)
      }],
      diagnoses: [{
        code: row.DiagnosisCode,
        type: row.DiagnosisType || 'primary',
        description: row.DiagnosisDescription
      }],
      totalAmount: Number(row.TotalAmount),
      auditTrail: [{
        timestamp: new Date().toISOString(),
        action: 'submitted',
        notes: 'Claim submitted via Excel upload'
      }]
    };
  }

  validateClaim(claim: DetailedClaim): string[] {
    const errors: string[] = [];

    // Required fields
    if (!claim.providerId) {
      errors.push('Provider ID is required');
    }

    if (!claim.patientId) {
      errors.push('Patient ID is required');
    }

    if (!claim.dateOfService) {
      errors.push('Date of service is required');
    }

    // Items validation
    if (!claim.items || !Array.isArray(claim.items) || claim.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      claim.items.forEach((item, index) => {
        if (!item.code) {
          errors.push(`Item ${index + 1}: Procedure code is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (item.unitPrice < 0) {
          errors.push(`Item ${index + 1}: Unit price cannot be negative`);
        }
        if (item.totalAmount !== item.quantity * item.unitPrice) {
          errors.push(`Item ${index + 1}: Total amount must equal quantity * unit price`);
        }
      });
    }

    // Diagnoses validation
    if (!claim.diagnoses || !Array.isArray(claim.diagnoses) || claim.diagnoses.length === 0) {
      errors.push('At least one diagnosis is required');
    } else {
      claim.diagnoses.forEach((diagnosis, index) => {
        if (!diagnosis.code) {
          errors.push(`Diagnosis ${index + 1}: Code is required`);
        }
        if (!['primary', 'secondary'].includes(diagnosis.type)) {
          errors.push(`Diagnosis ${index + 1}: Invalid type`);
        }
      });
    }

    // Total amount validation
    const calculatedTotal = claim.items.reduce((sum, item) => sum + item.totalAmount, 0);
    if (claim.totalAmount !== calculatedTotal) {
      errors.push('Total amount must equal sum of item amounts');
    }

    // Date validation
    const serviceDate = new Date(claim.dateOfService);
    if (serviceDate > new Date()) {
      errors.push('Date of service cannot be in the future');
    }

    return errors;
  }
}