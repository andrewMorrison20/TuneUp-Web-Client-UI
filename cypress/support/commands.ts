import 'cypress-axe';

// Existing login command
Cypress.Commands.add('loginViaApi', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:8080/auth/login',
    body: {
      email: 'erin@example.com',
      password: 'password'
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

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y(undefined, {
    includedImpacts: ['critical', 'serious']
  });
});
