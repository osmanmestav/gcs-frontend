import React, {useState, useEffect} from 'react';
import ListGroup from 'react-bootstrap/ListGroup'
import {SummaryLog, SummaryLogType} from '../../models/helperModels/summaryLog';
import {PubSubEvent, removeEvent, subscribeEvent} from '../../utils/PubSubService';

function SidebarConsole() {
    const [ConsoleLog, setConsoleLog] = useState<SummaryLog[]>([]);
    const insertSummaryLog = (input: SummaryLog[]) => {
        setConsoleLog(prevState => {
            return input.concat(prevState);
        });
    };

    useEffect(() => {
        subscribeEvent(PubSubEvent.InsertSummaryLog, insertSummaryLog)
        return () => {
            removeEvent(PubSubEvent.InsertSummaryLog, insertSummaryLog);
        }
    }, []);

    return (
        <div
            style={{
                height: '350px',
                minHeight: '350px',
                backgroundColor: '#000',
                padding: '10px',
                overflow: 'scroll',
                position: 'absolute',
                bottom: '2px',
                right: '0px',
                width: '100%',
                maxWidth: '650px'
            }}>
            <ListGroup>
                {ConsoleLog.map((log, index) =>
                    <ListGroup.Item key={index} style={{backgroundColor: '#000'}} as="li" action>
                        <b style={{color: '#fff'}}>{log.time}: </b>
                        <span
                            style={{color: (log.category === SummaryLogType.Error ? 'rgb(219 0 0)' : (log.category === SummaryLogType.Warning ? '#ffc107' : '#fff'))}}>
                            {log.msg}
                        </span>
                    </ListGroup.Item>
                )}
            </ListGroup>
        </div>
    );
}


export default SidebarConsole;
