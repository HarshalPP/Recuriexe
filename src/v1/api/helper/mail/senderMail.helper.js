import jobSaveModel from '../../models/jobPostModel/jobSave.model.js';
import senderMailModel from '../../models/mailModel/senderMail.model.js'
import { formatMailSender } from '../../formatters/mail.formatter.js';
import { returnFormatter } from '../../formatters/common.formatter.js';
// import admin from '../services/notification/firebaseNotification.js';

//------------------------------------ sender detail ------------------------------------//

export async function addSenderDetail(requestObject) {
    try {

        const { email, password } = requestObject.body;
        if (!email) {
            return returnFormatter(false, "email are required");
        }
        if (!password) {
            return returnFormatter(false, "password are required");
        }
        const formattedData = formatMailSender(requestObject);
        const existing = await senderMailModel.findOne({ email });
        if (existing) {
            return returnFormatter(true, "email Detail Alredy Have", null);
        } else {
            const created = await senderMailModel.create(formattedData);
            return returnFormatter(true, "Sender Detail Add Successful", created);
        }

    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

//------------------------------------ sender Detail get ------------------------------------//

export async function senderDetailget(requestObject) {
    try {
        const { email } = requestObject.query

        if (!email) {
            return returnFormatter(false, "email are required");
        }
        const emailDetail = await senderMailModel.findOne({ email: email })
        if (!emailDetail) {
            return returnFormatter(true, "Email Detail Not Found", null);
        }
        const senderDetail = await senderMailModel.find({ email }).lean()
        return returnFormatter(true, "Sender Detail ", senderDetail);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

//------------------------------------------ sender mail list drop down -------------------------------------

export async function senderListDropDown(requestObject) {
    try {
        const senderDetail = await senderMailModel.find().select('-password')
        return returnFormatter(true, "Sender Detail ", senderDetail);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


//------------------------------------ update  ------------------------------------//


export async function senderMailUpdateById(requestObject) {
    try {

        const { id } = requestObject.body;
        if (!id) {
            return returnFormatter(false, "Id required");
        }
        const formattedData = formatMailSender(requestObject);
        const existingData = await senderMailModel.findByIdAndUpdate(
            id,
            { $set: formattedData },
            { new: true } // optional: returns the updated document
        );
        if (existingData) {
            return returnFormatter(true, "email Update", existingData);
        } else {
            return returnFormatter(false, "Sender Detail Not Found", null);
        }

    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
