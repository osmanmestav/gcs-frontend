import React, {useState, useEffect} from 'react';
import ListGroup from 'react-bootstrap/ListGroup'

function SidebarConsole() {

    let ConsoleArray = [];
    const [ConsoleLog, setConsoleLog] = useState([]);

    useEffect(() => {
        document.getElementById('gcsMap').contentWindow.addEventListener("FlightSummaryAdd", (e) => {
            console.log(e.detail);
            var date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            ConsoleArray.splice();
            ConsoleArray.push({
                history: strTime,
                msg: e.detail.msg,
                category: e.detail.category,
            })
            setConsoleLog([...ConsoleLog, ...ConsoleArray]);
        });

    });
    return (
        <div
            style={{height: '350px', minHeight: '350px', backgroundColor: '#000', padding: '10px', overflow: 'scroll'}}>
            <ListGroup>
                {ConsoleLog.map((data, index) =>
                    <ListGroup.Item key={index} style={{backgroundColor: '#000'}} as="li" action>
                        <b style={{color: '#fff'}}>{data.history}:</b>
                        <span
                            style={{color: (data.category == 'Error' ? 'rgb(219 0 0)' : (data.category == 'Warning' ? '#ffc107' : '#fff'))}}> {data.msg}</span>
                    </ListGroup.Item>
                )}
            </ListGroup>

        </div>
    );
}


export default SidebarConsole;
