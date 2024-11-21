const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, trim: true, required: true, unique: true },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  role: { type: String, enum: ["user", "admin", "seller"], default: "user" },
  product: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
