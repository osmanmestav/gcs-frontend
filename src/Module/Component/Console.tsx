import React, {useState, useEffect} from 'react';
import ListGroup from 'react-bootstrap/ListGroup'

function SidebarConsole(props: any) {

    let ConsoleArray: any[];
    const [ConsoleLog, setConsoleLog] = useState([]);

    useEffect(() => {
        // @ts-ignore
        props.mapWindow.addEventListener("FlightSummaryAdd", ({detail: detail}) => {
            var date = new Date();
            var hours = date.getHours();
            var minutes: string | number = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;

            ConsoleArray = [];
            ConsoleArray.push({
                history: strTime,
                msg: detail.msg,
                category: detail.category,
            })
            // @ts-ignore
            setConsoleLog([...ConsoleLog, ...ConsoleArray]);
        });

    });
    return (
        <div
            style={{height: '350px', minHeight: '350px', backgroundColor: '#000', padding: '10px', overflow: 'scroll'}}>
            <ListGroup>
                {ConsoleLog.map(({category, history, msg}, index) =>
                    <ListGroup.Item key={index} style={{backgroundColor: '#000'}} as="li" action>
                        <b style={{color: '#fff'}}>{history}:</b>
                        <span
                            style={{color: (category == 'Error' ? 'rgb(219 0 0)' : (category == 'Warning' ? '#ffc107' : '#fff'))}}> {msg}</span>
                    </ListGroup.Item>
                )}
            </ListGroup>
        </div>
    );
}


export default SidebarConsole;
