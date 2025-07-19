const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const taskModelSchema = new Schema({
    employeeId:         { type: ObjectId,default:null},
    assignBy:           { type: ObjectId,default:null},
    groupId:            { type: String,default:null},
    task:               { type: String,default:null},
    title:              { type: String,default:""},
    description:        { type: String,default:""},
    remark: [
      {
          remarkId: { type: ObjectId, default: null }, 
          content:  { type: String, default: "" },
          taskFile: { type: String, default: "" },
          seenBy: [
            {
              employeeId: { type: ObjectId, default: null },
              seenTime:   { type: String,default:""}, 
            },
          ],
          time:     { type: String,default:""},
      }
  ],
    startDate:          { type: String,default:""},
    dueDate:            { type: String,default:""},
    endDate:            { type: String,default:""},
    status:             { type: String, enum :["pending","WIP","processing","overDue","completed"], default:"pending" },
    taskType:           { type: String, enum :["bod","login","pd"], default:"bod" },
    customerId:         { type: ObjectId,default:null},
    redirectUrl:        { type: String,default:""},
},
{
  timestamps: true,
}
);

const taskModel = mongoose.model("task", taskModelSchema);

module.exports = taskModel;
