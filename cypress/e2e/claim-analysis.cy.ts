describe('Claim Analysis', () => {
  beforeEach(() => {
    cy.login('provider@test.com', 'password');
    cy.mockClaimData();
    cy.visit('/claims/test-claim-id');
  });

  it('should display risk score', () => {
    cy.contains('Risk Score').should('be.visible');
    cy.get('[data-testid="risk-score"]').should('exist');
  });

  it('should show compliance checks', () => {
    cy.contains('Compliance Checks').should('be.visible');
    cy.get('[data-testid="compliance-checks"]').within(() => {
      cy.contains('Required fields validation').should('be.visible');
      cy.contains('Diagnosis code format').should('be.visible');
    });
  });

  it('should display recommendations', () => {
    cy.contains('Recommendations').should('be.visible');
    cy.get('[data-testid="recommendations"]').should('exist');
  });
});