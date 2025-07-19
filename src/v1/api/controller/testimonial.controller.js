const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../globalHelper/response.globalHelper");
// } = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
// const ObjectId = mongoose.Types.ObjectId;
const customerTestimonialModel = require("../model/customerTestimonials.model");
const employeeTestimonialModel = require("../model/employeeTestimonial.model");

// ------------------ customer testimonial  Add  ---------------------------------------

async function customerTestimonialAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const customerTestimonial = await customerTestimonialModel.create(req.body);
    success(
      res,
      "Customer Testimonial Added Successfully",
      customerTestimonial
    );
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ customer testimonial  get  ---------------------------------------

async function getAllCustomerTestimonials(req, res) {
  try {
    let customerTestimonials = await customerTestimonialModel.find({
      status: "active",
    });
    success(res, "All Customer Testimonials", customerTestimonials);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ customer testimonial get a particular testimonial  ---------------------------------------
async function getCustomerTestimonial(req, res) {
  try {
    let customerTestimonial = await customerTestimonialModel.findById(
      req.body.id
    );

    success(res, "Customer Testimonial", customerTestimonial);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ customer testimonial  Update  ---------------------------------------

async function updateCustomerTestimonial(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    customerTestimonialDetail =
      await customerTestimonialModel.findByIdAndUpdate(
        req.body.id,
        req.body,
        { new: true } // Return the updated document
      );

    if (!customerTestimonialDetail) {
      return res.status(404).json({
        errorName: "notFound",
        message: "No customer testimonial details found with the given ID",
      });
    }

    success(
      res,
      "Customer Testimonial Updated Successfully",
      customerTestimonialDetail
    );
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ customer testimonial  Delete  ---------------------------------------

async function deleteCustomerTestimonial(req, res) {
  try {
    const testimonialId = req.body.id;

    if (!testimonialId) {
      return res.status(400).json({
        errorName: "badRequest",
        message: "ID is required",
      });
    }

    // Update the status to "inactive" to soft-delete the testimonial
    let customerTestimonial = await customerTestimonialModel.findOneAndUpdate(
      { _id: testimonialId, status: "active" },
      { status: "inactive" },
      { new: true } // Return the updated document
    );

    if (!customerTestimonial) {
      return res.status(404).json({
        errorName: "notFound",
        message: "No active Customer Testimonial found with the given ID",
      });
    }

    success(
      res,
      "Customer Testimonial marked as inactive successfully",
      customerTestimonial
    );
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------ employee testimonial  Add  ---------------------------------------

async function addEmployeeTestimonial(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const employeeTestimonial = await employeeTestimonialModel.create(req.body);
    success(
      res,
      "Employee Testimonial Added Successfully",
      employeeTestimonial
    );
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------ employee testimonial get  ---------------------------------------

async function getAllEmployeeTestimonials(req, res) {
  try {
    let employeeTestimonial = await employeeTestimonialModel.find({
      status: "active",
    });
    success(res, "All Employee Testimonials", employeeTestimonial);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ employee testimonial get a particular testimonial  ---------------------------------------
async function getEmployeeTestimonials(req, res) {
  try {
    let employeeTestimonial = await employeeTestimonialModel.findById(
      req.body.id
    );

    success(res, "Employee Testimonial", employeeTestimonial);
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------ employee testimonial  Update  ---------------------------------------

async function updateEmployeeTestimonial(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    employeeTestimonialDetail =
      await employeeTestimonialModel.findByIdAndUpdate(
        req.body.id,
        req.body,
        { new: true } // Return the updated document
      );

    if (!employeeTestimonialDetail) {
      return res.status(404).json({
        errorName: "notFound",
        message: "No Employee Testimonial Details found with the given ID",
      });
    }

    success(
      res,
      "Employee Testimonial Updated Successfully",
      employeeTestimonialDetail
    );
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------ employee testimonial  Delete  ---------------------------------------

async function deleteEmployeeTestimonial(req, res) {
  try {
    const testimonialId = req.body.id;

    if (!testimonialId) {
      return res.status(400).json({
        errorName: "badRequest",
        message: "ID is required",
      });
    }

    // Update the status to "inactive" to soft-delete the business contact
    let employeeTestimonial = await employeeTestimonialModel.findOneAndUpdate(
      { _id: testimonialId, status: "active" },
      { status: "inactive" },
      { new: true } // Return the updated document
    );

    if (!employeeTestimonial) {
      return res.status(404).json({
        errorName: "notFound",
        message: "No active Employee Testimonial found with the given ID",
      });
    }

    success(
      res,
      "Employee Testimonial marked as inactive successfully",
      employeeTestimonial
    );
  } catch (error) {
    unknownError(res, error);
  }
}

module.exports = {
  customerTestimonialAdd,
  getAllCustomerTestimonials,
  getCustomerTestimonial,
  updateCustomerTestimonial,
  deleteCustomerTestimonial,
  addEmployeeTestimonial,
  getAllEmployeeTestimonials,
  getEmployeeTestimonials,
  updateEmployeeTestimonial,
  deleteEmployeeTestimonial,
};
