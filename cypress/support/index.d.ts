declare namespace Cypress {
  interface Chainable<Subject = any> {
    loginViaApi(): Chainable<void>;
  }
}
