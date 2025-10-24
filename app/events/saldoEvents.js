/**
 * Event Emitter simples para notificar mudanças no saldo
 * Compatível com React Native (não usa Node.js events)
 */
class SaldoEventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }

  removeAllListeners(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

export const saldoEmitter = new SaldoEventEmitter();

/**
 * Eventos disponíveis:
 * - 'saldo-changed': Disparado quando o saldo é alterado
 */
export const SALDO_EVENTS = {
  SALDO_CHANGED: 'saldo-changed',
};
