import ModelStore from '../../src/model-store'

describe('ModelStore', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(ModelStore, 'greet')
      ModelStore.greet()
    })

    it('should have been run once', () => {
      expect(ModelStore.greet).to.have.been.calledOnce
    })

    it('should have always returned hello', () => {
      expect(ModelStore.greet).to.have.always.returned('hello')
    })
  })
})
