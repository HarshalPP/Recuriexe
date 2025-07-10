import dynamicFormModel from '../../src/api/v1/models/expense/dynamicForm.model.js';

export async function seedDynamicForms() {
    // Check if already seeded
    const existingCount = await dynamicFormModel.countDocuments();
    if (existingCount > 0) {
        console.log('   📝 Dynamic forms already exist, skipping...');
        return;
    }
    
    const dynamicForms = [
        {
            formId: "FORM_TRAVEL_001",
            organizationId: "ORG_TECHCORP_001",
            name: "Travel Expense Form",
            description: "Comprehensive form for travel-related expenses",
            fields: [
                {
                    fieldId: "field_001",
                    fieldName: "travelType",
                    fieldLabel: "Travel Type",
                    fieldType: "select",
                    isRequired: true,
                    validationRules: {
                        options: ["Domestic", "International"]
                    },
                    displayOrder: 1,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_002",
                    fieldName: "destination",
                    fieldLabel: "Destination",
                    fieldType: "text",
                    isRequired: true,
                    validationRules: {
                        minLength: 2,
                        maxLength: 100
                    },
                    displayOrder: 2,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_003",
                    fieldName: "travelStartDate",
                    fieldLabel: "Travel Start Date",
                    fieldType: "date",
                    isRequired: true,
                    validationRules: {
                        minDate: "today"
                    },
                    displayOrder: 3,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_004",
                    fieldName: "travelEndDate",
                    fieldLabel: "Travel End Date",
                    fieldType: "date",
                    isRequired: true,
                    validationRules: {
                        minDate: "travelStartDate"
                    },
                    displayOrder: 4,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_005",
                    fieldName: "purpose",
                    fieldLabel: "Purpose of Travel",
                    fieldType: "textarea",
                    isRequired: true,
                    validationRules: {
                        minLength: 10,
                        maxLength: 500
                    },
                    displayOrder: 5,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_006",
                    fieldName: "totalAmount",
                    fieldLabel: "Total Amount (INR)",
                    fieldType: "number",
                    isRequired: true,
                    validationRules: {
                        min: 1,
                        max: 500000
                    },
                    displayOrder: 6,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_007",
                    fieldName: "accommodationCost",
                    fieldLabel: "Accommodation Cost",
                    fieldType: "number",
                    isRequired: false,
                    validationRules: {
                        min: 0
                    },
                    displayOrder: 7,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_008",
                    fieldName: "transportationCost",
                    fieldLabel: "Transportation Cost",
                    fieldType: "number",
                    isRequired: false,
                    validationRules: {
                        min: 0
                    },
                    displayOrder: 8,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_009",
                    fieldName: "mealsCost",
                    fieldLabel: "Meals Cost",
                    fieldType: "number",
                    isRequired: false,
                    validationRules: {
                        min: 0
                    },
                    displayOrder: 9,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_010",
                    fieldName: "receipts",
                    fieldLabel: "Upload Receipts",
                    fieldType: "file",
                    isRequired: true,
                    validationRules: {
                        allowedTypes: ["jpg", "jpeg", "png", "pdf"],
                        maxSize: "10MB",
                        maxFiles: 10
                    },
                    displayOrder: 10,
                    conditionalLogic: []
                }
            ],
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            formId: "FORM_OPERATIONAL_001",
            organizationId: "ORG_TECHCORP_001",
            name: "Operational Expense Form",
            description: "Form for operational and office-related expenses",
            fields: [
                {
                    fieldId: "field_001",
                    fieldName: "expenseCategory",
                    fieldLabel: "Expense Category",
                    fieldType: "select",
                    isRequired: true,
                    validationRules: {
                        options: ["Office Supplies", "Utilities", "Maintenance", "Other"]
                    },
                    displayOrder: 1,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_002",
                    fieldName: "vendor",
                    fieldLabel: "Vendor Name",
                    fieldType: "text",
                    isRequired: true,
                    validationRules: {
                        minLength: 2,
                        maxLength: 100
                    },
                    displayOrder: 2,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_003",
                    fieldName: "description",
                    fieldLabel: "Description",
                    fieldType: "textarea",
                    isRequired: true,
                    validationRules: {
                        minLength: 10,
                        maxLength: 500
                    },
                    displayOrder: 3,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_004",
                    fieldName: "amount",
                    fieldLabel: "Amount (INR)",
                    fieldType: "number",
                    isRequired: true,
                    validationRules: {
                        min: 1,
                        max: 100000
                    },
                    displayOrder: 4,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_005",
                    fieldName: "purchaseDate",
                    fieldLabel: "Purchase Date",
                    fieldType: "date",
                    isRequired: true,
                    validationRules: {
                        maxDate: "today"
                    },
                    displayOrder: 5,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_006",
                    fieldName: "receipt",
                    fieldLabel: "Upload Receipt",
                    fieldType: "file",
                    isRequired: true,
                    validationRules: {
                        allowedTypes: ["jpg", "jpeg", "png", "pdf"],
                        maxSize: "5MB",
                        maxFiles: 5
                    },
                    displayOrder: 6,
                    conditionalLogic: []
                }
            ],
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            formId: "FORM_RECURRING_001",
            organizationId: "ORG_TECHCORP_001",
            name: "Recurring Expense Form",
            description: "Form for recurring expenses like subscriptions and insurance",
            fields: [
                {
                    fieldId: "field_001",
                    fieldName: "subscriptionType",
                    fieldLabel: "Subscription Type",
                    fieldType: "select",
                    isRequired: true,
                    validationRules: {
                        options: ["Software License", "Insurance", "Utilities", "Membership", "Other"]
                    },
                    displayOrder: 1,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_002",
                    fieldName: "vendor",
                    fieldLabel: "Vendor/Provider",
                    fieldType: "text",
                    isRequired: true,
                    validationRules: {
                        minLength: 2,
                        maxLength: 100
                    },
                    displayOrder: 2,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_003",
                    fieldName: "frequency",
                    fieldLabel: "Payment Frequency",
                    fieldType: "select",
                    isRequired: true,
                    validationRules: {
                        options: ["Weekly", "Monthly", "Quarterly", "Annually"]
                    },
                    displayOrder: 3,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_004",
                    fieldName: "amount",
                    fieldLabel: "Amount per Payment (INR)",
                    fieldType: "number",
                    isRequired: true,
                    validationRules: {
                        min: 1,
                        max: 50000
                    },
                    displayOrder: 4,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_005",
                    fieldName: "startDate",
                    fieldLabel: "Start Date",
                    fieldType: "date",
                    isRequired: true,
                    validationRules: {},
                    displayOrder: 5,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_006",
                    fieldName: "endDate",
                    fieldLabel: "End Date (Optional)",
                    fieldType: "date",
                    isRequired: false,
                    validationRules: {
                        minDate: "startDate"
                    },
                    displayOrder: 6,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_007",
                    fieldName: "description",
                    fieldLabel: "Description",
                    fieldType: "textarea",
                    isRequired: true,
                    validationRules: {
                        minLength: 10,
                        maxLength: 500
                    },
                    displayOrder: 7,
                    conditionalLogic: []
                }
            ],
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            formId: "FORM_ADVANCE_001",
            organizationId: "ORG_TECHCORP_001",
            name: "Advance Payment Form",
            description: "Form for requesting advance payments",
            fields: [
                {
                    fieldId: "field_001",
                    fieldName: "advanceType",
                    fieldLabel: "Advance Type",
                    fieldType: "select",
                    isRequired: true,
                    validationRules: {
                        options: ["Project Advance", "Travel Advance", "Equipment Purchase", "Other"]
                    },
                    displayOrder: 1,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_002",
                    fieldName: "requestedAmount",
                    fieldLabel: "Requested Amount (INR)",
                    fieldType: "number",
                    isRequired: true,
                    validationRules: {
                        min: 1000,
                        max: 100000
                    },
                    displayOrder: 2,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_003",
                    fieldName: "advanceReason",
                    fieldLabel: "Reason for Advance",
                    fieldType: "textarea",
                    isRequired: true,
                    validationRules: {
                        minLength: 20,
                        maxLength: 1000
                    },
                    displayOrder: 3,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_004",
                    fieldName: "expectedUsageDate",
                    fieldLabel: "Expected Usage Date",
                    fieldType: "date",
                    isRequired: true,
                    validationRules: {
                        minDate: "today"
                    },
                    displayOrder: 4,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_005",
                    fieldName: "justification",
                    fieldLabel: "Business Justification",
                    fieldType: "textarea",
                    isRequired: true,
                    validationRules: {
                        minLength: 50,
                        maxLength: 1000
                    },
                    displayOrder: 5,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_006",
                    fieldName: "supportingDocuments",
                    fieldLabel: "Supporting Documents",
                    fieldType: "file",
                    isRequired: false,
                    validationRules: {
                        allowedTypes: ["pdf", "doc", "docx", "jpg", "png"],
                        maxSize: "10MB",
                        maxFiles: 5
                    },
                    displayOrder: 6,
                    conditionalLogic: []
                }
            ],
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            formId: "FORM_CAPITAL_001",
            organizationId: "ORG_TECHCORP_001",
            name: "Capital Expense Form",
            description: "Form for capital expenditures and asset purchases",
            fields: [
                {
                    fieldId: "field_001",
                    fieldName: "assetCategory",
                    fieldLabel: "Asset Category",
                    fieldType: "select",
                    isRequired: true,
                    validationRules: {
                        options: ["IT Equipment", "Office Infrastructure", "Machinery", "Software", "Other"]
                    },
                    displayOrder: 1,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_002",
                    fieldName: "assetName",
                    fieldLabel: "Asset Name/Description",
                    fieldType: "text",
                    isRequired: true,
                    validationRules: {
                        minLength: 5,
                        maxLength: 200
                    },
                    displayOrder: 2,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_003",
                    fieldName: "vendor",
                    fieldLabel: "Vendor/Supplier",
                    fieldType: "text",
                    isRequired: true,
                    validationRules: {
                        minLength: 2,
                        maxLength: 100
                    },
                    displayOrder: 3,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_004",
                    fieldName: "totalCost",
                    fieldLabel: "Total Cost (INR)",
                    fieldType: "number",
                    isRequired: true,
                    validationRules: {
                        min: 50000,
                        max: 5000000
                    },
                    displayOrder: 4,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_005",
                    fieldName: "depreciationPeriod",
                    fieldLabel: "Depreciation Period (Years)",
                    fieldType: "number",
                    isRequired: true,
                    validationRules: {
                        min: 1,
                        max: 20
                    },
                    displayOrder: 5,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_006",
                    fieldName: "businessJustification",
                    fieldLabel: "Business Justification",
                    fieldType: "textarea",
                    isRequired: true,
                    validationRules: {
                        minLength: 100,
                        maxLength: 2000
                    },
                    displayOrder: 6,
                    conditionalLogic: []
                },
                {
                    fieldId: "field_007",
                    fieldName: "quotations",
                    fieldLabel: "Vendor Quotations",
                    fieldType: "file",
                    isRequired: true,
                    validationRules: {
                        allowedTypes: ["pdf", "doc", "docx", "jpg", "png"],
                        maxSize: "10MB",
                        maxFiles: 10
                    },
                    displayOrder: 7,
                    conditionalLogic: []
                }
            ],
            isActive: true,
            createdBy: "SYSTEM"
        }
    ];
    
    await dynamicFormModel.insertMany(dynamicForms);
    console.log(`   ✅ Inserted ${dynamicForms.length} dynamic forms`);
}
