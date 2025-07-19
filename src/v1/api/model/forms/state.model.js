const mongoose = require('mongoose');
const stateSchema = new mongoose.Schema({
    name:{
        type:String,
        required: false
    },

    city:[{
      cityName: {
        type: String,
        required: false
      }
    }]
})


module.exports = mongoose.model('statecity', stateSchema);