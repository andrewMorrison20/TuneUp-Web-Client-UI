describe('Tuition Summary Navigation (E2E)', () => {
  const email = 'erin@example.com';
  const password = 'password';

  beforeEach(() => {

    cy.visit('/login');
    cy.get('input[formcontrolname="email"]').type(email);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/home');

    cy.visit('/user-dashboard/my-tuitions');
    cy.contains('[role="tab"]', 'Active Tuitions').click();
    cy.get('mat-card.active-tuitions-container .profile-card')
      .first()
      .within(() => cy.contains('button', 'View Tuition').click());
    cy.url().should('match', /\/user-dashboard\/tuition-summary\/\d+$/);
    cy.get('mat-card.tuition-summary-container').should('exist');
  });

  it('has a working "Go to Payments" button', () => {
    cy.contains('button', 'Go to Payments')
      .should('have.attr', 'ng-reflect-router-link', '/user-dashboard/payments')
      .click();
    cy.url().should('include', '/user-dashboard/payments');
  });

  it('has a working "Go to Chats" button', () => {
    cy.contains('button', 'Go to Chats')
      .should('have.attr', 'ng-reflect-router-link', '/user-dashboard/chats')
      .click();
    cy.url().should('include', '/user-dashboard/chats');
  });
  it('opens the Leave a Review dialog from the tuition summary page', () => {
    cy.get('.tuition-summary-container')
      .within(() => {
        cy.contains('button', 'Leave a Review')
          .scrollIntoView()
          .click({ force: true });
      });

    cy.get('mat-dialog-container')
      .should('exist')
      .within(() => {
        cy.contains('h2', /^Leave a Review for /).should('exist');

        cy.get('.star-rating mat-icon').should('have.length.at.least', 1);

        cy.contains('mat-label', 'Review Title')
          .closest('mat-form-field')
          .find('input[matInput]')
          .should('exist');

        cy.contains('mat-label', 'Write your review')
          .closest('mat-form-field')
          .find('textarea[matInput]')
          .should('exist');

        cy.contains('button', 'Submit').should('exist');
        cy.contains('button', 'Cancel').should('exist');
      });
  });
});
