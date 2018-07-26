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

  trackFunction(domain, func, args, result) {
    const event = {
      type: 'function',
      domain,
      function: func,
      args,
      result
    }
    this.log.push(event)
    this.listeners.forEach(listener => listener(event))
  }
}
