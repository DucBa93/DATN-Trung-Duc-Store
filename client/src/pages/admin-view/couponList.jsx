import { useEffect, useState } from "react";
import { Table, Button, Tag, Popconfirm, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCoupons,
  deleteCoupon,
  createCoupon,
  updateCoupon,
} from "@/store/shop/coupon-slice";
import CouponForm from "@/components/admin_view/couponForm";
import dayjs from "dayjs";

function CouponList() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.coupons);

  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // 🔄 Lấy danh sách mã giảm giá khi load
  useEffect(() => {
  dispatch(fetchAllCoupons());
  const interval = setInterval(() => {
    dispatch(fetchAllCoupons());
  }, 10000); // mỗi 10s

  return () => clearInterval(interval);
}, [dispatch]);


  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      render: (t) => <span className="font-bold text-blue-600">{t}</span>,
    },
    {
      title: "% Giảm",
      dataIndex: "discountPercentage",
      render: (v) => <Tag color="green">{v}%</Tag>,
    },
    {
      title: "HSD",
      dataIndex: "expiry",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "HOT",
      dataIndex: "isHot",
      render: (v) => (v ? <Tag color="red">HOT</Tag> : <Tag>-</Tag>),
    },
    {
      title: "Lượt SD",
      render: (_, r) => `${r.usedCount}/${r.usageLimit}`, // ✅ chống undefined
    },
    {
      title: "Trạng thái",
      render: (_, r) =>
        new Date(r?.expiry ??0 ) < new Date() ? (
          <Tag color="gray">Hết hạn</Tag>
        ) : (
          <Tag color="blue">Hiệu lực</Tag>
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditData(record);
              setOpenForm(true);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xoá mã giảm giá này ?"
            onConfirm={() => dispatch(deleteCoupon(record._id))}
          >
            <Button danger size="small">
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ✅ Khi submit form thêm/sửa
  const handleSubmit = async (values) => {
  const payload = {
    ...values,
    code: values.code?.toUpperCase(),
    usedCount: editData?.usedCount ?? 0,
    usageLimit: values.usageLimit ?? editData?.usageLimit ?? 1,
    status: editData?.status ?? "active",
  };

  if (editData) {
    dispatch(updateCoupon({ id: editData._id, data: payload }));
  } else {
    dispatch(createCoupon(payload));
  }

  setOpenForm(false);
  setEditData(null);
};


  return (
    <div className="p-5">
      <div className="flex justify-between mb-3">
        <h2 className="text-xl font-bold">Quản lý mã giảm giá</h2>
        <Button type="primary" onClick={() => setOpenForm(true)}>
          Thêm mã
        </Button>
      </div>

      <Table dataSource={list} columns={columns} rowKey="_id" />

      <CouponForm
        open={openForm}
        onCancel={() => {
          setOpenForm(false);
          setEditData(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editData}
      />
    </div>
  );
}

export default CouponList;
