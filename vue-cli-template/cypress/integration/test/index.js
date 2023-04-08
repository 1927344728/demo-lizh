describe('端到端测试：示例', () => {
  before(() => console.log('开始：'));
  beforeEach(() => cy.visit('https://example.cypress.io/todo'));

  it('标题文案：todos', () => {
    cy.get('.todoapp .header h1').should('have.text', 'todos')
  })

  it('有两个li节点', () => {
    cy.get('.todo-list li').should('have.length', 2)
  })

  it('输入文案：lizhao', () => {
    cy.get('.todoapp .header input').type('lizhao')
    cy.get('.todoapp .header input').should('have.value', 'lizhao')
  })

  it('比较', () => {
    expect(2 + 2).to.equal(4)
  })
});