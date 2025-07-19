const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const queryFormSchema = new Schema(
  {
    querySendBy: { type: ObjectId, default: null },
    queryDoneBy: { type: ObjectId, default: null },
    customerId:  { type: ObjectId, default: null },
    formType:    {type: String, default:""},
    queryDetail: {type: String, required:[true, 'queryDetail is required']},
    type:        {type: String, default:""},
    docUpload:   {type: String, default:""},
    remark:      {type: String, default:""},
    status:      {type: String,enum:["pending","resolve","done"], default:"pending"},

  },
  {
    timestamps: true, 
  }
);

const queryFormModel = mongoose.model('queryForm', queryFormSchema);

module.exports = queryFormModel;
