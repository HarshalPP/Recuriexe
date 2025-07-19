const { randomUUID } = require('node:crypto');

function laonSathiFormatter(bodyData,salesPersonId) {
    const {  fullName, email, phone, userName, password } = bodyData;
    const loanSathiId = randomUUID();
    return { loanSathiId, fullName, email, phone, userName, password, roleName:"66a8e17ec3e96f6013b96d6b", salesPersonId };
}

function laonSathiUpdateFormatter(bodyData) {
    const {  fullName, email, phone,  roleName } = bodyData;
    return {  fullName, email, phone, roleName };
}

module.exports={
    laonSathiFormatter,
    laonSathiUpdateFormatter
}