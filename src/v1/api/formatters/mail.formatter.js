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
        newToMailId,
        ccMail,
        subject,
        body,
        attachments,
        stage
    } = req.body;

    return {
        senderId,
        toMail,
        newToMailId: newToMailId || false,
        ccMail: ccMail || [],
        subject,
        body,
        attachments: attachments || [],
        stage,
    };
}