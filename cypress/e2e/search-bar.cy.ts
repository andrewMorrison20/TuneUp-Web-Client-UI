describe('Search Bar Flow', () => {
  beforeEach(() => {
    cy.visit('/profiles/search');
  });

  it('performs a filtered search and shows results', () => {
    // Instrument dropdown
    cy.get('mat-select').contains('Instrument').click();
    cy.get('mat-option').contains(/^Piano$/).click();

    // Genre dropdown
    cy.get('mat-select').contains('Genre').click();
    cy.get('mat-option').contains(/^Jazz$/).click();

    // Profile Type dropdown
    cy.get('mat-select').contains('Tutor or Student').click();
    cy.get('mat-option').contains('Tutor').click();

    // Search input
    cy.get('input[placeholder="Search..."]').type('erin');

    // Click Search
    cy.contains('button', 'Search').click();

    // Wait for results and assert at least 1 profile card is shown
    cy.get('mat-spinner').should('not.exist'); // Wait for loading to finish
    cy.get('app-profile-card').should('have.length.at.least', 1);

    // Optional: check the query string updated
    cy.url().should('include', 'erin');
    cy.url().should('include', 'instruments=');
  });

  it('shows no results message for bad query', () => {
    cy.get('input[placeholder="Search..."]').type('gibberishXYZ');
    cy.contains('button', 'Search').click();

    cy.get('mat-spinner').should('not.exist');
    cy.contains('No profiles found').should('exist');
  });
});
