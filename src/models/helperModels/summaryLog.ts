import { publishEvent, PubSubEvent } from "../../utils/PubSubService";

export enum SummaryLogType {
    Message = "Message",
    Warning = "Warning",
    Error = "Error"
};

export type SummaryLog = {
    aircraftName: string;
    time: string;
    msg: string;
    category: SummaryLogType;
}

export const createSummaryLog = (msg: string, category: SummaryLogType, name: string) => {
    var date = new Date();
    var hours = date.getHours();
    var minutes: string | number = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    return {
        aircraftName: name,
        time: strTime,
        msg: msg,
        category: category
    } as SummaryLog;
}

export const publishSummaryLog = (msg: string, category: SummaryLogType, aircraftName: string = "unknown") => {
    if(aircraftName === null)
        aircraftName = "unknown";
    const log = createSummaryLog(msg, category, aircraftName);
    publishEvent(PubSubEvent.InsertSummaryLog, log);
}