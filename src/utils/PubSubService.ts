import { EventEmitter } from 'events';


export enum PubSubEvent {
    StatusMessageReceivedOnAircraftManagement = 'status-message-receieved-aircraft-management',
    ManageAircrafts = 'manage-aircrafts',
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