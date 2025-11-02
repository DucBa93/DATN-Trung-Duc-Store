// server/routes/shop/user-routes.js
const express = require("express");
const router = express.Router();
const { updateUser, updatePassword, uploadAvatar } = require("../../controller/shop/user-controller");
const upload = require("../../middleware/upload"); // multer middleware (see below)

// PUT /api/shop/user/update
router.put("/update", updateUser);

// PUT /api/shop/user/update-password
router.put("/update-password", updatePassword);

// POST /api/shop/user/upload-avatar  (multipart/form-data, field name 'avatar')
router.post("/upload-avatar", upload.single("avatar"), uploadAvatar);

module.exports = router;
