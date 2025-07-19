function returnFormatter(status, message, data) {
    return { status, message, data };
}

function todayDate() {
    const date = new Date();
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    };
    
    const fDate = date.toLocaleDateString('en-IN', options).replaceAll("/", "-");
    return fDate;
}

function hourConverter(hourString) {
    let [time, period] = hourString.split(" ");
    let [hour, min] = time.split(":");
    if (period === "pm") {
        return hour === "12" ? (parseInt(hour) * 100) + parseInt(min) : ((parseInt(hour) + 12) * 100) + parseInt(min);
    }
    return hour !== "12" ? (parseInt(hour) * 100) + parseInt(min) : ((parseInt(hour) + 12) * 100) + parseInt(min);
}

module.exports = {
    returnFormatter,
    todayDate,
    hourConverter
};
