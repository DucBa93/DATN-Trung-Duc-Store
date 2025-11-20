import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchShipperInfo,
  updateShipperInfo,
  clearShipperState,
} from "../../store/shipper/shipper-slice";

function ShipperProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // user từ store
  const { info, loading, error, successMessage } = useSelector(
    (state) => state.shipper
  );

  const [phone, setPhone] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [qrFile, setQrFile] = useState(null);
  const [bankName, setBankName] = useState("");

  useEffect(() => {
    if (user?.id) dispatch(fetchShipperInfo(user.id));
  }, [user]);

  useEffect(() => {
    if (info) {
      setPhone(info.phone || "");
      setBankNumber(info.bankNumber || "");
      setBankName(info.bankName || ""); // ✅ load bankName
    }
  }, [info]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?.id) return;

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("phone", phone);
    formData.append("bankNumber", bankNumber);
    formData.append("bankName", bankName); // ✅ gửi bankName
    if (qrFile) formData.append("qrImage", qrFile);

    dispatch(updateShipperInfo(formData));
  };
  console.log(user);
  console.log("shipper info:", info);

  return (
    <div className="max-w-md  p-6 bg-white shadow rounded w-screen">
      <h2 className="text-xl font-bold mb-4">Thông tin Shipper</h2>

      <p className="pb-1.5">
        <strong>Họ & Tên:</strong> {user?.userName}
      </p>
      <p>
        <strong>Email:</strong> {user?.email}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block font-medium">Số điện thoại</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Tên ngân hàng</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Số tài khoản</label>
          <input
            type="text"
            value={bankNumber}
            onChange={(e) => setBankNumber(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* <div>
          <label className="block font-medium">QR Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setQrFile(e.target.files[0])}
            className="w-full"
          />
        </div> */}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Lưu"}
        </button>
      </form>

      {error && <p className="mt-2 text-red-600">{error}</p>}
      {successMessage && <p className="mt-2 text-green-600">{successMessage}</p>}

      {info?.qrImage && (
        <div className="mt-4">
          <h3 className="font-medium">Your QR Code</h3>
          <img
            src={`/uploads/qr/${info.qrImage}`}
            alt="QR Code"
            className="w-32 h-32 mt-2"
          />
        </div>
      )}
    </div>
  );
}

export default ShipperProfile;
