describe('Responsive Design', () => {
  const sizes = ['iphone-6', 'ipad-2', [1024, 768]];

  sizes.forEach(size => {
    it(`should display correctly on ${size}`, () => {
      if (Array.isArray(size)) {
        cy.viewport(size[0], size[1]);
      } else {
        cy.viewport(size);
      }
      
      cy.visit('/');
      cy.get('nav').should('be.visible');
      cy.get('[data-testid="dashboard-cards"]').should('be.visible');
    });
  });

  it('should show mobile menu on small screens', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-menu-items"]').should('be.visible');
  });

  it('should stack cards on mobile', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.get('[data-testid="dashboard-cards"]')
      .should('have.css', 'grid-template-columns', '1fr');
  });
});