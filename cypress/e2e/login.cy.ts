describe('Login Page Flow - Real Backend', () => {
  const email = 'tuneup.ad.confirm@gmail.com';
  const password = 'password';

  beforeEach(() => {
    cy.visit('/login');
  });

  it('should log in with valid credentials and redirect to /home', () => {
    cy.get('input[formcontrolname="email"]').type(email);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/home');
    cy.get('[data-cy="user-menu-button"]').click();
    cy.contains('Logout').should('be.visible');
  });

  it('should show error on invalid credentials (400)', () => {
    cy.intercept('POST', 'http://localhost:8080/auth/login', {
      statusCode: 400
    }).as('loginFail');

    cy.get('input[formcontrolname="email"]').type('wrong@example.com');
    cy.get('input[formcontrolname="password"]').type('wrongpass');
    cy.get('[data-cy="login-button"]').click();

    cy.wait('@loginFail');
    cy.get('.error-message').should('contain', 'Invalid email or password');
  });

  it('should show unverified email error and allow resending verification (403)', () => {
    const errorMessage = 'Email is not verified. Please verify your email before logging in.';
    const unverifiedEmail = 'test2@gmail.com';
    const password = 'password';

    cy.intercept('POST', 'http://localhost:8080/auth/login', {
      statusCode: 403,
      body: { message: errorMessage }
    }).as('login403');

    cy.get('input[formcontrolname="email"]').type(unverifiedEmail);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.get('[data-cy="login-button"]').click();

    cy.wait('@login403');
    cy.get('.error-message').should('contain', errorMessage);
    cy.contains('request a new verification link').should('exist');

    // Re-type email before clicking the link if it's needed
    cy.get('input[formcontrolname="email"]').clear().type(unverifiedEmail);

    cy.intercept('POST', 'http://localhost:8080/api/users/requestVerification').as('resendVerification');

    cy.contains('request a new verification link').click();
    cy.wait('@resendVerification');
  });

  it('should not allow submission with empty fields', () => {
    cy.get('[data-cy="login-button"]').should('be.disabled');
    cy.get('input[formcontrolname="email"]').type('bad@bad');
    cy.get('input[formcontrolname="password"]').type('123');
    cy.get('input[formcontrolname="email"]').clear();
    cy.get('[data-cy="login-button"]').should('be.disabled');
  });
});
