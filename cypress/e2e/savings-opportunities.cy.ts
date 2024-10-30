describe('Savings Opportunities', () => {
  beforeEach(() => {
    cy.login('provider@test.com', 'password');
    
    // Mock claim data
    cy.intercept('GET', '/api/claims/*', {
      statusCode: 200,
      body: {
        id: 'test-claim',
        providerId: 'PROV123',
        patientId: 'PAT456',
        dateOfService: '2024-03-20',
        totalAmount: 1500,
        items: [
          {
            code: '99213',
            description: 'Office visit',
            quantity: 1,
            unitPrice: 150,
            totalAmount: 150
          },
          {
            code: '85025',
            description: 'Blood test',
            quantity: 1,
            unitPrice: 75,
            totalAmount: 75
          }
        ],
        status: 'pending',
        metadata: {
          network: 'preferred'
        }
      }
    });

    // Mock similar claims data
    cy.intercept('GET', '/api/claims/similar/*', {
      statusCode: 200,
      body: [
        {
          id: 'similar-1',
          totalAmount: 1200,
          items: [
            {
              code: '99213',
              unitPrice: 120,
              totalAmount: 120
            }
          ],
          metadata: {
            network: 'preferred'
          }
        },
        {
          id: 'similar-2',
          totalAmount: 1100,
          items: [
            {
              code: '99213',
              unitPrice: 110,
              totalAmount: 110
            }
          ],
          metadata: {
            network: 'standard'
          }
        }
      ]
    });

    cy.visit('/claims/test-claim');
  });

  it('should display savings opportunities section', () => {
    cy.contains('Savings Opportunities').should('be.visible');
    cy.get('[data-testid="savings-summary"]').within(() => {
      cy.contains('Total Potential').should('be.visible');
      cy.contains('Network Savings').should('be.visible');
      cy.contains('Items Above Avg').should('be.visible');
    });
  });

  it('should show detailed savings analysis', () => {
    cy.get('[data-testid="savings-details"]').within(() => {
      cy.contains('Savings by Item').should('be.visible');
      cy.contains('Office visit').should('be.visible');
      cy.contains('Blood test').should('be.visible');
    });
  });

  it('should display network optimization recommendations', () => {
    cy.get('[data-testid="network-recommendations"]').within(() => {
      cy.contains('Network Savings').should('be.visible');
      cy.contains('standard network').should('be.visible');
    });
  });

  it('should show price comparison bars', () => {
    cy.get('[data-testid="price-comparison"]').within(() => {
      cy.get('.bg-green-500').should('exist');
      cy.contains('Current:').should('be.visible');
      cy.contains('Average:').should('be.visible');
    });
  });

  it('should display savings recommendations', () => {
    cy.get('[data-testid="savings-recommendations"]').within(() => {
      cy.contains('Recommendations').should('be.visible');
      cy.get('li').should('have.length.at.least', 1);
    });
  });

  it('should handle claims with no savings opportunities', () => {
    // Mock claim with optimal pricing
    cy.intercept('GET', '/api/claims/*', {
      statusCode: 200,
      body: {
        id: 'optimal-claim',
        totalAmount: 1000,
        items: [
          {
            code: '99213',
            unitPrice: 100,
            totalAmount: 100
          }
        ]
      }
    });

    cy.visit('/claims/optimal-claim');
    cy.contains('Optimal Pricing').should('be.visible');
    cy.contains('All items are priced at or below market average').should('be.visible');
  });

  it('should update when switching between claims', () => {
    // Test navigation between claims
    cy.get('[data-testid="claims-list"]').within(() => {
      cy.contains('test-claim-2').click();
    });
    
    // Verify savings data updates
    cy.get('[data-testid="savings-summary"]').should('exist');
    cy.get('[data-testid="savings-details"]').should('exist');
  });

  it('should handle loading and error states', () => {
    // Test loading state
    cy.intercept('GET', '/api/claims/*', {
      delay: 1000,
      statusCode: 200,
      body: {}
    }).as('slowClaim');

    cy.visit('/claims/test-claim');
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.wait('@slowClaim');
    cy.get('[data-testid="loading-spinner"]').should('not.exist');

    // Test error state
    cy.intercept('GET', '/api/claims/*', {
      statusCode: 500,
      body: { error: 'Failed to load claim' }
    });

    cy.visit('/claims/error-claim');
    cy.contains('Failed to load claim data').should('be.visible');
    cy.contains('Try again').should('be.visible');
  });

  it('should handle responsive layout', () => {
    // Test mobile view
    cy.viewport('iphone-6');
    cy.get('[data-testid="savings-summary"]').should('have.css', 'grid-template-columns', '1fr');
    
    // Test tablet view
    cy.viewport('ipad-2');
    cy.get('[data-testid="savings-summary"]').should('have.css', 'grid-template-columns', 'repeat(3, 1fr)');
  });
});