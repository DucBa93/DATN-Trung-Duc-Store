const express = require("express");
const { getSalesStats, getRevenueByMonth } = require("../../controller/admin/statistics-controller");

const router = express.Router();

router.get("/overview", getSalesStats);
router.get("/revenue/monthly", getRevenueByMonth);

module.exports = router;
