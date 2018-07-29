'use strict'

import { createModel, createDomain } from './model-store'

describe('ModelStore', () => {
  let store, functions, addEventListener

  const setupModel = (initialState = { user: '123', token: 'abcdegf' }) => {
    const model = createModel({
      auth: createDomain(initialState, store => ({
        login: user => {
          return {
            user,
            token: 'qwertyuiop'
          }
        },
        logout: () => {
          const state = store.getState()
          if (state.token) {
            return {
              ...state,
              token: ''
            }
          }
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

    it('updates the store', () => {
      functions.auth.login('user_id')
      expect(store.getState().auth).to.deep.equal({
        user: 'user_id',
        token: 'qwertyuiop'
      })
    })

    it('tracks an event for a function call with arguments', done => {
      const expectedEvents = [
        {
          type: 'update',
          domain: 'auth',
          state: { user: 'user_id', token: 'qwertyuiop' }
        },
        {
          type: 'function-end',
          domain: 'auth',
          function: 'login',
          args: ['user_id'],
          nextState: { user: 'user_id', token: 'qwertyuiop' }
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
  })

  describe('asynchronous functions', () => {})
})
