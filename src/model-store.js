import EventsLog from './events-log'

// takes a domain id
// takes an initial state for the domain
// takes a function which given a store will return an object of functions
export function createDomain(
  initialState,
  functionsCreator,
  dependencies = null
) {
  if (initialState && typeof initialState !== 'object') {
    throw 'initialState must be an object'
  }
  if (functionsCreator && typeof functionsCreator !== 'function') {
    throw 'functionsCreator must be a function'
  }
  if (dependencies && typeof dependencies !== 'object') {
    throw 'dependencies must be an object if provided'
  }
  return {
    initialState: initialState || {},
    functionsCreator: functionsCreator || (() => ({})),
    dependencies: dependencies || {}
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
    addEventListener: events.addListener.bind(events)
  }
}

function buildStore(events, domainKeys, domains) {
  const state = buildState(domainKeys, domains)
  return {
    getState: () => state,
    setState: nextState => {
      const domainKeys = Object.keys(nextState)
      domainKeys.forEach(domainKey => {
        state[domainKey] = {
          ...state[domainKey],
          ...nextState[domainKey]
        }
        events.trackUpdate(domainKey, nextState[domainKey])
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
    const domain = domains[domainKey]
    const domainStore = createDomainStore(domainKey, store)
    const functions = domain.functionsCreator(domainStore, domain.dependencies)

    Object.keys(functions).map(funcKey => {
      const func = functions[funcKey]

      functions[funcKey] = async (...args) => {
        events.trackFunctionStart(domainKey, funcKey, args)
        const nextState = await func(...args)
        events.trackFunctionEnd(domainKey, funcKey, args, nextState)
        if (nextState) {
          store.setState({ [domainKey]: nextState })
        }
      }
    })

    domainFunctions[domainKey] = functions
  })
  return domainFunctions
}

// wraps a domain's store state in get state functionality
function createDomainStore(domainKey, store) {
  return {
    getState: () => store.getState()[domainKey]
  }
}
