export const returnFormatter = (status, message, data) => ({ status, message, data });

export const todayDate = () => {
    const date = new Date();
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    };
    
    return date.toLocaleDateString('en-IN', options).replaceAll("/", "-");
};

export const hourConverter = (hourString) => {
    let [time, period] = hourString.split(" ");
    let [hour, min] = time.split(":");
    if (period === "pm") {
        return hour === "12" ? (parseInt(hour) * 100) + parseInt(min) : ((parseInt(hour) + 12) * 100) + parseInt(min);
    }
    return hour !== "12" ? (parseInt(hour) * 100) + parseInt(min) : ((parseInt(hour) + 12) * 100) + parseInt(min);
};
