import { model, Schema } from 'mongoose';

const fieldSchema = new Schema({
    fieldId: {
        type: String,
        required: true
    },
    fieldName: {
        type: String,
        required: true
    },
    fieldType: {
        type: String,
        enum: ['text', 'number', 'date', 'datetime', 'select', 'multiselect', 'checkbox', 'radio', 'textarea', 'file', 'email', 'phone', 'currency'],
        required: true
    },
    label: {
        type: String,
        required: true
    },
    placeholder: {
        type: String,
        default: ""
    },
    isRequired: {
        type: Boolean,
        default: false
    },
    validation: {
        min: {
            type: Number,
            default: null
        },
        max: {
            type: Number,
            default: null
        },
        minLength: {
            type: Number,
            default: null
        },
        maxLength: {
            type: Number,
            default: null
        },
        pattern: {
            type: String,
            default: ""
        },
        customValidation: {
            type: String,
            default: ""
        }
    },
    options: [{
        label: String,
        value: String
    }],
    conditionalLogic: {
        showIf: {
            fieldId: String,
            operator: {
                type: String,
                enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains']
            },
            value: Schema.Types.Mixed
        }
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    defaultValue: {
        type: Schema.Types.Mixed,
        default: null
    },
    helpText: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const dynamicFormSchema = new Schema({
    formId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    organizationId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    fields: [fieldSchema],
    formSettings: {
        allowMultipleSubmissions: {
            type: Boolean,
            default: true
        },
        saveDraft: {
            type: Boolean,
            default: true
        },
        showProgressBar: {
            type: Boolean,
            default: false
        },
        customCSS: {
            type: String,
            default: ""
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        default: 1
    },
    schemaVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

dynamicFormSchema.index({ organizationId: 1, isActive: 1 });

const dynamicFormModel = model("dynamicForm", dynamicFormSchema);
export default dynamicFormModel;
