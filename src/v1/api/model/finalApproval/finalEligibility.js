// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const ObjectId = Schema.ObjectId;

// const finalEligibilitySchema = new Schema(
//   {
//     partnerId: { type: ObjectId, default: null },
//     name: {
//         type: String, 
//         required: true,
//       },
//       policy: {
//         type: String,
//         required: true,
//       },
//       valueRange: {
//         min: { type: Number, required: false }, 
//         max: { type: Number, required: false }, 
//         unit: { type: String, required: false },
//       },
//   },
//   {
//     timestamps: true,
//   }
// );


// const finalEligibilityModel = mongoose.model("finalEligibility", finalEligibilitySchema);
// module.exports = finalEligibilityModel;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const finalEligibilitySchema = new Schema(
  {
    partnerId: { type: ObjectId, ref:"lender" },
    policy: [
      {
        name: {
          type: String,
        },
        policy: {
          type: String,
        },
        valueRange: {
          min: { type: Number, required: false },
          max: { type: Number, required: false },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const finalEligibilityModel = mongoose.model(
  "finalEligibility",
  finalEligibilitySchema
);
module.exports = finalEligibilityModel;

