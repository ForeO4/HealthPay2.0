describe('Error Handling', () => {
  it('should show error boundary on unexpected errors', () => {
    cy.intercept('GET', '/api/claims', { statusCode: 500 });
    cy.visit('/claims');
    cy.contains('Something went wrong').should('be.visible');
    cy.contains('Reload Page').should('be.visible');
  });

  it('should handle network errors gracefully', () => {
    cy.intercept('GET', '/api/claims', { forceNetworkError: true });
    cy.visit('/claims');
    cy.contains('Network error').should('be.visible');
  });

  it('should recover from errors after reload', () => {
    cy.intercept('GET', '/api/claims', { statusCode: 500 });
    cy.visit('/claims');
    cy.contains('Reload Page').click();
    cy.contains('Claims').should('be.visible');
  });
});