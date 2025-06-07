import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const pincodeSchema = new mongoose.Schema({
  officeName: { type: String,  },
  pincode: { type: Number,  },
  taluk: { type: String,  },
  districtName: { type: String,  },
  stateName: { type: String,  },
});

const PincodeModel = model("pincode", pincodeSchema);

export default PincodeModel;
