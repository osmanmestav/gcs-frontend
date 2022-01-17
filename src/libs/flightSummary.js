const SummaryEntryType = {
    Message: "Message",
    Warning: "Warning",
    Error: "Error"
};

var FlightSummary = {
    addToSummary(/*SummaryEntryType*/category, msg, name) {
        console.log(category + ": " + msg);
        window.dispatchEvent(new CustomEvent("FlightSummaryAdd", {"detail": {"category": category, "msg": msg, "name": name}}));
    }
};
