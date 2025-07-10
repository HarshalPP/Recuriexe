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


export function generateUniqueId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}${randomStr}`.toUpperCase();
}

export function calculateDateDifference(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

export function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}
