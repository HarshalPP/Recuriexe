const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const milkIncomeSchema = new Schema(
  {
    employeeId: [{ type: ObjectId, default: null }],
    customerId: { type: ObjectId, default: null },
    approvalEmployeeId:       { type: ObjectId , default :null },

    milkDocument: { type: [String] , default : []},
    LD: { type: String, default: "" },
    
    DoingFromNoOfYears: { type: String, default: "" }, // Number of years doing the business
    NameOfDairy: { type: String, default: "" }, // Name of the dairy
    NameOfDairyOwner: { type: String, default: "" }, // Name of dairy owner
    NoOfCattles: { type: String, default: "" }, // Number of cattle owned
    NoOfMilkGivingCattles: { type: String, default: "" }, // Number of milk-producing cattle
    adressOfDairy: { type: String, default: "" }, // Address of the dairy
    averageDailyMilkQuantity: { type: String, default: "" }, // Average daily milk quantity in liters
    contactDetailsOfDairyOwnerIfAvailable: { type: String, default: "" }, // Dairy owner's contact details
    expensesAtMilkBuisness: { type: String, default: "" }, // Monthly expenses for the milk business
    expensesOfMilkBuisness: { type: String, default: "" }, // Additional or other expenses for the milk business
    incomeType2: { type: String, default: "" }, // Secondary income type
    milkDistribution: { type: String, default: "" }, // Milk distribution method
    milkProvidingToAboveDairy: { type: String, default: "" }, // Is milk provided to the above dairy?
    milkProvingToDairy: { type: String, default: "" }, // Any other dairy where milk is provided
    monthlyIncomeMilkBuisness: { type: String, default: "" }, // Monthly income from the milk business
    noOfYears: { type: String, default: "" }, // Additional years in business
    yearlyIncomeMilkBuisness: { type: String, default: "" }, 


    remarkByBranchVendor: { type: String, default: "" },
    remarkByApproval: { type: String, default: "" },
    approvalDate: { type: String, default: "" },
    completeDate: { type: String, default: "" },
    status: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },
    fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},
  },
  {
    timestamps: true,
  }
);

const milkIncomeModel = mongoose.model("milkIncome", milkIncomeSchema);

module.exports = milkIncomeModel;
