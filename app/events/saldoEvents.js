import { EventEmitter } from 'events';

/**
 * Event Emitter para notificar mudanças no saldo
 */
class SaldoEventEmitter extends EventEmitter {}

export const saldoEmitter = new SaldoEventEmitter();

/**
 * Eventos disponíveis:
 * - 'saldo-changed': Disparado quando o saldo é alterado
 */
export const SALDO_EVENTS = {
  SALDO_CHANGED: 'saldo-changed',
};
