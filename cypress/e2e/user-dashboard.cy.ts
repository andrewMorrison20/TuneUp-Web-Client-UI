
describe('User Dashboard access control & routing', () => {
  const email = 'tuneup.ad.confirm@gmail.com';
  const password = 'password';

  it('redirects to /login if I am not authenticated', () => {

    cy.visit('/user-dashboard');

    cy.url().should('include', '/login');
  });

  context('when I log in for real', () => {
    beforeEach(() => {


      cy.visit('/login');
      cy.get('input[formcontrolname="email"]').type(email);
      cy.get('input[formcontrolname="password"]').type(password);
      cy.get('[data-cy="login-button"]').click();

      cy.url().should('include', '/home');
    });

    it('toggles the sidebar open/closed on mobile', () => {
      cy.viewport('iphone-6');
      cy.visit('/user-dashboard');

      cy.get('[aria-label="Toggle navigation"]').should('be.visible');
      cy.get('mat-nav-list').should('not.be.visible');
      cy.get('[aria-label="Toggle navigation"]').click();
      cy.get('mat-nav-list').should('be.visible');

      cy.contains('My Tuitions').click();
      cy.url().should('include', '/user-dashboard/my-tuitions');

      cy.get('mat-sidenav-content').click('topRight', { force: true });

    });


    it('lands me on /user-dashboard/my-tuitions by default', () => {
      cy.visit('/user-dashboard');

      cy.url().should('include', '/user-dashboard/my-tuitions');

      cy.contains('Active Tuitions').should('be.visible');
    });

    it('lets me go straight to the payments tab', () => {
      cy.visit('/user-dashboard/payments');

      cy.url().should('include', '/user-dashboard/payments');
      cy.contains('Payments').should('be.visible');
    });

    it('lets me go straight to the update profile tab', () => {
      cy.visit('/user-dashboard/update-profile');

      cy.url().should('include', '/user-dashboard/update-profile');
      cy.contains('Update').should('be.visible');
    });

    it('lets me go straight to the schedule tab', () => {
      cy.visit('/user-dashboard/schedule');

      cy.url().should('include', '/user-dashboard/schedule');
      cy.contains('Schedule').should('be.visible');
    });

    it('lets me go straight to the chats tab', () => {
      cy.visit('/user-dashboard/chats');

      cy.url().should('include', '/user-dashboard/chats');
      cy.contains('All Conversations').should('be.visible');
    });

    it('lets me go straight to the settings tab', () => {
      cy.visit('/user-dashboard/settings');

      cy.url().should('include', '/user-dashboard/settings');
      cy.contains('Account').should('be.visible');
    });
  });
});
