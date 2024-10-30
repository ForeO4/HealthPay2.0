describe('Export Functionality', () => {
  beforeEach(() => {
    cy.login('provider@test.com', 'password');
    cy.visit('/claims/batch');
  });

  it('should export to Excel', () => {
    cy.contains('Export').click();
    cy.contains('Excel').click();
    cy.readFile('cypress/downloads/claims-export.xlsx').should('exist');
  });

  it('should export to CSV', () => {
    cy.contains('Export').click();
    cy.contains('CSV').click();
    cy.readFile('cypress/downloads/claims-export.csv').should('exist');
  });

  it('should handle empty data export', () => {
    cy.intercept('GET', '/api/claims', { body: [] });
    cy.contains('Export').click();
    cy.contains('No data to export').should('be.visible');
  });
});