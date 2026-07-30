const multer = require("multer");
const path = require("path");
const fs = require("fs");

const makeStorage = (subfolder) => {
  const dest = path.join(__dirname, "..", "..", "uploads", subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${req.user._id}-${uniqueSuffix}${ext}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only images (jpg, png, webp) and PDF files are allowed"));
};

const uploadPhoto = multer({
  storage: makeStorage("photos"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    if (extOk) return cb(null, true);
    cb(new Error("Only image files (jpg, png, webp) are allowed for profile photo"));
  },
});

const uploadDocuments = multer({
  storage: makeStorage("documents"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

module.exports = { uploadPhoto, uploadDocuments };
