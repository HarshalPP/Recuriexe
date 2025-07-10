// models/DocumentFormTemplate.js
import mongoose, { Schema, model } from 'mongoose';

// ── sub‑document schema for each field inside the template ──
const templateFieldSchema = new Schema(
  {
    fieldName: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }            // let Mongo generate its own ObjectId for each field
);

// ── main template schema ──
const documentFormTemplateSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    designationId: {
      type: Schema.Types.ObjectId,
      ref: 'newdesignation',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    fields: [templateFieldSchema],   // ← array of sub‑docs
  },
  { timestamps: true }
);

export default model(
  'DocumentFormTemplate',
  documentFormTemplateSchema
);