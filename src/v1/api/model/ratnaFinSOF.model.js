const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const growMoneySOFSchema = new Schema({
    state: { type: String }, // State
    location: { type: String }, // Location
    crop: { type: String }, // Crop
    consideredForKcc: { type: String, enum: ['Yes', 'No'] }, // Considered For Kcc(Yes/No)
    newCocPerAcre: { type: Number }, // New Coc (`/Acres)
    newCocFor30AndKccPlus: { type: Number }, // New Coc For 30% And Kcc Plus v Acres Coc)
    newYield: { type: Number }, // New Yield v
    newMarketPricePerQuintal: { type: Number }, // New Market Price (`/Quintal)
    newNetIncome: { type: Number }, // New Net Income
    sowingMonth: { type: String }, // Sowing Month
    harvestMonth: { type: String }, // Harvest Month
    duration: { type: String }, // Duration
}, 
{
    timestamps: true,
});

const growMoneySOFModel = mongoose.model('ratnaFinSOFSheet', growMoneySOFSchema);

module.exports = growMoneySOFModel;
