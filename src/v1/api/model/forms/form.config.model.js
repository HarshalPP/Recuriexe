const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const formConfigModel = new Schema(
    {
        formConfigId: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        formName: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        defaultL1: {
            type: ObjectId,
            ref: "employee"
        },
        defaultL2: {
            type: ObjectId,
            ref: "employee"
        },
        defaultL3: {
            type: ObjectId,
            ref: "employee"
        },
        managementEmployee: {
            type: ObjectId,
            ref: "employee"
        },
        viewer: [{
            type: ObjectId,
            ref: "newBranch"
        }],
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: ObjectId,
            ref: "employee"
        },
        updatedBy: {
            type: ObjectId,
            ref: "employee"
        }
    },
    {
        timestamps: true,
    }
);
// Pre-save middleware to generate the assetId automatically
formConfigModel.pre('validate', async function (next) {
    const doc = this;

    if (!doc.formConfigId) {
        try {
            const latestFormConfig = await mongoose.model('formConfig').findOne({}, {}, { sort: { 'createdAt': -1 } });
            console.log('latestFormConfig', latestFormConfig);

            let nextSeq = 1;

            if (latestFormConfig && latestFormConfig.formConfigId) {
                const lastSeq = parseInt(latestFormConfig.formConfigId.replace('FINCON', ''), 10);
                nextSeq = lastSeq + 1;
            }
            doc.formConfigId = 'FINCON' + nextSeq.toString().padStart(4, '0');
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});



const formConfigDetail = mongoose.model('formConfig', formConfigModel);

module.exports = formConfigDetail;
