export default class EventsLog {
  constructor() {
    this.listeners = []
    this.log = []
  }

  addListener(callback) {
    this.listeners.push(callback)
  }

  // TODO: record the diff here along with the new state
  trackUpdate(domain, state) {
    const event = {
      type: 'update',
      domain,
      state
    }
    this.log.push(event)
    this.listeners.forEach(listener => listener(event))
  }

  trackFunctionStart(domain, func, args) {
    const event = {
      type: 'function-start',
      domain,
      function: func,
      args
    }
    this.log.push(event)
    this.listeners.forEach(listener => listener(event))
  }

  trackFunctionEnd(domain, func, args, nextState) {
    const event = {
      type: 'function-end',
      domain,
      function: func,
      args,
      nextState
    }
    this.log.push(event)
    this.listeners.forEach(listener => listener(event))
  }
}
