// routes/adminAuth.js
const { Router } = require("express");
const Admin = require("../models/Admin");

const r = Router();

r.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email, password });
  if (!admin) {
    return res.status(401).json({ ok: false, message: "Invalid credentials" });
  }
  res.json({ ok: true, message: "Login successful" });
});

module.exports = r;
