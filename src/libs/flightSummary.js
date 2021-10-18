const SummaryEntryType = {
    Message: "Message",
    Warning: "Warning",
    Error: "Error"
};

var FlightSummary = {
    addToSummary(/*SummaryEntryType*/category, msg) {
        console.log(category + ": " + msg);
        window.dispatchEvent(new CustomEvent("FlightSummaryAdd", {"detail": {"category": category, "msg": msg}}));
    }
};
