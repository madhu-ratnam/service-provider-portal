const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  uploadDocuments,
  deleteDocument,
  getMyStatus,
} = require("../controllers/providerController");
const { protect, authorize } = require("../middleware/auth");
const { uploadPhoto, uploadDocuments: uploadDocsMw } = require("../middleware/upload");

const router = express.Router();

router.use(protect, authorize("provider"));

router.get("/profile", getMyProfile);
router.put("/profile", updateMyProfile);
router.post("/upload-photo", uploadPhoto.single("photo"), uploadProfilePhoto);
router.post("/upload-documents", uploadDocsMw.array("documents", 5), uploadDocuments);
router.delete("/documents/:docId", deleteDocument);
router.get("/status", getMyStatus);

module.exports = router;
