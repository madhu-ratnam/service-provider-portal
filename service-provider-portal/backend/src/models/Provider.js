const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phone: { type: String, trim: true },
    serviceCategories: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0, default: 0 },
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    profilePhoto: { type: String, default: "" },
    documents: [documentSchema],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionRemarks: { type: String, default: "" },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

providerSchema.index({ status: 1 });
providerSchema.index({ serviceCategories: 1 });

module.exports = mongoose.model("Provider", providerSchema);
