const Provider = require("../models/Provider");
const asyncHandler = require("../utils/asyncHandler");

const ensureEditable = (provider) => {
  if (provider.status === "approved") {
    const err = new Error("Your application is already approved and can no longer be edited");
    err.statusCode = 400;
    throw err;
  }
};

// @desc    Get logged-in provider's own profile
// @route   GET /api/provider/profile
// @access  Private (provider)
const getMyProfile = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id }).populate("user", "name email");
  if (!provider) {
    res.status(404);
    throw new Error("Provider profile not found");
  }
  res.status(200).json({ success: true, provider });
});

// @desc    Create/update provider profile
// @route   PUT /api/provider/profile
// @access  Private (provider)
const updateMyProfile = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) {
    res.status(404);
    throw new Error("Provider profile not found");
  }

  ensureEditable(provider);

  const { phone, serviceCategories, skills, experienceYears, location } = req.body;

  if (phone !== undefined) provider.phone = phone;
  if (serviceCategories !== undefined) provider.serviceCategories = serviceCategories;
  if (skills !== undefined) provider.skills = skills;
  if (experienceYears !== undefined) provider.experienceYears = experienceYears;
  if (location !== undefined) provider.location = { ...provider.location, ...location };

  // If a rejected provider edits their profile, resubmit as pending
  if (provider.status === "rejected") {
    provider.status = "pending";
    provider.rejectionRemarks = "";
  }

  provider.profileCompleted = Boolean(
    provider.phone &&
      provider.serviceCategories?.length &&
      provider.skills?.length &&
      provider.location?.city
  );

  await provider.save();

  res.status(200).json({ success: true, message: "Profile updated", provider });
});

// @desc    Upload profile photo
// @route   POST /api/provider/upload-photo
// @access  Private (provider)
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) {
    res.status(404);
    throw new Error("Provider profile not found");
  }
  ensureEditable(provider);

  if (!req.file) {
    res.status(400);
    throw new Error("Please attach an image file");
  }

  provider.profilePhoto = `/uploads/photos/${req.file.filename}`;
  await provider.save();

  res.status(200).json({ success: true, message: "Profile photo uploaded", profilePhoto: provider.profilePhoto });
});

// @desc    Upload verification documents (multiple)
// @route   POST /api/provider/upload-documents
// @access  Private (provider)
const uploadDocuments = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) {
    res.status(404);
    throw new Error("Provider profile not found");
  }
  ensureEditable(provider);

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("Please attach at least one document");
  }

  const newDocs = req.files.map((file) => ({
    name: file.originalname,
    path: `/uploads/documents/${file.filename}`,
  }));

  provider.documents.push(...newDocs);
  await provider.save();

  res.status(200).json({ success: true, message: "Documents uploaded", documents: provider.documents });
});

// @desc    Delete a single uploaded document
// @route   DELETE /api/provider/documents/:docId
// @access  Private (provider)
const deleteDocument = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) {
    res.status(404);
    throw new Error("Provider profile not found");
  }
  ensureEditable(provider);

  provider.documents = provider.documents.filter((doc) => doc._id.toString() !== req.params.docId);
  await provider.save();

  res.status(200).json({ success: true, message: "Document removed", documents: provider.documents });
});

// @desc    Get application status
// @route   GET /api/provider/status
// @access  Private (provider)
const getMyStatus = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id }).select(
    "status rejectionRemarks profileCompleted createdAt updatedAt"
  );
  if (!provider) {
    res.status(404);
    throw new Error("Provider profile not found");
  }
  res.status(200).json({ success: true, ...provider.toObject() });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  uploadDocuments,
  deleteDocument,
  getMyStatus,
};
