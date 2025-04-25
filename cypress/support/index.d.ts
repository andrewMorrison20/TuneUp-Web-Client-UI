import 'cypress-axe';

declare global {
  namespace Cypress {
    interface Chainable {
      loginViaApi(): Chainable<void>;
      checkAccessibility(): Chainable<void>;
    }
  }
}
