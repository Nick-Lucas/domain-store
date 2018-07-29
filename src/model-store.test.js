'use strict'

import { createModel, createDomain } from './model-store'

describe('ModelStore', () => {
  let store, functions, addEventListener

  const setupModel = (initialState = { user: '123', token: 'abcdegf' }) => {
    const model = createModel({
      auth: createDomain(initialState, store => ({
        login: user => {
          store.setState({
            user,
            token: 'qwertyuiop'
          })
        },
        isLoggedIn: () => {
          const { token } = store.getState()
          if (token) {
            return true
          }
          return false
        }
      }))
    })
    store = model.store
    functions = model.functions
    addEventListener = model.addEventListener
  }

  describe('synchronous functions', () => {
    beforeEach(() => {
      setupModel()
    })

    it('does an update in the function', () => {
      functions.auth.login('user_id')
      expect(store.getState().auth).to.deep.equal({
        user: 'user_id',
        token: 'qwertyuiop'
      })
    })

    it('does a getState in the function and returns a value', () => {
      expect(functions.auth.isLoggedIn()).to.equal(true)
    })

    it('tracks an event for a function call with arguments', done => {
      const expectedEvents = [
        {
          type: 'function-end',
          domain: 'auth',
          function: 'login',
          args: ['user_id'],
          result: undefined
        },
        {
          type: 'update',
          domain: 'auth',
          update: { user: 'user_id', token: 'qwertyuiop' },
          result: { user: 'user_id', token: 'qwertyuiop' }
        },
        {
          type: 'function-start',
          domain: 'auth',
          function: 'login',
          args: ['user_id']
        }
      ]
      addEventListener(event => {
        const expectedEvent = expectedEvents.pop()
        expect(event).to.deep.equal(expectedEvent)
        if (!expectedEvents.length) {
          done()
        }
      })
      functions.auth.login('user_id')
    })

    it('tracks an event for a function call with return value', done => {
      const expectedEvents = [
        {
          type: 'function-end',
          domain: 'auth',
          function: 'isLoggedIn',
          args: [],
          result: true
        },
        {
          type: 'function-start',
          domain: 'auth',
          function: 'isLoggedIn',
          args: []
        }
      ]
      addEventListener(event => {
        const expectedEvent = expectedEvents.pop()
        expect(event).to.deep.equal(expectedEvent)
        if (!expectedEvents.length) {
          done()
        }
      })
      functions.auth.isLoggedIn()
    })
  })

  describe('asynchronous functions', () => {})
})
