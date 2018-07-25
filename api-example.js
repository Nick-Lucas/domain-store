// Redux is great but it has many problems:
// * dispatching actions only helps if it's committed to 100%, (time-travel, debugging actions list)
//    but many developers disagree with decoupling their code so much, 
//    and it's hard to explain the real benefits
// * action creators and actions and action-type constants and reducers and thunks and epics... it's complicated
// * actions are meant to be like events, but with middlewares they start to become "come-from" statements 
//    where anything can do work at any time and debugging becomes difficult
// * as applications grow the number of reducers and middlewares starts to be a performance drag
// * debugging can be hard as stacktraces don't link back to their originating component or function call
// * side effects require middlewares, which often add extra APIs to remember

// model-store aims to resolve these issues by treating data like enterprise applications have been for years
// * data is retrieved as a domain model, with both data and functions attached
// * this means that both data and 'actions' are still injected into components, which results in great testability
// * this also means less cognitive overhead understanding a 'dispatch pipeline' as everything is just plain javascript
// * this resolves performance issues by binding functionality directly to POJOs
// * we can still produce an actions list, as we know the names and domains of functions
//    and their data, and model-store wraps them internally
// * the API familiar as it's based on Redux's best bits, but aims to solve painpoints

// An example of the react connection function
// 1: map the current state of the application as a POJO
// 2: map domain functions, and let construct clojure functions with state
connect(
  state => ({
    userId: state.auth.userId
  }), 
  (state, funcs) => ({
    logout: () => funcs.auth.logout(state.auth.authToken)
  })
)(LogoutComponent)

// An example of model-store in use with a React component
const LogoutComponent = ({ userId, logout }) => {
  return (
    <div>
      <div>
        Signed in as {userId}
      </div>
      <MyButton onClick={logout}>
        Logout
      </MyButton>
    </div>
  )
}

// An example of configuring the store
const domains = {
  auth: configureDomain(
    // Initial state
    {
      userId: '',
      authToken: ''
    },

    // a function to create functions
    createAuthFunctions
  )
}
const store = configureStore(domains)

// * Functions are provided as standard JS functions, with a paired error handler
//    and are wrapped by model-store to provide failure safety and access to the store.
// * setState calls are tracked in the actions timeline, as well as calls to these functions,
//    and follow functional principles of immutability
// * the store given is always the entire store, since we don't want to artificially 
//    create pain running cross-domain functions
// * setState returns a promise meaning it will propagate immediately, and 
//    your functions can update the UI during their process
const createAuthFunctions = (store) => ({
  logout: createFunction(

    // Main function body
    async () => {
      await store.setState({ auth: { status: 'logout_in_progress' } })

      const authToken = store.getState().authToken
  
      const response = logoutApiCall(authToken)
      if (response.code !== 200) {
        throw "Non-200 Status: " + response.status
      }
  
      await store.setState({ 
        auth: { 
          status: 'logout_success', 
          authToken: '' 
        } 
      })
    },

    // Error handler
    async e => {
      await store.setState({ auth: { status: 'logout_failure' } })
    }

  )
})
