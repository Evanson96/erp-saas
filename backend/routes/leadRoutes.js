const express = require("express");
const { createLead } = require("../controllers/leadController");

const router = express.Router();

router.post("/", createLead);

module.exports = router;
