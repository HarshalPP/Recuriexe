// import mongoose from "mongoose";

// const organizationTypeSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     status: {
//       type: String,
//       enum: ["active", "inactive"],
//       default: "active",
//     },
//       description: { type: String, default: "" },
//       createdBy: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'User',
//           default: null
//         },
//   },
//   {
//     timestamps: true,
//   }
// );

// const OrganizationType = mongoose.model("OrganizationType", organizationTypeSchema);
// export default OrganizationType;
