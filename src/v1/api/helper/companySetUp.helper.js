import companyModel from '../models/companyModel/company.model.js';
import companySetUpModel from '../models/companyModel/companySetUp.model.js'
import { formatcompanySetUp } from '../formatters/companySetUp.formatter.js';
import { returnFormatter } from '../formatters/common.formatter.js';

//------------------------------------ company set up add and update ------------------------------------//


export async function companySetUpAdd(requestObject) {
    try {
        const { companyId } = requestObject.body;

        if (!companyId) {
            return returnFormatter(false, "Company Id Required", null);
        }

        const companyFind = await companyModel.findOne({ _id: companyId, status: "active" });

        if (!companyFind) {
            return returnFormatter(true, "Company Not Found", null);
        }

        const formattedData = formatcompanySetUp(requestObject);

        let created;
        const companySetUpExist = await companySetUpModel.findOne({ companyId });

        if (companySetUpExist) {
            created = await companySetUpModel.findOneAndUpdate(
                { companyId },
                { $set: formattedData },
                { new: true }
            );
        } else {
            created = await companySetUpModel.create(formattedData);
        }

        return returnFormatter(true, `Company Set Up ${companySetUpExist ? "Update" : "Add"} Successful`, created);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// ------------------------------------ company set up detail ------------------------------------------//


export async function companySetUpGet(requestObject) {
    try {
        const { companyId } = requestObject.query;


        if (!companyId) {
            return returnFormatter(false, "Company Id Required", null);
        }
        const formattedData = formatcompanySetUp(requestObject);

        const companyDetail = await companySetUpModel.findOne({ companyId });

        return returnFormatter(true, `Company Set Up Detail `, companyDetail);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// ------------------------------------ company set up List ------------------------------------------//


export async function companySetUpList() {
    try {
        const companyList = await companySetUpModel.find();
        return returnFormatter(true, `Company Set Up List `, companyList);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

