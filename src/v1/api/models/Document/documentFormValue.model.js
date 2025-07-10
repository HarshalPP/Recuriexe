import mongoose, { Schema, model } from 'mongoose';

const templateValueSchema = new Schema(
    {
        fieldId: {
            type: Schema.Types.ObjectId,
            ref: 'DocumentFormTemplate.fields',
            required: true,
        },
        document: {
            type: String,
            required: true,
        },
    },
    { _id: false }
)

const documentFormValueSchema = new Schema(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        templateId: {
            type: Schema.Types.ObjectId,
            ref: 'DocumentFormTemplate',
            required: true,
        },
        jobPostId: {
            type: Schema.Types.ObjectId,
            ref: 'jobPost',
            required: true,
        },
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: 'jobApplyForm',
            required: true,
        },
        values: [templateValueSchema],
    },
    { timestamps: true }
);

export default model('DocumentFormValue', documentFormValueSchema);