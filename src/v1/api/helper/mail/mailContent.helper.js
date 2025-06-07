
import mailContentModel from '../../models/mailModel/mailContent.model.js'
import { formatMailContent } from '../../formatters/mail.formatter.js';
import { returnFormatter } from '../../formatters/common.formatter.js';

export async function newMailContent(requestObject) {
    try {
        const {
            senderId,
            toMail,
            subject,
            body,
            stage,
        } = requestObject.body;

        // Required field validation
        if (!senderId) return returnFormatter(false, "senderId is required");
        if (!toMail) return returnFormatter(false, "toMail is required");
        if (!subject) return returnFormatter(false, "subject is required");
        if (!body) return returnFormatter(false, "body is required");
        if (!stage) return returnFormatter(false, "stage is required");

        // Format data
        const formattedData = formatMailContent(requestObject);

        // Save
        const created = await mailContentModel.create(formattedData);
        return returnFormatter(true, "Mail content added successfully", created);

    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function mailContentDetail(requestObject) {
    try {
        const { id } = requestObject.query
        if(!id){
            return returnFormatter(false, "ID is required");
        }
        const mailContentDetail = await mailContentModel.create(requestObject.query);
        return returnFormatter(true, "Mail content Detail", mailContentDetail);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}