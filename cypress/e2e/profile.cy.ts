describe('Profile Detail Page (E2E)', () => {
  const email = 'erin@example.com';
  const password = 'password';
  const profileId = 2;

  beforeEach(() => {
    // Log in as a valid user
    cy.visit('/login');
    cy.get('input[formcontrolname="email"]').type(email);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/home');

    cy.visit(`/profiles/${profileId}`);
    cy.contains('Availability').should('exist');
  });

  it('loads the profile and shows main sections', () => {
    cy.get('.profile-header').should('exist');
    cy.contains('Availability').should('exist');
    cy.contains('Reviews').should('exist');
    cy.contains('Genres').should('exist');
    cy.contains('Instruments').should('exist');
    cy.contains('Qualifications').should('exist');
  });

  it('opens a modal when clicking an available calendar slot', () => {
    cy.get('full-calendar').should('exist');
    cy.get('.fc-event').first().click({ force: true });

    cy.get('.cdk-overlay-container')
      .should('exist')
      .within(() => {
        cy.contains('Request Lesson').should('exist');
        cy.contains('Select Time Slot').should('exist');
      });
  });


  it('opens booking dialog and submits lesson request', () => {

    cy.get('full-calendar').should('exist');
    cy.get('.fc-event').first().click({ force: true });

    // Wait for the dialog to appear
    cy.get('.cdk-overlay-container').should('exist');

    cy.get('.cdk-overlay-container').within(() => {
      cy.get('mat-form-field').contains('Select Time Slot')
        .parents('mat-form-field')
        .find('mat-select')
        .click({ force: true });

      cy.get('mat-option').first().click({ force: true });

      cy.get('mat-form-field').contains('Select Lesson Type')
        .parents('mat-form-field')
        .find('mat-select')
        .click({ force: true });

      cy.get('mat-option').first().click({ force: true });

      cy.contains('button', 'Request Lesson').click({ force: true });
    });

    cy.get('.mat-dialog-container').should('not.exist');

  });

  it('switches calendar to daily view on mobile', () => {
    cy.viewport('iphone-x');

    cy.visit('/profiles/2');

    cy.get('full-calendar').should('exist');

    cy.get('.fc-timeGridDay-view').should('exist');
  });

  it('starts a chat when clicking the chat button', () => {

    cy.get('button.chat-button')
      .should('be.visible')
      .and('be.enabled')
      .click({ force: true });

    cy.get('mat-dialog-container').should('exist');
  });

  it('sends a chat message and displays it via WS', () => {

    cy.get('button.chat-button')
      .should('be.visible')
      .click({ force: true });

    cy.get('mat-dialog-container').should('exist');

    cy.get('mat-dialog-container').within(() => {
      cy.get('input[placeholder="Type a message..."]')
        .type('Hello world');
      cy.contains('button', 'Send')
        .click({ force: true });
    });

    cy.contains('.message-body', 'Hello world', { timeout: 10_000 })
      .scrollIntoView()
      .should('be.visible');

    cy.contains('.message-body', 'Hello world', { timeout: 10_000 })
       .should('exist');
  });

});
