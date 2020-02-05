const mongoose = require("mongoose");
const { Schema } = mongoose;

const equipmentSchema = new Schema({
    id: String,
    name: String,
    quality_id: String,
    one_hand: String,
    type_id: String,
    sockets: String,
    ability_id: String,
    fake_item: String,
    set_id: String
});

module.exports = mongoose.model("equipment", equipmentSchema);