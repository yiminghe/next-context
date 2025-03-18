describe('index spec', () => {
  it('passes', () => {
    cy.visit('/');
    cy.get('body').contains('url: http://localhost:3000/demo');
    cy.get('body').contains('type: page');
    cy.get('body').contains('url: http://localhost:3000/demo');
    cy.get('body').contains('from: default extra context');
    cy.get('body').contains('server user: test');
    cy.get('body').contains('client user: test');
    cy.wait(500);
    cy.get('#times').then(($) => {
      const data = JSON.parse($.val() as string);
      expect(data.t1).to.equal(data.t2);
      expect(data.t2).to.equal(data.t3);
      expect(data.t3).to.equal(data.t4);
    });
    cy.getCookie('x-user-from-layout').should(
      'have.property',
      'value',
      'yiminghe-from-layout',
    );
  });

  it('action passes', () => {
    cy.visit('/');
    cy.get('[data-cy="action"]').click();
    cy.get('#action').then(($) => {
      const data = JSON.parse($.val() as string);
      expect(data.user).to.equal('test');
      expect(data.type).to.equal('action');
      expect(data.t1).to.equal(data.t2);
      expect(data.t2).to.equal(data.t3);
      expect(data.t3).to.equal(data.t4);
    });
  });
});
