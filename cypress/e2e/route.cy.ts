describe('route spec', () => {
  it('passes', () => {
    const req = cy.request('/get');
    cy.request('/get')
      .its('headers')
      .should('have.property', 'x-from', 'next-compose');
    cy.request('/get').then((response) => {
      const data = response.body;
      expect(data.name).to.equal('zh');
      expect(data.t1).to.equal(data.t2);
      expect(data.t2).to.equal(data.t3);
      expect(data.t3).to.equal(data.t4);
      expect(data.user).to.equal('test');
      expect(data.user2).to.equal('test');
      expect(data.type).to.equal('route');
      expect(data.from).to.equal('route');
    });
    cy.getCookie('x-user-from-route').should(
      'have.property',
      'value',
      'yiminghe-from-route',
    );
  });
});
