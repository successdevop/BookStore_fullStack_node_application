const mongoose = require("mongoose");

const changePriceSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
    },
    userId: {
      type: String,
      required: true,
    },
    bookId: {
      type: String,
      unique: true,
      required: true,
    },
    newPrice: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      trim: true,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const ChangePrice = mongoose.model("ChangePrice", changePriceSchema);
module.exports = ChangePrice;
