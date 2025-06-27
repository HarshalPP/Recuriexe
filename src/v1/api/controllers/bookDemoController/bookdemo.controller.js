import BookDemo from "../../models/BookDemoModel/bookdemo.model.js";
import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js";

// CREATE
export const createBookDemo = async (req, res) => {
  try {
    const {
      fullName,
      workEmail,
      phoneNumber,
      companyName,
      jobTitle,
      industryType,
      numberOfEmployees,
      preferredDemoTimeSlot,
      howDidYouHearAboutUs,
      consent,
      OtherIndustry
    } = req.body;

    const demo = await BookDemo.create({
      fullName,
      workEmail,
      phoneNumber,
      companyName,
      jobTitle,
      industryType,
      OtherIndustry,
      numberOfEmployees,
      preferredDemoTimeSlot,
      howDidYouHearAboutUs,
      consent
    });

    return success(res, "Demo booked successfully", demo);
  } catch (error) {
    return unknownError(res, error);
  }
};

// GET ALL
export const getAllBookDemos = async (req, res) => {
  try {
    const demos = await BookDemo.find().sort({ createdAt: -1 });
    return success(res, "Book demo list fetched", demos);
  } catch (error) {
    return unknownError(res, error);
  }
};

// GET BY ID
export const getBookDemoById = async (req, res) => {
  try {
    const { id } = req.params;
    const demo = await BookDemo.findById(id);
    if (!demo) return notFound(res, "Book demo not found");
    return success(res, "Book demo fetched successfully", demo);
  } catch (error) {
    return unknownError(res, error);
  }
};

// UPDATE
export const updateBookDemo = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await BookDemo.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return notFound(res, "Book demo not found");
    return success(res, "Book demo updated successfully", updated);
  } catch (error) {
    return unknownError(res, error);
  }
};

// DELETE
export const deleteBookDemo = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BookDemo.findByIdAndDelete(id);
    if (!deleted) return notFound(res, "Book demo not found");
    return success(res, "Book demo deleted successfully");
  } catch (error) {
    return unknownError(res, error);
  }
};
