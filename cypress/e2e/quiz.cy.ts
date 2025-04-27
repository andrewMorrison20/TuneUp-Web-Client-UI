describe('Quiz Flow: From start to search results (E2E)', () => {
  it('completes quiz and shows real top matches from the backend', () => {
    cy.visit('/quiz');

    cy.contains('Are you looking for student or Tutors?').should('be.visible');
    cy.get('mat-radio-button').contains('Tutor').click();
    cy.contains('button', 'Next').click({ force: true });

    cy.contains('Do you want online lessons?').should('be.visible');
    cy.get('mat-radio-button').contains('Online only').click();
    cy.contains('button', 'Next').click({ force: true });

    cy.contains('Which Instruments do you play or have an interest in?').should('be.visible');
    cy.contains('button', 'Next').click({ force: true });


    cy.contains('Which styles or genres do you like?').should('be.visible');
    cy.get('mat-checkbox').first().click({ force: true });
    cy.contains('button', 'Next').click({ force: true });


    cy.contains('Are you interested in Qualifications and grades?').should('be.visible');
    cy.get('mat-checkbox').first().click({ force: true });
    cy.contains('button', 'Next').click({ force: true });

    cy.contains('button', 'Next').click({ force: true });

    cy.contains('button', 'Next').click({ force: true });

    cy.contains('Review your choices before searching for tutors.').should('be.visible');
    cy.contains('button', 'Search Matching Profiles').click();

    cy.get('mat-spinner', { timeout: 10000 }).should('not.exist');

    cy.contains('Your Top Matches', { timeout: 10000 }).should('be.visible');
    cy.get('app-profile-card').should('have.length.at.least', 1);
  });
});
