import EventsLog from './events-log'

describe('EventsLog', () => {
  let events

  beforeEach(() => {
    events = new EventsLog()
  })

  it('should track functions fine with no listeners attached', () => {
    events.trackFunction(
      'TEST_DOMAIN',
      'TEST_FUNC',
      ['args1', 'arg2'],
      'TEST_RESULT'
    )
  })

  it('should track updates fine with no listeners attached', () => {
    events.trackUpdate(
      'TEST_DOMAIN',
      { a: 1, b: 2 },
      { a: 1, b: 2, c: 'hello' }
    )
  })

  it('should track a function in the queue', done => {
    events.addListener(event => {
      expect(event).to.deep.equal({
        type: 'function',
        domain: 'TEST_DOMAIN',
        function: 'TEST_FUNC',
        args: ['args1', 'arg2'],
        result: 'TEST_RESULT'
      })
      done()
    })
    events.trackFunction(
      'TEST_DOMAIN',
      'TEST_FUNC',
      ['args1', 'arg2'],
      'TEST_RESULT'
    )
  })

  it('should track a update in the queue', done => {
    events.addListener(event => {
      expect(event).to.deep.equal({
        type: 'update',
        domain: 'TEST_DOMAIN',
        update: { a: 1, b: 2 },
        result: { a: 1, b: 2, c: 'hello' }
      })
      done()
    })
    events.trackUpdate(
      'TEST_DOMAIN',
      { a: 1, b: 2 },
      { a: 1, b: 2, c: 'hello' }
    )
  })
})
