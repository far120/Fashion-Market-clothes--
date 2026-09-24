// src/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        // 🔥 مهم علشان السعر ميتغيرش بعد الأوردر
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["pending", "processing", "delivered", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);



module.exports = mongoose.model("Order", orderSchema);