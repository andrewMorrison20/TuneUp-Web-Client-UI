describe('Quiz Flow: From start to search results (E2E)', () => {
  it('completes quiz and shows real top matches from the backend', () => {
    // Visit quiz page
    cy.visit('/quiz');

    // Step 0: Profile Type
    cy.contains('Are you looking for student or Tutors?');
    cy.get('mat-radio-button').contains('Tutor').click();
    cy.contains('button', 'Next').click();

    // Step 1: Lesson Type
    cy.contains('Do you want online lessons?');
    cy.get('mat-radio-button').contains('Online only').click();
    cy.contains('button', 'Next').click();

    // Step 2: Instruments
    cy.contains('Which Instruments do you play or have an interest in?');
    cy.get('mat-checkbox').first().click(); // select one instrument
    cy.contains('button', 'Next').click();

    // Step 3: Genres
    cy.contains('Which styles or genres do you like?');
    cy.get('mat-checkbox').first().click(); // select one genre
    cy.contains('button', 'Next').click();

    // Step 4: Qualifications
    cy.contains('Are you interested in Qualifications and grades?');
    cy.get('mat-checkbox').first().click();
    cy.contains('button', 'Next').click();

    // Step 5: Price Range
    cy.get('input[formcontrolname="minPrice"]').clear().type('10');
    cy.get('input[formcontrolname="maxPrice"]').clear().type('60');
    cy.contains('button', 'Next').click();

    // Step 6: Region
    cy.get('input[formcontrolname="regionSearch"]').type('London');
    cy.wait(1000); // allow time for region suggestions
    cy.get('mat-list-item').first().click();
    cy.contains('button', 'Next').click();

    // Final Step: Review + Submit
    cy.contains('Review your choices before searching for tutors.');
    cy.contains('button', 'Search Matching Profiles').click();

    // Assert: Results section exists with at least one profile
    cy.contains('Your Top Matches').should('exist');
    cy.get('app-profile-card').should('have.length.at.least', 1);
  });
});
