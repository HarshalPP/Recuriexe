const express = require("express");
const router = express.Router();

const {
  customerTestimonialAdd,
  getAllCustomerTestimonials,
  getCustomerTestimonial,
  addEmployeeTestimonial,
  updateCustomerTestimonial,
  deleteCustomerTestimonial,
  getAllEmployeeTestimonials,
  getEmployeeTestimonials,
  updateEmployeeTestimonial,
  deleteEmployeeTestimonial,
} = require("../controller/testimonial.controller");

router.post("/customer/add", customerTestimonialAdd);
router.get("/customer/get", getAllCustomerTestimonials);
router.get("/customer/getCustomerTestimonial", getCustomerTestimonial);
router.post("/customer/delete", deleteCustomerTestimonial);
router.post("/customer/update", updateCustomerTestimonial);
router.post("/employee/add", addEmployeeTestimonial);
router.get("/employee/get", getAllEmployeeTestimonials);
router.get("/employee/getEmployeeTestimonial", getEmployeeTestimonials);
router.post("/employee/update", updateEmployeeTestimonial);
router.post("/employee/delete", deleteEmployeeTestimonial);

module.exports = router;
