const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const newVisitModelSchema = new Schema({
    LD:                { type: String,default:""},
    numberOfMonth:     { type: Number, default:null },
    totalEmiAmount:    { type: Number, default:null },
    newContactNumber:  { type: Number, default:null },
    status:            { type: String, enum :["clear","reject"], default:"active" },

},
{
  timestamps: true,
}
);



const newVisitModel = mongoose.model("emiDetail", newVisitModelSchema);

module.exports = newVisitModel;
