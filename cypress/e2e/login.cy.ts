function generateMockJWT(payload: any): string {
  const base64 = btoa(JSON.stringify(payload));
  return `ey.fake.${base64}`;
}

describe('Login Page Flow', () => {
  const email = 'test@test.com';
  const password = 'pass123';
  const mockToken = generateMockJWT({
    name: 'Test User',
    roles: ['USER'],
    userId: 42,
    profileId: 99,
    profileType: 'Tutor'
  });

  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully and redirect to /home', () => {
    cy.intercept('POST', 'http://localhost:8080/auth/login', {
      statusCode: 200,
      body: { token: mockToken }
    }).as('login');

    cy.get('input[formcontrolname="email"]').type(email);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.contains('Login').click();

    cy.wait('@login');
    cy.url().should('include', '/home');
  });

  it('should show error on invalid credentials (400)', () => {
    cy.intercept('POST', 'http://localhost:8080/auth/login', {
      statusCode: 400
    }).as('loginFail');

    cy.get('input[formcontrolname="email"]').type('wrong@example.com');
    cy.get('input[formcontrolname="password"]').type('wrongpass');
    cy.contains('Login').click();

    cy.wait('@loginFail');
    cy.get('.error-message').should('contain', 'Invalid email or password');
  });

  it('should show unverified email error and allow resending verification (403)', () => {
    const errorMessage = 'Email is not verified. Please verify your email before logging in.';

    cy.intercept('POST', 'http://localhost:8080/auth/login', {
      statusCode: 403,
      body: { message: errorMessage }
    }).as('login403');

    cy.get('input[formcontrolname="email"]').type(email);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.contains('Login').click();

    cy.wait('@login403');
    cy.get('.error-message').should('contain', errorMessage);
    cy.contains('request a new verification link').should('exist');

    cy.intercept('POST', 'http://localhost:8080/api/users/requestVerification', {
      statusCode: 200
    }).as('resendVerification');

    cy.contains('request a new verification link').click();
    cy.wait('@resendVerification');
  });

  it('should not allow submission with empty fields', () => {
    cy.contains('Login').should('be.disabled');
    cy.get('input[formcontrolname="email"]').type('bad@bad');
    cy.get('input[formcontrolname="password"]').type('123');
    cy.get('input[formcontrolname="email"]').clear();
    cy.contains('Login').should('be.disabled');
  });
});
