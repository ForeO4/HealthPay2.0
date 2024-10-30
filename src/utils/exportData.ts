import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { DetailedClaim } from '../types/claims';

export function exportToExcel(claims: DetailedClaim[], filename: string = 'claims-export.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(
    claims.map(claim => ({
      'Claim ID': claim.id,
      'Provider ID': claim.providerId,
      'Patient ID': claim.patientId,
      'Date of Service': claim.dateOfService,
      'Status': claim.status,
      'Total Amount': claim.totalAmount,
      'Items': claim.items.length,
      'Diagnoses': claim.diagnoses.length,
      'Submission Date': claim.submissionDate
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Claims');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, filename);
}

export function exportToCSV(claims: DetailedClaim[], filename: string = 'claims-export.csv') {
  const csv = Papa.unparse(
    claims.map(claim => ({
      'Claim ID': claim.id,
      'Provider ID': claim.providerId,
      'Patient ID': claim.patientId,
      'Date of Service': claim.dateOfService,
      'Status': claim.status,
      'Total Amount': claim.totalAmount,
      'Items': claim.items.length,
      'Diagnoses': claim.diagnoses.length,
      'Submission Date': claim.submissionDate
    }))
  );
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

export function exportToPDF(claims: DetailedClaim[], filename: string = 'claims-export.pdf') {
  // Implement PDF export if needed
  console.warn('PDF export not implemented yet');
}