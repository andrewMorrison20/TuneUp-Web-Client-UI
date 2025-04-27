describe('Search Bar Flow', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.intercept('GET', '**/api/instruments').as('getInstruments');
    cy.intercept('GET', '**/api/genres').as('getGenres');
    cy.visit('/profiles/search');
    cy.wait('@getInstruments');
    cy.wait('@getGenres');
  });

  it('performs a filtered search and shows results', () => {
    cy.get('[data-cy="search-bar"]').within(() => {
      // Open Instrument dropdown
      cy.get('mat-form-field').contains('Instrument')
        .parents('mat-form-field')
        .find('mat-select')
        .click({ force: true });
    });

    // mat-option rendered outside, must select globally
    cy.get('mat-option').contains('Guitar').click({ force: true });

    cy.get('[data-cy="search-bar"]').within(() => {
      // Genre dropdown
      cy.get('mat-form-field').contains('Genre')
        .parents('mat-form-field')
        .find('mat-select')
        .click({ force: true });
    });
    cy.get('mat-option').contains('Rock').click({ force: true });

    cy.get('[data-cy="search-bar"]').within(() => {
      // Profile Type dropdown
      cy.get('mat-form-field').contains('Tutor or Student')
        .parents('mat-form-field')
        .find('mat-select')
        .click({ force: true });
    });
    cy.get('mat-option').contains('Tutor').click({ force: true });

    cy.get('[data-cy="search-bar"]').within(() => {
      // Search input
      cy.get('input[placeholder="Search..."]').type('Andrew');

      // Click Search
      cy.contains('button', 'Search').click({ force: true });
    });

    // Final assertions
    cy.get('mat-spinner').should('not.exist');
    cy.get('app-profile-card').should('have.length.at.least', 1);
  });

  it('shows no results message for bad query', () => {
    cy.get('[data-cy="search-bar"]').within(() => {
      cy.get('input[placeholder="Search..."]').type('gibberishXYZ');
      cy.contains('button', 'Search').click({ force: true });
    });

    cy.get('mat-spinner').should('not.exist');
    cy.contains('No profiles found').should('exist');
  });
});

