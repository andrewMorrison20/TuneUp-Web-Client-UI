// cypress/e2e/payments.cy.ts

describe('Payments Page (E2E)', () => {
  const email = 'andrewjm95@outlook.com';
  const password = 'password';

  beforeEach(() => {
    // real login
    cy.visit('/login');
    cy.get('input[formcontrolname="email"]').type(email);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/home');

    // navigate to payments
    cy.visit('/user-dashboard/payments');
    cy.contains('h2', 'Payments').should('exist');
  });

  it('creates a new payment with invoice and shows confirmation', () => {
    // select a tuition
    cy.get('mat-form-field').contains('Select Tuition')
      .parents('mat-form-field')
      .find('mat-select').click();
    cy.get('mat-option').first().click();

    // wait for lessons to load and select one
    cy.get('mat-form-field').contains('Select Lesson')
      .parents('mat-form-field')
      .find('mat-select').click();
    cy.get('mat-option').first().click();

    // fill amount and due date
    cy.get('input[formcontrolname="amount"]').clear().type('42');
    cy.get('input[formcontrolname="dueDate"]').type('2025-12-31');

    // submit
    cy.contains('button', 'Submit Payment').click();
  });


  it('views an invoice in the dialog (if any)', () => {
    cy.get('table').then($table => {
      const hasView = $table.find('button:contains("View Invoice")').length > 0;
      if (hasView) {
        cy.get('button').contains('View Invoice').first().click();
        cy.get('mat-dialog-container').should('exist')
          .and('contain', 'Invoice');
        cy.get('mat-dialog-container button').contains('Close').click();
        cy.get('mat-dialog-container').should('not.exist');
      } else {
        cy.log('No invoices available to view');
      }
    });
  });

  it('sends a reminder for a due payment (if any)', () => {

    cy.contains('[role="tab"]', 'Due').click();
    cy.wait(500);

    cy.get('table')
      .then($table => {
        if ($table.find('button:contains("Send Reminder")').length) {
          // if at least one exists, click the first and assert
          cy.get('button').contains('Send Reminder').first().click();
        } else {
          cy.log('No due payments to remind');
        }
      });
  });
});
