const mongoose = require("mongoose");

const envConfigSchema = new mongoose.Schema({
    keyName: { type: String, required: true, unique: true },  // Stores the name (e.g., EMAIL_HOST)
    host: { type: String, required: true , default: "" },
    user: { type: String, required: true , default: "" },
    password: { type: String, required: true , default: "" },
    status : {type :String , enum : ["active" , "inactive"] , default : "active"  }
}, { timestamps: true });

const EnvConfig = mongoose.model("EnvConfig", envConfigSchema);

module.exports = EnvConfig;
