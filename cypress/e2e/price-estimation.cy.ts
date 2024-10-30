describe('Price Estimation', () => {
  beforeEach(() => {
    // Mock authentication and navigate to a claim
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'consumer'
      }));
    });
    cy.visit('/claims/test-claim-id');
  });

  it('should display price estimate', () => {
    cy.contains('Cost Estimate').should('be.visible');
    cy.contains('Total Cost').should('be.visible');
    cy.contains('Insurance Pays').should('be.visible');
    cy.contains('You Pay').should('be.visible');
  });

  it('should show cost breakdown', () => {
    cy.contains('Cost Breakdown').should('be.visible');
    cy.contains('Deductible').should('exist');
    cy.contains('Coinsurance').should('exist');
  });

  it('should display estimate confidence', () => {
    cy.contains('Estimate Confidence').should('be.visible');
    cy.contains('Based on').should('contain', 'similar claims');
  });

  it('should list important factors', () => {
    cy.contains('Important Factors').should('be.visible');
    cy.get('[data-testid="factor-list"]').should('exist');
  });
});