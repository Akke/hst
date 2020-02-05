const mongoose = require("mongoose");
const { Schema } = mongoose;

const equipmentTypeSchema = new Schema({
    id: Number,
    name: String
});

module.exports = mongoose.model("equipment_types", equipmentTypeSchema);