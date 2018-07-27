'use strict'

import { createModel, createDomain, createFunction } from './model-store'

describe('ModelStore', () => {
  let store, functions, addEventListener

  const setupModel = (initialState = { user: '123', token: 'abcdegf' }) => {
    const model = createModel({
      auth: createDomain('auth', initialState, store => ({
        login: createFunction('login', user => {
          store.setState({
            auth: {
              user,
              token: 'qwertyuiop'
            }
          })
        }),
        isLoggedIn: createFunction('isLoggedIn', () => {
          const { token } = store.getState().auth
          if (token) {
            return true
          }
          return false
        })
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
          type: 'function',
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
      addEventListener(event => {
        expect(event).to.deep.equal({
          type: 'function',
          domain: 'auth',
          function: 'isLoggedIn',
          args: [],
          result: true
        })
        done()
      })
      functions.auth.isLoggedIn()
    })
  })

  describe('asynchronous functions', () => {})
})
