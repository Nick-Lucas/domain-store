'use strict'

import sinon from 'sinon'
import { createModel, createDomain } from './model-store'

describe('ModelStore', () => {
  let store, functions, addEventListener

  const setupModel = () => {
    const model = createModel({
      auth: createDomain({ user: '123', token: 'abcdegf' }, store => ({
        login: user => {
          return {
            user,
            token: 'qwertyuiop'
          }
        },
        pingServer: () => {
          return
        }
      }))
    })
    store = model.store
    functions = model.functions
    addEventListener = model.addEventListener
  }

  const setupAsyncModel = () => {
    const model = createModel({
      auth: createDomain({ user: '123', token: 'abcdegf' }, store => ({
        login: async user => {
          return await Promise.resolve({
            user,
            token: 'qwertyuiop'
          })
        },
        pingServer: async () => {
          await Promise.resolve()
        }
      }))
    })
    store = model.store
    functions = model.functions
    addEventListener = model.addEventListener
  }

  const setupCustomModel = (key, domain) => {
    const model = createModel({
      [key]: domain
    })
    store = model.store
    functions = model.functions
    addEventListener = model.addEventListener
  }

  const setupModelWithDeps = dependencies => {
    const model = createModel({
      auth: createDomain(
        { user: '123', token: 'abcdegf' },
        (store, deps) => ({
          login: user => {
            const { doSomeWork } = deps
            return {
              user,
              token: doSomeWork(user)
            }
          }
        }),
        dependencies
      )
    })
    store = model.store
    functions = model.functions
    addEventListener = model.addEventListener
  }

  describe('functions', () => {
    const types = [
      { name: 'synchronous functions', setup: setupModel },
      { name: 'asynchronous functions', setup: setupModel }
    ]

    types.forEach(({ name, setup }) => {
      describe(name, () => {
        beforeEach(() => {
          setup()
        })

        it('updates the store', async () => {
          await functions.auth.login('user_id')
          expect(store.getState().auth).to.deep.equal({
            user: 'user_id',
            token: 'qwertyuiop'
          })
        })

        it('returns no new state', async () => {
          await functions.auth.pingServer()
          expect(store.getState().auth).to.deep.equal({
            user: '123',
            token: 'abcdegf'
          })
        })

        it('tracks an event for a function call with arguments', async () => {
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
          return new Promise(async resolve => {
            addEventListener(event => {
              const expectedEvent = expectedEvents.pop()
              expect(event).to.deep.equal(expectedEvent)
              if (!expectedEvents.length) {
                resolve()
              }
            })
            await functions.auth.login('user_id')
          })
        })
      })
    })
  })

  describe('function dependency injection', () => {
    it('successfully calls the dependency', async () => {
      const dependency = sinon.fake(() => 123)
      setupModelWithDeps({
        doSomeWork: dependency
      })

      await functions.auth.login('abc')
      expect(dependency.calledWithExactly('abc')).to.be.true
    })
  })

  describe('edge cases', () => {
    describe('no functions provided', () => {
      beforeEach(() => {
        setupCustomModel('main', createDomain({ value: 1 }))
      })

      it('gets state', () => {
        expect(store.getState().main.value).to.equal(1)
      })

      it('sets state', () => {
        store.setState({ main: { value: 2 } })
        expect(store.getState().main.value).to.equal(2)
      })

      it('gets functions', () => {
        expect(functions.main).to.deep.equal({})
      })
    })

    describe('no state provided', () => {
      beforeEach(() => {
        setupCustomModel(
          'main',
          createDomain(null, store => ({ create: () => ({ value: 1 }) }))
        )
      })

      it('gets state', () => {
        expect(store.getState().main).to.deep.equal({})
      })

      it('sets state', () => {
        store.setState({ main: { value: 2 } })
        expect(store.getState().main.value).to.equal(2)
      })

      it('set state from function', async () => {
        await functions.main.create()
        expect(store.getState().main.value).to.equal(1)
      })
    })
  })
})
