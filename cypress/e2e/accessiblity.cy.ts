/// <reference types="cypress" />
import 'cypress-axe';

describe('Accessibility smoke checks', () => {
  const pages = [
    '/login',
    '/home',
    '/profiles/search',
    '/user-dashboard',
    '/profiles/2',
  ];

  pages.forEach((path) => {
    it(`has no detectable a11y violations on ${path}`, () => {
      if (/^\/(home|user-dashboard)|^\/profiles\/\d/.test(path)) {
        cy.visit('/login');
        cy.get('input[formcontrolname="email"]').type('tuneup.ad.confirm@gmail.com');
        cy.get('input[formcontrolname="password"]').type('password');
        cy.get('[data-cy="login-button"]').click();
        cy.url().should('include', '/home');
      }

      cy.visit(path);
      cy.injectAxe();
      cy.wait(500);
      cy.checkA11y(
        undefined,
        {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa']
          }
        },
        (violations) => {
          if (violations.length) {
            const messages = violations.map(({ id, impact, description, nodes }) => {
              const selectors = nodes.map(n => n.target.join(' ')).join(', ');
              return `${id} [${impact}]: ${description}\n  Affected elements: ${selectors}`;
            }).join('\n\n');
            throw new Error(`Accessibility violations (${violations.length}):\n\n${messages}`);
          }
        }
      );
    });
  });
});
