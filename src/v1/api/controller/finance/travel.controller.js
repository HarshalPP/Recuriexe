const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");
const {addTravel , getTravelById , updateTravel , deactivateTravel , getAllActiveTravels , getTravelStats  , getAllActiveTravelOfCreator , getTravelReport} = require("../../helper/finance/travel.helper");


// Create a new Travel

async function addTravelController(req, res) {
    try {
        const { status, message, data } = await addTravel(req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    }
    catch (error) {
        return unknownError(res, error.message);
    }
}


// Get Travel by travelId

async function getTravelByIdController(req, res) {
    try {
        const { status, message, data } = await getTravelById(req.params.travelId);
        return status ? success(res, message, data) : badRequest(res, message);
    }
    catch (error) {
        return unknownError(res, error.message);
    }
}


// update an travel//

async function updateTravelController(req, res) {
    try {
        const { status, message, data } = await updateTravel(req.params.travelId, req.body, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    }
    catch (error) {
        return unknownError(res, error.message);
    }
}

// set isActive to false instead of deleting the an travel //

async function deactivateTravelController(req, res) {
    try {
        const { status, message, data } = await deactivateTravel(req.params.travelId, req.Id);
        return status ? success(res, message, data) : badRequest(res, message);
    }
    catch (error) {
        return unknownError(res, error.message);
    }
}

// get all active travels

async function getAllActiveTravelsController(req, res) {
    try {
        const { status, message, data } = await getAllActiveTravels();
        return status ? success(res, message, data) : badRequest(res, message);
    }
    catch (error) {
        return unknownError(res, error.message);
    }
}


// get travel stats

async function getTravelStatsController(req, res) {
    try {
        const { status, message, data } = await getTravelStats();
        return status ? success(res, message, data) : badRequest(res, message);
    }
    catch (error) {
        return unknownError(res, error.message);
    }
}


// get all active travels of creator

async function getAllActiveTravelOfCreatorController(req, res) {
    try{

        const {status, message, data} = await getAllActiveTravelOfCreator(req.Id);
        return status ? success(res, message, data) : badRequest(res, message);

    }catch(error){
        return unknownError(res, error.message);
    }
}



// get travel report

async function getTravelReportController(req, res) {

    try {
        const { status, message, data } = await getTravelReport(req.body);
        res.header('Content-Type',  'text/csv');
        res.attachment('travel_report.csv');
        return res.send(data);      
        return status ? success(res, message, data) : badRequest(res, message);
    }
    catch (error) {
        return unknownError(res, error.message);
    }


}

module.exports = {
    addTravelController,
    getTravelByIdController,
    updateTravelController,
    deactivateTravelController,
    getAllActiveTravelsController,
    getTravelStatsController,
    getAllActiveTravelOfCreatorController,
    getTravelReportController
}