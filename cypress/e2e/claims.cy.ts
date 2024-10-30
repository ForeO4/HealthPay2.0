describe('Claims Management', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'provider'
      }));
    });
    cy.visit('/claims');
  });

  it('should display claims list', () => {
    cy.contains('Claims').should('be.visible');
    cy.get('table').should('exist');
  });

  it('should navigate to new claim form', () => {
    cy.contains('New Claim').click();
    cy.url().should('include', '/claims/new');
  });

  it('should submit a new claim', () => {
    cy.visit('/claims/new');
    
    // Fill out the claim form
    cy.get('input[name="providerId"]').type('PROV123');
    cy.get('input[name="dateOfService"]').type('2024-03-20');
    cy.get('select[name="type"]').select('medical');

    // Add claim item
    cy.contains('Add Item').click();
    cy.get('input[placeholder="CPT/HCPCS Code"]').type('99213');
    cy.get('input[placeholder="Quantity"]').type('1');
    cy.get('input[placeholder="Unit Price"]').type('150');
    cy.get('input[placeholder="Description"]').type('Office visit');

    // Add diagnosis
    cy.contains('Add Diagnosis').click();
    cy.get('input[placeholder="ICD-10 Code"]').type('J20.9');
    cy.get('select').select('primary');
    cy.get('input[placeholder="Description"]').type('Acute bronchitis');

    // Submit the form
    cy.contains('Submit Claim').click();

    // Should redirect to claim details
    cy.url().should('match', /\/claims\/[\w-]+/);
  });
});