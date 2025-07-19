const statemodel =  require("../../model/forms/state.model");


// make a api to create a new state //


async function createState(req, res) {
    try {
        const state = new statemodel(req.body);
        await state.save();
        res.status(201).json(state);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



// make a api to get all states //


async function getAllStates(req, res) {
    try {
        const states = await statemodel.find().select('name charges')
        res.json(states);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



async function getCitiesByStateId(req, res) {
    try {
        const { stateId } = req.query;

        if (!stateId) {
            return res.status(400).json({ message: 'State ID is required' });
        }

        const state = await statemodel.findById(stateId).select('city');

        if (!state) {
            return res.status(404).json({ message: 'State not found' });
        }

        res.json(state.city);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    createState,
    getAllStates,
    getCitiesByStateId
}