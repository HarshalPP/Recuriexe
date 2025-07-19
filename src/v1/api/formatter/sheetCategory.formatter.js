const { randomUUID, randomBytes, randomInt } = require('node:crypto');

function sheetCategoryFormatter(sheetCategoryData) {
    const { sheetCategoryName, custom, creator } = sheetCategoryData;
    const sheetCategoryId = randomUUID();

    return { sheetCategoryId, sheetCategoryName, custom, creator };
}

function sheetCategoryUpdateFormatter(sheetCategoryData) {
    const { sheetCategoryName, } = sheetCategoryData;
    return { sheetCategoryName };
}

module.exports = {
    sheetCategoryFormatter,
    sheetCategoryUpdateFormatter
};
