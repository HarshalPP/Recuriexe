import AiScreening from "../../models/AiScreeing/AiScreening.model.js";
import AIRule from "../../models/AiScreeing/AIRule.model.js";
import { formatAiScreening } from "../../formatters/aiScreeningFormatter.js";
import {
  success,
  created,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  serverValidation,
  unknownError,
  validation,
  alreadyExist,
  sendResponse,
  invalid,
  onError
} from "../../../../../src/v1/api/formatters/globalResponse.js"


// createAiScreening //

export const createAiScreening = async (req, res) => {
    try {
        const { name, description, coreSettings, screeningCriteria } = req.body;
        const orgainizationId=req.employee.organizationId;
    
        if (!name || !description || !coreSettings || !scoringWeights || !screeningCriteria) {
        return badRequest(res, "All fields are required");
        }
    
        const newScreening = new AiScreening({
        name,
        description,
        coreSettings,
        screeningCriteria,
        createdBy: req.employee._id, 
        orgainizationId:orgainizationId || null
        });
    
        await newScreening.save();
    
        return success(res, "created" ,  formatAiScreening(newScreening));
    } catch (error) {
        return onError(res, error);
    }

}



// getAiScreening //

export const getAiScreening = async (req, res) => {
    try {
        const organizationId= req.employee.organizationId;
        console.log("or" , organizationId)

        const screenings = await AiScreening.find({ isActive: true , organizationId:organizationId})
            .populate('createdBy', 'name email') // Assuming you want to populate createdBy with name and email
            .exec();

        if (!screenings || screenings.length === 0) {
            return notFound(res, "No active AI screenings found");
        }

        const formattedScreenings = screenings.map(formatAiScreening);
        return success(res, "Fetch AI Screening" , formattedScreenings);
    } catch (error) {
        return onError(res, error);
    }
}




// getAiScreeningById //


export const getAiScreeningById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return badRequest(res, "Screening ID is required");
        }

        const screening = await AiScreening.findById(id)
            .populate('createdBy', 'name email') // Assuming you want to populate createdBy with name and email
            .exec();

        if (!screening || !screening.isActive) {
            return notFound(res,  "AI Screening not found or is inactive");
        }

        return success(res, formatAiScreening(screening));
    } catch (error) {
        return onError(res, error);
    }
}




// updateAiScreening //



export const updateAiScreening = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, coreSettings, scoringWeights, screeningCriteria , autoScreening } = req.body;

        if (!id) {
            return badRequest(res, "Screening ID is required");
        }

        const screening = await AiScreening.findById(id);
        if (!screening || !screening.isActive) {
            return notFound(res, "AI Screening not found or is inactive");
        }

        // Basic fields
        screening.name = name || screening.name;
        screening.description = description || screening.description;
        screening.coreSettings = coreSettings || screening.coreSettings;
        screening.scoringWeights = scoringWeights || screening.scoringWeights;
        screening.autoScreening=autoScreening || screening.autoScreening

        // Convert `id` to `_id` to preserve identity
        if (Array.isArray(screeningCriteria)) {
            screening.screeningCriteria = screeningCriteria.map(item => ({
                _id: item.id || item._id, // Mongoose needs _id to recognize existing docs
                name: item.name,
                description: item.description,
                weight: item.weight,
                isActive: item.isActive,
                confidence: item.confidence,
                experience: item.experience,
            }));
        }

        await screening.save();

        return success(res, "updated", formatAiScreening(screening));
    } catch (error) {
        return onError(res, error);
    }
};




// deleteAiScreening //


export const deleteAiScreening = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return badRequest(res, "Screening ID is required");
        }

        const screening = await AiScreening.findById(id);

        if (!screening || !screening.isActive) {
            return notFound(res, "AI Screening not found or is inactive");
        }

        screening.isActive = false; // Soft delete
        await screening.save();

        return success(res, { message: "AI Screening deleted successfully" });
    } catch (error) {
        return onError(res, error);
    }
}


// get categories for AI Screening //
export const getCategoriesForAIScreening = async (req, res) => {
  try {

    const organizationId= req.employee.organizationId;
    const categories = await AiScreening.find({ isActive: true , organizationId:organizationId});

    if (!categories || categories.length === 0) {
      return notFound(res, "No active categories found for AI Screening");
    }

    // Flatten all screeningCriteria from each category
    const screeningCriteriaList = categories.flatMap(category => 
      category.screeningCriteria.map(criterion => ({
        id: criterion._id,
        name: criterion.name,
        description: criterion.description,
        weight: criterion.weight,
        isActive: criterion.isActive,
        confidence: criterion.confidence,
        experience: criterion.experience,
        categoryName: category.name,
        categoryId: category._id
      }))
    );

    return success(res, "fetch screeningCriteria list" , screeningCriteriaList);
  } catch (error) {
    return unknownError(res, error);
  }
};




// create AIRule //


// export const createAIRule = async (req, res) => {
//     try {
//         const { AutomaticScreening, AI_Screening } = req.body;

//         if (!AI_Screening || !Array.isArray(AI_Screening) || AI_Screening.length === 0) {
//             return badRequest(res, "AI Screening rules are required");
//         }


//         const screeningCriteriaIds = AI_Screening.map(rule => rule.category).flat();

//         const matchedCategories = await AiScreening.find({
//             "screeningCriteria._id": { $in: screeningCriteriaIds }
//         });

//         const foundCriteriaIds = matchedCategories
//             .flatMap(cat => cat.screeningCriteria)
//             .filter(crit => screeningCriteriaIds.includes(String(crit._id)))
//             .map(crit => String(crit._id));

//         if (foundCriteriaIds.length !== screeningCriteriaIds.length) {
//             return badRequest(res, "One or more screeningCriteria IDs do not exist");
//         }


//         const newRule = new AIRule({
//             AutomaticScreening: AutomaticScreening || false,
//             AI_Screening: AI_Screening.map(rule => ({
//                 name: rule.name,
//                 description: rule.description,
//                 priority: rule.priority || 'Medium',
//                 category: rule.category, // assuming this is still needed for structure
//                 screeningCriteria: rule.screeningCriteria,
//                 isActive: rule.isActive !== undefined ? rule.isActive : true
//             }))
//         });

//         await newRule.save();
//         return created(res, newRule);

//     } catch (error) {
//         return onError(res, error);
//     }
// };

export const createAIRule = async (req, res) => {
    try {
        const { AutomaticScreening, AI_Screening } = req.body;
         const orgainizationId=req.employee.organizationId;

        if (!AI_Screening || !Array.isArray(AI_Screening) || AI_Screening.length === 0) {
            return badRequest(res, "AI Screening rules are required");
        }

        const screeningCriteriaIds = AI_Screening.flatMap(rule => rule.category);

        const matchedCategories = await AiScreening.find({
            "screeningCriteria._id": { $in: screeningCriteriaIds }
        });

        const foundCriteriaIds = matchedCategories
            .flatMap(cat => cat.screeningCriteria)
            .filter(crit => screeningCriteriaIds.includes(String(crit._id)))
            .map(crit => String(crit._id));

        if (foundCriteriaIds.length !== screeningCriteriaIds.length) {
            return badRequest(res, "One or more screeningCriteria IDs do not exist");
        }


        let existingRule = await AIRule.findOne();

        const formattedScreening = AI_Screening.map(rule => ({
            name: rule.name,
            description: rule.description,
            priority: rule.priority || 'Medium',
            category: rule.category,
            screeningCriteria: rule.screeningCriteria,
            isActive: rule.isActive !== undefined ? rule.isActive : true
        }));

        if (existingRule) {
            existingRule.AI_Screening.push(...formattedScreening);
            if (AutomaticScreening !== undefined) {
                existingRule.AutomaticScreening = AutomaticScreening;
            }

            await existingRule.save();
            return success(res,  "Update Rule" , existingRule); 
        } else {

            const newRule = new AIRule({
                AutomaticScreening: AutomaticScreening || false,
                AI_Screening: formattedScreening,
                organizationId:orgainizationId
            });

            await newRule.save();
            return success(res,  "Added new Rule " , newRule);
        }

    } catch (error) {
        return onError(res, error);
    }
};




// getAIRules //
export const getAIRules = async (req, res) => {
    try {
        const orgainizationId=req.employee.organizationId;
        
        const rules = await AIRule.find({
            AI_Screening: { $exists: true, $ne: [] },
            orgainizationId:orgainizationId
        }).lean();

        if (!rules || rules.length === 0) {
            return notFound(res, "No active AI rules found");
        }

        // Filter out inactive screenings
        const filteredRules = rules
            .map(rule => {
                const activeScreenings = rule.AI_Screening.filter(s => s.isActive == true);
                return {
                    ...rule,
                    AI_Screening: activeScreenings
                };
            })
            .filter(rule => rule.AI_Screening.length > 0);

        if (filteredRules.length === 0) {
            return notFound(res, "No active AI screening rules found");
        }

        // Collect all screening criteria ObjectIds
        const categoryIds = filteredRules.flatMap(rule =>
            rule.AI_Screening.flatMap(screening => screening.category)
        );

        // Find the matching AiScreening docs
        const aiScreeningDocs = await AiScreening.find({
            "screeningCriteria._id": { $in: categoryIds }
        }).lean();

        // Build maps
        const screeningCriteriaMap = {};
        const coreSettingsMap = {};

        aiScreeningDocs.forEach(doc => {
            doc.screeningCriteria.forEach(criterion => {
                screeningCriteriaMap[String(criterion._id)] = criterion;
                coreSettingsMap[String(criterion._id)] = doc.coreSettings;
            });
        });

        // Build response
        const populatedRules = filteredRules.map(rule => {
            const allCoreSettings = [];

            rule.AI_Screening = rule.AI_Screening.map(screening => {
                const enrichedCategories = screening.category.map(catId => {
                    const idStr = String(catId);
                    const core = coreSettingsMap[idStr];
                    if (core) allCoreSettings.push(core); // Collect for top-level
                    return {
                        screeningCriteria: screeningCriteriaMap[idStr] || catId
                    };
                });

                return {
                    ...screening,
                    category: enrichedCategories
                };
            });

            // Attach the first matching coreSettings (or null)
            return {
                ...rule,
                coreSettings: allCoreSettings[0] || null
            };
        });

        return success(res, "Rule fetch Successfully" , populatedRules);
    } catch (error) {
        return onError(res, error);
    }
};






// getAIRuleById //

export const getAIRuleById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return badRequest(res, "Rule ID is required");
        }

        const rule = await AIRule.findById(id)
            .populate('AI_Screening.category', 'name description') // Populate category details
            .exec();

        if (!rule || !rule.isActive) {
            return notFound(res, "AI Rule not found or is inactive");
        }

        return success(res, rule);
    } catch (error) {
        return onError(res, error);
    }
}



// updateAIRule //

export const updateAIRule = async (req, res) => {
    try {
        const { id } = req.params;
        const { AutomaticScreening, AI_Screening } = req.body;

        if (!id) {
            return badRequest(res, "Rule ID is required");
        }

        const rule = await AIRule.findById(id);

        if (!rule) {
            return notFound(res, "AI Rule not found or is inactive");
        }

        rule.AutomaticScreening = AutomaticScreening !== undefined ? AutomaticScreening : rule.AutomaticScreening;
        rule.AI_Screening = AI_Screening || rule.AI_Screening;

        await rule.save();

        return success(res, "Update Rule" , rule);
    } catch (error) {
        return onError(res, error);
    }
}


// deleteAIRule //

export const deleteAIRule = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return badRequest(res, "Rule ID is required");
        }

        const rule = await AIRule.findById(id);

        if (!rule || !rule.isActive) {
            return notFound(res, "AI Rule not found or is inactive");
        }

        rule.isActive = false; // Soft delete
        await rule.save();

        return success(res, { message: "AI Rule deleted successfully" });
    } catch (error) {
        return onError(res, error);
    }
}