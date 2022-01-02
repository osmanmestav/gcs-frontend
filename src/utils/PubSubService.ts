import { EventEmitter } from 'events';


export enum PubSubEvent {
    AnyAircraftStatusMessageReceived = 'any-aircraft-status-message-received',
    AnyUserStatusMessageReceived = 'any-user-status-message-received',
    ManageAircraftsEvent = 'manage-aircrafts',
    ActiveAircraftPilotageStateChanged = 'active-aircraft-pilotage-state-changed',
  }

const eventEmitter = new EventEmitter();

export function removeEvent(type: PubSubEvent, callback: (...args: any[]) => void) {
  eventEmitter.removeListener(type, callback);
}

export function subscribeEvent(type: PubSubEvent, callback: (...args: any[]) => void) {
  eventEmitter.addListener(type, callback);
}

export function publishEvent(type: PubSubEvent, ...args: any[]) {
  eventEmitter.emit(type, args);
}