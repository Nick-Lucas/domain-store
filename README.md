
[![npm](https://img.shields.io/npm/v/domain-store.svg)](https://www.npmjs.com/package/domain-store)

# domain-store

An experimental Flux style store with native side-effects and a plain javascript API

### Installation

    yarn add domain-store
    
    or
    
    npm install --save domain-store

### Thought Process

**redux** is great but it has many problems:
* Some of its big advantages (time-travel, actions timeline) only work when it's committed to 100%
* Many developers disagree with the number of files (actions, constants, reducers, thunks/sagas/epics) required to do simple tasks, and it's hard to explain the real benefits
* Actions are meant to be like events, but with middlewares they start to become ["come-from"](https://en.wikipedia.org/wiki/COMEFROM) statements where anything can do work at any time and debugging becomes a difficult untangling task
* As applications grow the number of reducers and middlewares starts to be a performance drag
* Actions are by their nature fire and forget, which forces you to use the Flux cycle for even very simple tasks ("has my action finished yet?")
* Debugging can be hard as stacktraces don't link back to their originating component or function call, particularly once side-effect middlewares become involved
* Side effects require middlewares, which adds extra complexity to manage

**domain-store** aims to resolve these issues by treating data like enterprise applications have been for years
* Data is treated as a domain model, with both data and functions attached
* Both data and actions are still injected into components, which results in great testability and decoupling
* Less cognitive overhead understanding a 'dispatch pipeline' as 'actions' are just functions which are wrapped by the model
* Greater performance as functionality is always a direct function call which updates the store
* All functions are asynchronous, and so don't block up the UI, but the UI can tell when they've finished
* We can still produce an actions log, as we know the names and domains of functions and their data, and domain-store wraps them internally
* Very small API surface area
* Stacktraces always link back to the original caller

### The API

```js
import { createModel, createDomain } from "domain-store"

// a model is the root store
// it has many domains, provided as an object
const model = createModel({
  counter: createDomain(
    
    // initial state for the domain
    { count: 0 }, 

    // A factory function which provides store access to domain functions.
    // Functions can get the current state for their domain and 
    // then return a new state, much like a reducer, but with support for side-effects.
    // Async/Promises are supported, and all functions become asyncronous
    (store, deps) => ({
      increment: async () => {
        await deps.doSomeAsyncWork()
        const { count } = store.getState()
        return { count: count + 1 }
      },
      decrement: () => {
        const { count } = store.getState()
        return { count: count - 1 }
      },
    }),

    // You might also want to inject dependencies into your functions.
    // If you provide a dependencies object then you will simply be  
    // passed it as a second argument in the functions creator.
    // This is fantastic for decoupling your functions from 3rd party 
    // libraries which you want to easily mock, and saves the need for stubbing
    {
      doSomeAsyncWork: async () =>  await Promise.resolve('ok')
    }
  )
})

// model now contains:
// model.store { getState(), setState() }
// model.functions { counter: { async increment(), async decrement() } }
// model.addEventListener(callback)
```

This is just the core package, and the API is designed to allow for framework-specific bindings, just like redux provides.

For instance [react-domain-store](https://github.com/Nick-Lucas/react-domain-store) is already available