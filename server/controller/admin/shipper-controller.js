const Shipper = require("../../models/shipper");

// Lấy thông tin shipper
const getShipperInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const shipper = await Shipper.findOne({ userId });
    if (!shipper) return res.status(404).json({ message: "" });
    res.json(shipper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//lay thong tin tât ca shipepr
const getAllShippers = async (req, res) => {
  try {
    const shippers = await Shipper.find().populate({
      path: "userId",
      select: "userName email" // lấy đúng tên shipper + email
    });

    res.json(shippers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Cập nhật hoặc thêm mới
const updateShipperInfo = async (req, res) => {
  try {
    const { userId, phone, bankNumber, bankName } = req.body;
    const qrImage = req.file ? req.file.filename : null;

    const existing = await Shipper.findOne({ userId });
    if (existing) {
      existing.phone = phone || existing.phone;
      existing.bankNumber = bankNumber || existing.bankNumber;
      existing.bankName = bankName || existing.bankName;
      if (qrImage) existing.qrImage = qrImage;
      await existing.save();
      return res.json({ message: "Updated successfully", data: existing });
    } else {
      const newShipper = await Shipper.create({
        userId,
        phone,
        bankNumber,
        bankName,
        qrImage,
      });
      return res.json({ message: "Created successfully", data: newShipper });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getShipperInfo, updateShipperInfo, getAllShippers };
