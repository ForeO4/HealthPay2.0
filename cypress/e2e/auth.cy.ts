describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show login/register buttons when not authenticated', () => {
    cy.get('nav').within(() => {
      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
    });
  });

  it('should navigate to login page', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('should navigate to register page', () => {
    cy.contains('Register').click();
    cy.url().should('include', '/register');
  });
});