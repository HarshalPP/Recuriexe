import { newMailContent, mailContentDetail } from '../../helper/mail/mailContent.helper.js';
import { created, success, badRequest, notFound, unknownError } from '../../formatters/globalResponse.js';
import Emailuser from '../../models/UserEmail/user.js';
import jobApplyModel from '../../models/jobformModel/jobform.model.js';
import MailTemplateModel from "../../models/mailModel/mailContent.model.js"
import EmployeeModel from "../../models/employeemodel/employee.model.js"
import { google } from 'googleapis';
import uniq from 'lodash/uniq.js';
import BranchModel from "../../models/branchModel/branch.model.js";
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import WorkLocationModel from "../../models/worklocationModel/worklocation.model.js";
import departmentModel from "../../models/deparmentModel/deparment.model.js";
import roleModel from "../../models/RoleModel/role.model.js";
import employeeTypeModel from "../../models/employeeType/employeeType.model.js";
import employementTypeModel from "../../models/employeementTypemodel/employeementtype.model.js";
import designationModel from "../../models/designationModel/designation.model.js";

// ------------------------------------ add mail content ------------------------------------//
//    subDepartmentId,reportingManagerId,
export async function addMailContent(req, res) {
  try {
    const { status, message, data } = await newMailContent(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}


// ------------------------------------ get mail content ------------------------------------//

export async function getMailContent(req, res) {
  try {
    const { status, message, data } = await mailContentDetail(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}




function replacePlaceholders(template, data) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return data?.[key.trim()] ?? `{{${key}}}`; // fallback
  });
}


export const sendDynamicMailByTemplateId = async (req, res) => {
  const {
    templateName,
    modelId,
    senderEmail,
    ccMail = [],
  } = req.body;

  if (!templateName || !modelId)
    return badRequest(res, 'Template Name And Model Id Are Required');

  try {
    const template = await MailTemplateModel.findOne({ name: new RegExp(`^${templateName.trim()}$`) }).lean();

    if (!template) return notFound(res, 'Mail template not found');

    let sender;
    if (senderEmail) {
      sender = await Emailuser.findOne({ email: senderEmail });
    } else if (template.senderId) {
      sender = await Emailuser.findOne({
        $or: [
          { _id: template._id },
          { email: template.senderId }
        ]
      });
    }

    if (!sender) return badRequest(res, 'Sender E‑Mail Not Found');
    if (!sender.refreshToken)
      return badRequest(
        res,
        'Sender Has No RefreshToken – Re‑Authorize With Prompt'
      );


    const oauth2 = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
    oauth2.setCredentials({
      refresh_token: sender.refreshToken,
      access_token: sender.accessToken,
      expiry_date: sender.expiryDate,
    });

    oauth2.on('tokens', async (t) => {
      const patch = {
        ...(t.access_token && { accessToken: t.access_token }),
        ...(t.refresh_token && { refreshToken: t.refresh_token }),
        ...(t.expiry_date && { expiryDate: t.expiry_date }),
      };
      if (Object.keys(patch).length) {
        await Emailuser.findByIdAndUpdate(sender._id, patch).catch(console.error);
        Object.assign(sender, patch);
      }
    });

    const expiring =
      !sender.expiryDate || sender.expiryDate < Date.now() + 60_000;
    if (!sender.accessToken || expiring) {
      await oauth2.getAccessToken();
    }
    const { token } = await oauth2.getAccessToken();

    let toMail = [];
    let modelDetail;
    if (Array.isArray(toMail) && toMail.length) {
      toMail = toMail;
    } else {
      modelDetail = await jobApplyModel.findById(modelId).lean();
      if (modelDetail) {

        if (Array.isArray(modelDetail.branchId) && modelDetail.branchId.length) {
          const branches = await BranchModel.find({
            _id: { $in: modelDetail.branchId }
          }).lean();
          modelDetail.branchId = branches.map(branch => branch.name).filter(Boolean);
        }

        if (modelDetail.orgainizationId) {
          const org = await OrganizationModel.findById(modelDetail.orgainizationId).lean();
          if (org?.name) modelDetail.orgainizationId = org.name;
        }

        if (modelDetail.departmentId) {
          const deprt = await departmentModel.findById(modelDetail.departmentId).lean();
          if (deprt?.name) modelDetail.departmentId = deprt.name;
        }

        if (modelDetail.workLocationId) {
          const loc = await WorkLocationModel.findById(modelDetail.workLocationId).lean();
          if (loc?.name) modelDetail.workLocationId = loc.name;
        }

        if (modelDetail.emailId) {
          toMail = [modelDetail.emailId];
        } else {
          return badRequest(res, "Candidate Email Not Found")
        }
      } else {
        modelDetail = await EmployeeModel.findById(modelId).lean();
        if (modelDetail) {


          if (Array.isArray(modelDetail.roleId) && modelDetail.roleId.length) {
            const roles = await roleModel.find({
              _id: { $in: modelDetail.roleId }
            }).lean();
            modelDetail.roleId = roles.map(role => role.roleName).filter(Boolean);
          }

          if (Array.isArray(modelDetail.branchId) && modelDetail.branchId.length) {
            const branches = await BranchModel.find({
              _id: { $in: modelDetail.branchId }
            }).lean();
            modelDetail.branchId = branches.map(branch => branch.name).filter(Boolean);
          }

          if (modelDetail.organizationId) {
            const org = await OrganizationModel.findById(modelDetail.organizationId).lean();
            if (org?.name) modelDetail.organizationId = org.name;
          }

          if (modelDetail.departmentId) {
            const deprt = await departmentModel.findById(modelDetail.departmentId).lean();
            if (deprt?.name) modelDetail.departmentId = deprt.name;
          }


          const department = await departmentModel.findById(modelDetail?.departmentId);

          let subDepartmentId = 'N/A';

          if (department) {
            const subDept = department.subDepartments.id(modelDetail.subDepartmentId).lean();
            if (subDept) modelDetail.subDepartmentId = subDept.name;
          }


          if (modelDetail.workLocationId) {
            const loc = await WorkLocationModel.findById(modelDetail.workLocationId).lean();
            if (loc?.name) modelDetail.workLocationId = loc.name;
          }
          if (modelDetail.employeeTypeId) {
            const employeeType = await employeeTypeModel.findById(modelDetail.employeeTypeId).lean();
            if (employeeType?.name) modelDetail.employeeTypeId = employeeType.title;
          }

          if (modelDetail.employementTypeId) {
            const employement = await employementTypeModel.findById(modelDetail.employementTypeId).lean();
            if (employement?.title) modelDetail.employementTypeId = employement.title;
          }

          if (modelDetail.designationId) {
            const desig = await designationModel.findById(modelDetail.designationId).lean();
            if (desig?.name) modelDetail.designationId = desig.name;
          }

          if (modelDetail.designationId) {
            const desig = await designationModel.findById(modelDetail.designationId).lean();
            if (desig?.name) modelDetail.designationId = desig.name;
          }


          if (modelDetail.email) {
            toMail = [modelDetail.email];
          } else {
            return badRequest(res, "Employee Email Not Found")
          }
        }
      }
    }

    const mergedCc = uniq([
      ...(template.ccMail || []),
      ...ccMail,
    ]);

    const subject = replacePlaceholders(template.subject, modelDetail);
    const body = replacePlaceholders(template.body, modelDetail);

    await sendGmail(
      token,
      toMail,
      mergedCc,
      subject,
      body,
      template.file?.[0] || null
    );

    return success(res, 'Mail sent successfully');
  } catch (err) {
    console.error('Send Dynamic Mail Error:', err);
    return unknownError(res, 'Failed to send email', err);
  }
};



export const sendGmail = async (accessToken, to, cc = [], subject, message, filePath = null) => {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const headers = [
    `To: ${to}`,
    ...(cc.length > 0 ? [`Cc: ${cc.join(', ')}`] : []),
    `Subject: ${subject}`,
  ];

  if (!filePath) {
    const emailContent = [
      ...headers,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      message
    ].join('\n');

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    });

    return;
  }

  const fileName = path.basename(filePath);
  let fileContentBase64;

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    const response = await axios.get(filePath, { responseType: 'arraybuffer' });
    fileContentBase64 = Buffer.from(response.data).toString('base64');
  } else {
    const fileContent = fs.readFileSync(filePath);
    fileContentBase64 = fileContent.toString('base64');
  }

  const boundary = '__my_boundary__';
  const emailParts = [
    ...headers,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    '',
    message,
    '',
    `--${boundary}`,
    'Content-Type: application/octet-stream',
    `Content-Disposition: attachment; filename="${fileName}"`,
    'Content-Transfer-Encoding: base64',
    '',
    fileContentBase64,
    `--${boundary}--`
  ];

  const rawMessage = Buffer.from(emailParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: rawMessage }
  });
};
