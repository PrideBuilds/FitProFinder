/**
 * Cypress custom commands
 * Reusable commands for E2E tests
 */

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('not.include', '/auth/login');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-cy="logout-button"]').click();
  cy.url().should('include', '/auth/login');
});

// Seed database command
Cypress.Commands.add('seedDatabase', () => {
  cy.request('POST', '/api/test/seed');
});

// Clear database command
Cypress.Commands.add('clearDatabase', () => {
  cy.request('POST', '/api/test/clear');
});
