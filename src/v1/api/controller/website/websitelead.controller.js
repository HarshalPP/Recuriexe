
const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
    parseJwt
  } = require("../../../../../globalHelper/response.globalHelper");
  
const WebleadGenerateModel = require("../../model/website/websitelead.model");



// create the lead


async function createLead(req, res) {
    try {
        const { loanTypeId, remark, customerName, city, customerMobileNo, loanAmount, pincode, monthlyIncome, distrct, state } = req.body;
        const lead = new WebleadGenerateModel({
            loanTypeId,
            remark,
            customerName,
            city,
            customerMobileNo,
            loanAmount,
            pincode,
            monthlyIncome,
            distrct,
            state
        });

        const result = await lead.save();
        return success(res, result, "Lead created successfully");
    }
    catch (error) {
        return unknownError(res, error);
    }
}


// get all the leads

async function getAllLeads(req, res) {
    try{
        
        const result = await WebleadGenerateModel.find()
                       .populate('loanTypeId')
                       .sort({createdAt:-1});

        return success(res, result, "All leads fetched successfully");

    }catch(error){
        return unknownError(res,error);
    }
}

// get by id //

async function getLeadById(req,res){
    try{
        const { id } = req.params;
        const result = await WebleadGenerateModel.findById(id)
        .populate('loanTypeId');
        return success(res,result,"Lead fetched successfully");
    }catch(error){
        return unknownError(res,error);
    }
}


module.exports = {
    createLead,
    getAllLeads,
    getLeadById
}