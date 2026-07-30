const express = require("express");
const {
  getProviders,
  getProviderById,
  approveProvider,
  rejectProvider,
  getStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/providers", getProviders);
router.get("/providers/:id", getProviderById);
router.put("/providers/:id/approve", approveProvider);
router.put("/providers/:id/reject", rejectProvider);
router.get("/stats", getStats);

module.exports = router;
