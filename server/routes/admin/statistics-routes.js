const express = require("express");
const {
  getSalesStats,
  getRevenueByMonth,
  getRevenueByRange,
  getRevenueDaily,
  getRevenueWeekly,
  getSoldProducts,
  getImportCostByMonth
} = require("../../controller/admin/statistics-controller");

const router = express.Router();

router.get("/overview", getSalesStats);
router.get("/revenue/monthly", getRevenueByMonth);
router.get("/revenue", getRevenueByRange);

// NEW
router.get("/revenue/daily", getRevenueDaily);
router.get("/revenue/weekly", getRevenueWeekly);
router.get("/revenue/products", getSoldProducts);
router.get("/import-cost", getImportCostByMonth);

module.exports = router;
