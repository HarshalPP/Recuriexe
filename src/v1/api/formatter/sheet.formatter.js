const { randomUUID } = require('node:crypto');

function sheetFormatter(sheetData) {
    const { sheetCategoryId, sheetName, sheetDescription, sheetLink ,assignedEmployees} = sheetData;
    const sheetId = randomUUID();

    return { sheetId, sheetCategoryId, sheetName, sheetDescription, sheetLink,assignedEmployees };
}

function sheetUpdateFormatter(sheetData) {
    const { sheetCategoryId, sheetName, sheetDescription, sheetLink ,assignedEmployees} = sheetData;
    return { sheetCategoryId, sheetName, sheetDescription, sheetLink,assignedEmployees };
}

module.exports = {
    sheetFormatter,
    sheetUpdateFormatter
};
