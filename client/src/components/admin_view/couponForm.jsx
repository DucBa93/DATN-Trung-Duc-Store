import { Modal, Form, Input, InputNumber, DatePicker, Switch } from "antd";
import dayjs from "dayjs";

function CouponForm({ open, onCancel, onSubmit, initialValues }) {
    const [form] = Form.useForm();

    return (
        <Modal
            open={open}
            title={initialValues ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
            okText="Lưu"
            cancelText="Hủy"
            onCancel={onCancel}
            onOk={() => form.submit()}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={
                    initialValues
                        ? {
                            ...initialValues,
                            expiry: dayjs(initialValues.expiry),
                        }
                        : {}
                }
                onFinish={(values) =>
                    onSubmit({
                        ...values,
                        expiry: values.expiry.toDate(),
                    })
                }

            >
                <Form.Item label="Mã Coupon" name="code" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item
    
                    label="Phần trăm giảm"
                    name="discountPercentage"
                    rules={[{ required: true }]}
                >
                    <InputNumber min={1} max={90} className="w-full" />
                </Form.Item>

                <Form.Item label="Giảm tối đa" name="maxDiscount">
                    <InputNumber min={0} className="w-full" />
                </Form.Item>

                <Form.Item label="Đơn tối thiểu" name="minimumAmount">
                    <InputNumber min={0} className="w-full" />
                </Form.Item>

                <Form.Item label="Ngày hết hạn" name="expiry" rules={[{ required: true }]}>
                    <DatePicker showTime className="w-full" />
                </Form.Item>

                <Form.Item label="Giới hạn lượt dùng" name="usageLimit">
                    <InputNumber min={1} className="w-full" />
                </Form.Item>

                <Form.Item label="Nổi bật (HOT)" name="isHot" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CouponForm;
