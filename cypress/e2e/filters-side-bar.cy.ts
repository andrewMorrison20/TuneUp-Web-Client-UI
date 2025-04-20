
describe('Profiles Search: Sidebar Filters', () => {
  beforeEach(() => {
    cy.visit('/profiles/search');
  });

  it('applies filters and shows matching results', () => {
    // Wait for filters to render
    cy.get('mat-expansion-panel').contains('Instruments').click();

    // Select first instrument
    cy.get('mat-expansion-panel')
      .contains('Instruments')
      .parent()
      .find('mat-checkbox')
      .first()
      .click();

    // Select a genre
    cy.get('mat-expansion-panel').contains('Genres').click();
    cy.get('mat-expansion-panel')
      .contains('Genres')
      .parent()
      .find('mat-checkbox')
      .first()
      .click();

    // Select a qualification
    cy.get('mat-expansion-panel').contains('Qualification').click();
    cy.get('mat-expansion-panel')
      .contains('Qualification')
      .parent()
      .find('mat-checkbox')
      .first()
      .click();

    // Select rating
    cy.get('mat-expansion-panel').contains('Rating').click();
    cy.get('.rating-option').contains('> 3 Stars').click();

    // Set price range
    cy.get('mat-expansion-panel').contains('Price Range').click();
    cy.get('input[placeholder="Min Price"]').clear().type('10');
    cy.get('input[placeholder="Max Price"]').clear().type('80');

    // Search for region
    cy.get('mat-expansion-panel').contains('Tuition Region').click();
    cy.get('input[placeholder="Search for a region"]').type('London');

    cy.wait(500); // Give backend time to return suggestions
    cy.get('mat-list-item').first().click();

    // Apply filters
    cy.contains('button', 'Apply Filters').click();

    // Verify results
    cy.url().should('include', '/profiles/search');
    cy.get('app-profile-card').should('have.length.at.least', 1); // confirm result
  });

  it('shows empty state for no matches', () => {
    // Select filters that likely lead to no results
    cy.get('mat-expansion-panel').contains('Price Range').click();
    cy.get('input[placeholder="Min Price"]').clear().type('999');
    cy.get('input[placeholder="Max Price"]').clear().type('1000');

    cy.contains('button', 'Apply Filters').click();

    cy.contains('No profiles found').should('exist');
  });
});
