// models/favoriteDashboardModel.js

import mongoose from "mongoose";

const budgetFavoriteSchema = new mongoose.Schema({
  name :{
    type :String, default:""
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
  },
  departmentId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newdepartment',
  }],
  subDepartmentId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newdepartment',
  }],
  designationId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newdesignation',
  }],
}, {
  timestamps: true
});

export default mongoose.model("budgetFavorite", budgetFavoriteSchema);
