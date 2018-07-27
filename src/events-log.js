export default class EventsLog {
  constructor() {
    this.listeners = []
    this.log = []
  }

  addListener(callback) {
    this.listeners.push(callback)
  }

  trackUpdate(domain, update, result) {
    const event = {
      type: 'update',
      domain,
      update,
      result
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

  trackFunctionEnd(domain, func, args, result) {
    const event = {
      type: 'function-end',
      domain,
      function: func,
      args,
      result
    }
    this.log.push(event)
    this.listeners.forEach(listener => listener(event))
  }
}
