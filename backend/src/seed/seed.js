import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDb } from "../utils/connectDb.js";
import { Doctor } from "../models/Doctor.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Department } from "../models/Department.js";
import { Announcement } from "../models/Announcement.js";
import { Holiday } from "../models/Holiday.js";
import { doctors, products } from "./seedData.js";

dotenv.config();

await connectDb();

await Doctor.deleteMany({});
await Product.deleteMany({});
await User.deleteMany({});
await Department.deleteMany({});
await Announcement.deleteMany({});
await Holiday.deleteMany({});

await Doctor.insertMany(doctors);
await Product.insertMany(products);

// Seed accounts
const adminPass = await bcrypt.hash("Admin@123", 10);
const doctorPass = await bcrypt.hash("Doctor@123", 10);

await User.create({
  name: "System Admin",
  email: "admin@gov.in",
  phone: "9999999999",
  passwordHash: adminPass,
  role: "admin",
});

await User.create({
  name: "Dr. S. Kumar",
  email: "doctor1@gov.in",
  phone: "9000000001",
  passwordHash: doctorPass,
  role: "doctor",
});

await User.create({
  name: "Dr. A. Priya",
  email: "doctor2@gov.in",
  phone: "9000000002",
  passwordHash: doctorPass,
  role: "doctor",
});

await Department.insertMany([
  { name: "General Medicine", code: "GEN", description: "OPD - General" },
  { name: "Gynecology", code: "GYN", description: "Women health" },
  { name: "Pediatrics", code: "PED", description: "Children OPD" },
]);

await Announcement.create({
  title: "OPD Timings",
  message: "OPD available Mon-Sat 9:00AM to 4:00PM. Carry Aadhaar / ID card.",
  isActive: true,
});

console.log("✅ Seeded doctors + products + users (admin/doctor)");
process.exit(0);
