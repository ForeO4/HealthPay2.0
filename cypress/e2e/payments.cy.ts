describe('Payments', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'consumer'
      }));
    });
  });

  it('should display payment form', () => {
    cy.visit('/payments/new');
    cy.get('form').within(() => {
      cy.contains('Payment Method').should('be.visible');
      cy.get('input[type="radio"]').should('have.length', 3);
    });
  });

  it('should handle card payment submission', () => {
    cy.visit('/payments/new');
    
    // Select card payment
    cy.get('input[value="card"]').check();
    
    // Fill card details
    cy.get('input[name="lastFour"]').type('4242');
    cy.get('input[name="expiryDate"]').type('12/25');
    
    // Submit payment
    cy.contains('Pay').click();
    
    // Should show success message
    cy.contains('Payment processed successfully').should('be.visible');
  });

  it('should handle ACH payment submission', () => {
    cy.visit('/payments/new');
    
    // Select ACH payment
    cy.get('input[value="ach"]').check();
    
    // Fill ACH details
    cy.get('input[name="bankName"]').type('Test Bank');
    cy.get('input[name="lastFour"]').type('1234');
    
    // Submit payment
    cy.contains('Pay').click();
    
    // Should show success message
    cy.contains('Payment processed successfully').should('be.visible');
  });
});