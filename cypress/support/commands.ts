// Extend the existing commands.ts file
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): void;
      mockClaimData(): void;
      mockPriceEstimate(): void;
      mockInsuranceDetails(): void;
    }
  }
}

// Add new mock commands
Cypress.Commands.add('mockPriceEstimate', () => {
  cy.intercept('GET', '/api/estimates/*', {
    statusCode: 200,
    body: {
      totalCost: 1500,
      insurancePays: 1200,
      patientPays: 300,
      breakdown: {
        deductible: 100,
        coinsurance: 200,
        copay: 0
      },
      confidence: 85,
      factors: [
        'In-network provider',
        'Deductible partially met',
        'Standard procedure'
      ],
      similarClaims: 15
    }
  });
});

Cypress.Commands.add('mockInsuranceDetails', () => {
  cy.intercept('GET', '/api/insurance/*', {
    statusCode: 200,
    body: {
      planType: 'PPO',
      deductible: 2000,
      deductibleMet: 500,
      outOfPocketMax: 6000,
      outOfPocketMet: 1000,
      coinsurance: 20,
      copay: 30
    }
  });
});