export function formatMailSwitchData(req,organizationId) {
    const {
        masterMailStatus,
        hrmsMail,
    } = req.body;

    return {
        masterMailStatus,
        hrmsMail,
        organizationId,
    };
}

export function formatMailSender(req) {
    const {
        email,
        password,
        status,
    } = req.body;

    return {
        email,
        password,
        status,
    };
}


export function formatMailContent(req) {
    const {
        senderId,
        toMail,
        // newToMailId,
        modelType,
        ccMail,
        subject,
        body,
        file,
        name,
        organizationId,
    } = req.body;

    return {
        senderId,
        toMail,
        // newToMailId: newToMailId || false,
        modelType,
        ccMail: ccMail || [],
        subject,
        body,
        name,
        organizationId,
        file: file || [],
    };
}