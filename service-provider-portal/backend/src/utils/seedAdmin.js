// Run with: npm run seed:admin
// Creates a default admin account using ADMIN_* values from .env
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@portal.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const admin = await User.create({
    name: process.env.ADMIN_NAME || "Portal Admin",
    email,
    password: process.env.ADMIN_PASSWORD || "Admin@123",
    role: "admin",
  });

  console.log(`Admin created: ${admin.email} (password: ${process.env.ADMIN_PASSWORD || "Admin@123"})`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
