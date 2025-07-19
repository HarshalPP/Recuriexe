const { randomUUID, randomBytes, randomInt } = require('node:crypto');

function targetFormatter(targetData) {
    const { employee, salesTarget, login, disbursement, collectionTarget, visit, emiCollected, crmTarget, calling, bod } = targetData;
    return { employee, salesTarget, login, disbursement, collectionTarget, visit, emiCollected, crmTarget, calling, bod };
}