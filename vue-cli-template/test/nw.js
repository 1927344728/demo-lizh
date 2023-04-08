describe('Ecosia', function() {
  it('demo test', function(browser) {
    browser
      .url('https://www.ecosia.org/')
      .setValue('input[type=search]', 'nightwatch')
      .click('button[type=submit]')
      .assert.containsText('.mainline-results', 'Nightwatch.js');
  });

  it('比较', () => {
    expect(2 + 2).to.equal(4)
  })
});