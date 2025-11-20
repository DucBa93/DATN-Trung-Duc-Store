const express = require("express");
const multer = require("multer");
const { getShipperInfo, updateShipperInfo, getAllShippers } = require("../../controller/admin/shipper-controller");

const router = express.Router();

// Cấu hình lưu file QR
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/qr/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// *** ĐÚNG THỨ TỰ ***
router.get("/", getAllShippers);
router.get("/:userId", getShipperInfo);

// update
router.post("/update", upload.single("qrImage"), updateShipperInfo);

module.exports = router;
