const express = require('express');
const { 
  addNewSheet, 
  addNewSheetCategory, 
  deleteSheetCategoryById, 
  deleteSheetData, 
  getSheetById, 
  getSheetCategoryById, 
  getSheetCategoryList, 
  getSheetList, 
  updateSheetCategoryData, 
  updateSheetData ,
  getAssignedSheetCategoryList,
  getAssignedSheetList
} = require('../controller/sheet.controller.js');

const sheetRouter = express.Router();

sheetRouter.post("/add", addNewSheet);
sheetRouter.get("/", getSheetList);
sheetRouter.get("/user", getAssignedSheetList);
sheetRouter.get("/single/:sheetId", getSheetById);
sheetRouter.post("/update/:sheetId", updateSheetData);
sheetRouter.post("/delete/:sheetId", deleteSheetData);

sheetRouter.post("/category/add", addNewSheetCategory);
sheetRouter.get("/category/", getSheetCategoryList);
sheetRouter.get("/user/category/", getAssignedSheetCategoryList);
sheetRouter.get("/category/single/:sheetCategoryId", getSheetCategoryById);
sheetRouter.post("/category/update/:sheetCategoryId", updateSheetCategoryData);
sheetRouter.post("/category/delete/:sheetCategoryId", deleteSheetCategoryById);

module.exports = sheetRouter;
