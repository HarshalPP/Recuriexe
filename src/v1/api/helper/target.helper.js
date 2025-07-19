// ------------------------------------Target Category------------------------------------ //

async function addSheetCategory(sheetCategoryData) {
    try {
        const sheetFormatterData = sheetCategoryFormatter(sheetCategoryData);
        await sheetCategoryModel.create(sheetFormatterData);
        return returnFormatter(true, "sheet Category added");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}