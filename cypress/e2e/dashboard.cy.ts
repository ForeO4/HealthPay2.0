describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('consumer@test.com', 'password');
    cy.visit('/');
  });

  it('should display summary cards', () => {
    cy.get('[data-testid="dashboard-cards"]').within(() => {
      cy.contains('Total Balance').should('be.visible');
      cy.contains('Open Claims').should('be.visible');
      cy.contains('Recent Payments').should('be.visible');
    });
  });

  it('should show recent activity', () => {
    cy.get('[data-testid="recent-activity"]').within(() => {
      cy.contains('Recent Activity').should('be.visible');
      cy.get('.activity-item').should('have.length.at.least', 1);
    });
  });

  it('should display payment trends', () => {
    cy.get('[data-testid="payment-trends"]').within(() => {
      cy.contains('Payment Activity').should('be.visible');
      cy.get('.trend-chart').should('be.visible');
    });
  });
});