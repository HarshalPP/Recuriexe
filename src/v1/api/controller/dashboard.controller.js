const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
} = require("../../../../globalHelper/response.globalHelper");

const { salesDashbaordHelper } = require("../helper/dashboard.helper");

async function salesDashboard(req, res) {
  try {
    const userData = await salesDashbaordHelper();
    return userData ? success(res, "data", userData) : badRequest(res, "error");
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}

module.exports = {
  salesDashboard,
};
