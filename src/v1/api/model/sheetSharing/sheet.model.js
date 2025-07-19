const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const sheetShareSchema = new mongoose.Schema({
creator:{
    type:ObjectId,
    ref:"employee",
},
sheetName:{
type:String,
required:true
},
sheetUrl:{
    type:String,
    required:true
},
sharedWith:[{
    user:{
        type:ObjectId,
        ref:"employee",
    },
    permission:{
        type:String,
        enum:["read","edit"],
        default:"read"
    }
}],
},
{ timestamps: true }
);

const sheetShareDetail = mongoose.model("sheetShareDetail", sheetShareSchema);

module.exports = sheetShareDetail;
