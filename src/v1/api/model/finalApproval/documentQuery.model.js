const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const documentQuerySchema = new Schema(
  {
    queryDetails: [
      {
        query: {
          type: String,
        },
        employeeId: { type: ObjectId, default: null },
      },
      {
        resolve: {
          type: String,
        },
        customerId: { type: ObjectId, default: null },
      }
    ],
  },
  {
    timestamps: true,
  }
);

const documentQueryModel = mongoose.model(
  "documentQuery",
  documentQuerySchema
);

module.exports = documentQueryModel;
