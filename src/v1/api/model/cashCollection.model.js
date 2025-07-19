const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const cashCollectionModelSchema = new Schema({
    employeeId:    { type: ObjectId,default:null},
    credit:        { type: Number,default:0},
    pendingAmount:        { type: Number,default:0},
    rejectedAmount:         { type: Number,default:0},
    debit:         { type: Number,default:0},
    status:        { type: String, enum :["active","inactive"], default:"active" },

},
{
  timestamps: true,
}
);

const cashCollectionModel = mongoose.model("cashCollection", cashCollectionModelSchema);

module.exports = cashCollectionModel;
