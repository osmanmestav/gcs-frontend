import "./libs/types"

const SPcolumns = [
    "roll", "pitch", "yaw", "rollRate", "pitchRate", "yawRate", "altitude", "climbRate",
    "trueAirspeed", "indicatedAirspeed", "bearing"
];

const ENUMColumns = {
    "ConnectionStatus": ["linkStatus", "upLinkStatus", "downLinkStatus"],
    "Command": ["currentCommand"]
};

function preprocessTelemetry(packet) {
    let values = {...packet};

    // Adapt column names
    if (typeof(values.airspeedError)!="undefined")
        values["trueAirspeedError"] = values["indicatedAirspeedError"] = values.airspeedError;
    if (typeof(values.groundCourse)!="undefined")
        values.bearing = values.groundCourse;

    // Create SP columns
    SPcolumns.forEach(c=>{
        if (typeof(values[c])!="undefined")
            values[c+"SP"] = values[c]+values[c+"Error"];
    });

    // Substitude enum names
    Object.entries(ENUMColumns).forEach(e=> {
        let en = eval(e[0]);
        e[1].forEach(c=>values[c]=en[values[c]]);
    });

    return values;
}

export { preprocessTelemetry }