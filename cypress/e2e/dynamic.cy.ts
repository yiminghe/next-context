describe('dynamic spec', () => {
  it('passes', () => {
    cy.visit('/dynamic');
    cy.get('body').contains('url: http://localhost:3000/demo/dynamic');
    cy.get('body').contains('type: page');
    cy.get('body').contains('from: dynamic');
    cy.get('body').contains('get server user from');
    cy.get('body').contains('of user: test');
    cy.wait(500);
    cy.getCookie('x-user-from-page').should(
      'have.property',
      'value',
      'yiminghe-from-page',
    );
  });
});
