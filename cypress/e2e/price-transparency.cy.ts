describe('Price Transparency', () => {
  beforeEach(() => {
    cy.login('consumer@test.com', 'password');
    cy.mockClaimData();
    cy.visit('/claims/test-claim-id');
  });

  it('should show detailed cost breakdown', () => {
    cy.get('[data-testid="cost-breakdown"]').within(() => {
      cy.contains('Total Cost').should('be.visible');
      cy.contains('Insurance Pays').should('be.visible');
      cy.contains('You Pay').should('be.visible');
    });
  });

  it('should display insurance details', () => {
    cy.get('[data-testid="insurance-details"]').within(() => {
      cy.contains('Deductible').should('be.visible');
      cy.contains('Out of Pocket').should('be.visible');
      cy.contains('Coinsurance').should('be.visible');
    });
  });

  it('should show network status impact', () => {
    cy.get('[data-testid="network-status"]').within(() => {
      cy.contains('In-Network').should('be.visible');
      cy.contains('Negotiated Rate').should('be.visible');
    });
  });

  it('should display historical pricing data', () => {
    cy.get('[data-testid="historical-pricing"]').within(() => {
      cy.contains('Similar Claims').should('be.visible');
      cy.contains('Average Cost').should('be.visible');
      cy.contains('Price Range').should('be.visible');
    });
  });
});