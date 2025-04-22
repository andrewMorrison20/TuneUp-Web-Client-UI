describe('Profiles Search: Sidebar Filters', () => {
  beforeEach(() => {
    cy.viewport(1280, 800); // Ensure desktop view
    cy.visit('/profiles/search');
  });

  it('applies filters and does not error out', () => {
    // Instruments
    cy.contains('mat-panel-title', 'Instruments').click({ force: true });
    cy.contains('mat-panel-title', 'Instruments')
      .closest('mat-expansion-panel')
      .within(() => {
        cy.get('mat-checkbox').should('have.length.greaterThan', 0);
        cy.get('mat-checkbox').first().find('input[type="checkbox"]').check({ force: true });

      });

    // Genres
    cy.contains('mat-panel-title', 'Genres').click({ force: true });
    cy.contains('mat-panel-title', 'Genres')
      .closest('mat-expansion-panel')
      .within(() => {
        cy.get('mat-checkbox').should('have.length.greaterThan', 0);
        cy.get('mat-checkbox').first().find('input[type="checkbox"]').check({ force: true });
      });

    // Qualifications
    cy.contains('mat-panel-title', 'Qualification').click({ force: true });
    cy.contains('mat-panel-title', 'Qualification')
      .closest('mat-expansion-panel')
      .within(() => {
        cy.get('mat-checkbox').should('have.length.greaterThan', 0);
        cy.get('mat-checkbox').first().find('input[type="checkbox"]').check({ force: true });

      });

    // Rating
    cy.contains('mat-panel-title', 'Rating').click({ force: true });
    cy.get('.rating-option').contains('> 3 Stars').click({ force: true });

    cy.contains('mat-panel-title', 'Price Range')
      .click({ force: true })
      .closest('mat-expansion-panel')
      .within(() => {
        cy.get('mat-form-field').contains('Min Price')
          .parents('mat-form-field')
          .find('input')
          .should('exist')
          .clear({ force: true })
          .type('999', { force: true });

        cy.get('mat-form-field').contains('Max Price')
          .parents('mat-form-field')
          .find('input')
          .should('exist')
          .clear({ force: true })
          .type('1000', { force: true });
      });



    // Region
    cy.contains('mat-panel-title', 'Tuition Region').click({ force: true });
    cy.get('input[placeholder="Search for a region"]').type('London', { force: true });

    cy.wait(500);
    cy.get('mat-checkbox').first().find('input[type="checkbox"]').check({ force: true });

    // Apply filters
    cy.contains('button', 'Apply Filters').click({ force: true });

    // Assert no crash, results attempt
    cy.url().should('include', '/profiles/search');
    cy.get('mat-spinner').should('not.exist');
  });

  it('shows empty state for filters that return no results', () => {
    // Open Price Range accordion
    cy.contains('mat-panel-title', 'Price Range')
      .click({ force: true })
      .closest('mat-expansion-panel')
      .within(() => {
        cy.get('mat-form-field').contains('Min Price')
          .parents('mat-form-field')
          .find('input')
          .should('exist')
          .clear({ force: true })
          .type('999', { force: true });

        cy.get('mat-form-field').contains('Max Price')
          .parents('mat-form-field')
          .find('input')
          .should('exist')
          .clear({ force: true })
          .type('1000', { force: true });
      });

    // Click Apply Filters
    cy.contains('button', 'Apply Filters').click({ force: true });

    // Assertions
    cy.get('mat-spinner').should('not.exist');
    cy.contains('No profiles found').should('exist');
  });
});
