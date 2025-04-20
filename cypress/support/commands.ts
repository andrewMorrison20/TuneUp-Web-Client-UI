// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
// cypress/support/commands.ts

Cypress.Commands.add('loginViaApi', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:8080/auth/login',
    body: {
      email: 'e2euser@example.com',
      password: 'password123'
    }
  }).then((response) => {
    const { token } = response.body;
    const decoded = JSON.parse(atob(token.split('.')[1]));

    window.localStorage.setItem('auth_user_token', token);
    window.localStorage.setItem(
      'auth_user',
      JSON.stringify({
        name: decoded.name,
        userId: decoded.userId,
        profileId: decoded.profileId,
        roles: decoded.roles
      })
    );
  });
});
