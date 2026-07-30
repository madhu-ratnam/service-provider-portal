const Provider = require("../models/Provider");
const asyncHandler = require("../utils/asyncHandler");

// @desc    List all providers with search, filter, pagination
// @route   GET /api/admin/providers
// @access  Private (admin)
// Query params: search, status, category, page, limit
const getProviders = asyncHandler(async (req, res) => {
  const { search = "", status = "", category = "", page = 1, limit = 10 } = req.query;

  const match = {};
  if (status) match.status = status;
  if (category) match.serviceCategories = category;

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ];

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "user.name": { $regex: search, $options: "i" } },
          { "user.email": { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { "location.city": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await Provider.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  pipeline.push({ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum });
  pipeline.push({
    $project: {
      status: 1,
      phone: 1,
      serviceCategories: 1,
      skills: 1,
      experienceYears: 1,
      location: 1,
      profilePhoto: 1,
      documents: 1,
      rejectionRemarks: 1,
      profileCompleted: 1,
      createdAt: 1,
      updatedAt: 1,
      "user._id": 1,
      "user.name": 1,
      "user.email": 1,
    },
  });

  const providers = await Provider.aggregate(pipeline);

  res.status(200).json({
    success: true,
    providers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

// @desc    Get single provider detail
// @route   GET /api/admin/providers/:id
// @access  Private (admin)
const getProviderById = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id).populate("user", "name email createdAt");
  if (!provider) {
    res.status(404);
    throw new Error("Provider not found");
  }
  res.status(200).json({ success: true, provider });
});

// @desc    Approve a provider application
// @route   PUT /api/admin/providers/:id/approve
// @access  Private (admin)
const approveProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error("Provider not found");
  }

  provider.status = "approved";
  provider.rejectionRemarks = "";
  await provider.save();

  res.status(200).json({ success: true, message: "Provider approved", provider });
});

// @desc    Reject a provider application
// @route   PUT /api/admin/providers/:id/reject
// @access  Private (admin)
const rejectProvider = asyncHandler(async (req, res) => {
  const { remarks } = req.body;

  if (!remarks || !remarks.trim()) {
    res.status(400);
    throw new Error("Rejection remarks are required");
  }

  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error("Provider not found");
  }

  provider.status = "rejected";
  provider.rejectionRemarks = remarks.trim();
  await provider.save();

  res.status(200).json({ success: true, message: "Provider rejected", provider });
});

// @desc    Dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = asyncHandler(async (req, res) => {
  const [statusCounts, categoryCounts, total] = await Promise.all([
    Provider.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Provider.aggregate([
      { $unwind: { path: "$serviceCategories", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$serviceCategories", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Provider.countDocuments(),
  ]);

  const statusMap = { pending: 0, approved: 0, rejected: 0 };
  statusCounts.forEach((s) => {
    statusMap[s._id] = s.count;
  });

  res.status(200).json({
    success: true,
    stats: {
      total,
      pending: statusMap.pending,
      approved: statusMap.approved,
      rejected: statusMap.rejected,
      byCategory: categoryCounts.map((c) => ({ category: c._id, count: c.count })),
    },
  });
});

module.exports = { getProviders, getProviderById, approveProvider, rejectProvider, getStats };
