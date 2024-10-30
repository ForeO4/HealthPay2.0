describe('Batch Claims Processing', () => {
  beforeEach(() => {
    cy.login('provider@test.com', 'password');
    cy.visit('/claims/batch');
  });

  it('should handle file upload', () => {
    cy.get('input[type="file"]').selectFile({
      contents: JSON.stringify([
        {
          providerId: 'PROV123',
          patientId: 'PAT456',
          dateOfService: '2024-03-20',
          items: [{ code: '99213', quantity: 1, unitPrice: 150 }],
          diagnoses: [{ code: 'J20.9', type: 'primary' }]
        }
      ]),
      fileName: 'claims.json',
      mimeType: 'application/json'
    });

    cy.contains('claims.json').should('be.visible');
    cy.contains('Process Claims').click();
    cy.contains('Successfully processed').should('be.visible');
  });

  it('should handle invalid JSON files', () => {
    cy.get('input[type="file"]').selectFile({
      contents: 'invalid json',
      fileName: 'invalid.json',
      mimeType: 'application/json'
    });

    cy.contains('Process Claims').click();
    cy.contains('Invalid JSON format').should('be.visible');
  });
});