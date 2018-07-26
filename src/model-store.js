import EventsLog from './events-log'

// takes an initial state for the domain
// takes a function which given a store will return
export function createDomain(initialState, functionsCreator) {
  return {
    initialState,
    functionsCreator
  }
}

// takes a object where each key contains the result of configureDomain
// returns a model containing a store and its functions
export function createModel(domains) {
  const events = new EventsLog()

  const domainKeys = Object.keys(domains)
  const store = buildStore(events, domainKeys, domains)
  const functions = buildFunctions(events, store, domainKeys, domains)

  return {
    store,
    functions,
    addEventListener: events.addListener
  }
}

function buildStore(events, domainKeys, domains) {
  const state = buildState(domainKeys, domains)
  return {
    getState: () => state,
    setState: updates => {
      const domainKeys = Object.keys(updates)
      domainKeys.forEach(domainKey => {
        state[domainKey] = {
          ...state[domainKey],
          ...updates[domainKey]
        }
        events.trackUpdate(domainKey, updates[domainKey], state[domainKey])
      })
    }
  }
}

const buildState = (domainKeys, domains) =>
  domainKeys.reduce((store, key) => {
    store[key] = domains[key].initialState
    return store
  }, {})

function buildFunctions(events, store, domainKeys, domains) {
  const domainFunctions = {}
  domainKeys.forEach(domainKey => {
    const functions = domains[domainKey].functionsCreator(store)
    Object.keys(functions).map(funcKey => {
      const func = functions[funcKey]
      functions[funcKey] = (...args) => {
        const result = func(...args)
        events.trackFunction(domainKey, funcKey, { ...args }, result)
        return result
      }
    })
    domainFunctions[domainKey] = functions
  })
  return domainFunctions
}