import { AlarmClock, MapPinHouse, ShoppingCart, Truck } from 'lucide-react';
import React from 'react';

function Footer() {
    return (
        <footer className="bg-neutral-900 text-white px-6 py-10">
            {/* Section hỗ trợ phía trên */}
            <div className="bg-white text-black rounded-md p-6 mb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-2xl"><i className="fa fa-truck"></i></span>
                    <div className='flex gap-2'>
                        <Truck className='size-15'/>
                        <div>
                            <p className="font-bold">VẬN CHUYỂN SIÊU TỐC</p>
                            <p>Vận chuyển nội thành HN trong 2 tiếng!</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="text-green-600 text-2xl"><i className="fa fa-refresh"></i></span>
                    <div className='flex gap-2'>
                        <ShoppingCart className='size-15'/>
                        <div>
                            <p className="font-bold">Đổi hàng</p>
                            <p>Đổi hàng trong 7 ngày miễn phí!</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="text-orange-500 text-2xl"><i className="fa fa-clock-o"></i></span>
                    <div  className='flex gap-2'>
                        <AlarmClock className='size-15'/>
                        <div>
                            <p className="font-bold">Tiết kiệm thời gian</p>
                            <p>Mua sắm dễ hơn khi online</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="text-orange-600 text-2xl"><i className="fa fa-home"></i></span>
                    <div className='flex gap-2'>
                        <MapPinHouse className='size-15'/>
                        <div>
                            <p className="font-bold">ĐỊA CHỈ CỬA HÀNG</p>
                            <p>38, 45 Đồng Me, Mễ Trì, Từ Liêm, HN</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer chính */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {/* Cột 1 */}
                <div>
                    <h4 className="font-semibold text-lg mb-4">THÔNG TIN</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="hover:text-white cursor-pointer">Trang chủ</li>
                        <li className="hover:text-white cursor-pointer">ADIDAS</li>
                        <li className="hover:text-white cursor-pointer">NIKE</li>
                        <li className="hover:text-white cursor-pointer">HÃNG KHÁC</li>
                        <li className="hover:text-white cursor-pointer">PHỤ KIỆN GIÀY DÉP</li>
                        
                    </ul>
                </div>

                {/* Cột 2 */}
                <div>
                    <h4 className="font-semibold text-lg mb-4">DANH MỤC SẢN PHẨM</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="hover:text-white cursor-pointer">Giày nam</li>
                        <li className="hover:text-white cursor-pointer">Giày nữ</li>
                        <li className="hover:text-white cursor-pointer">Adidas Fashion Sneaker - Giày thời trang</li>
                        <li className="hover:text-white cursor-pointer">Giày chạy - giày đi bộ</li>
                        <li className="hover:text-white cursor-pointer">Giày Dép Trẻ Em</li>
                        <li className="hover:text-white cursor-pointer">Giày Bóng rổ</li>
                        <li className="hover:text-white cursor-pointer">Giày Tennis</li>
                    </ul>
                </div>

                {/* Cột 3 */}
                <div>
                    <h4 className="font-semibold text-lg mb-4">CHÍNH SÁCH</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="hover:text-white cursor-pointer">Thông tin điện tử</li>
                        <li className="hover:text-white cursor-pointer">Chính sách vận chuyển</li>
                        <li className="hover:text-white cursor-pointer">Chính sách đổi trả</li>
                        <li className="hover:text-white cursor-pointer">Hướng dẫn đặt hàng</li>
                        <li className="hover:text-white cursor-pointer">Thông tin thanh toán</li>
                        <li className="hover:text-white cursor-pointer">Thông tin về Trung Duc</li>
                    </ul>
                </div>

                {/* Cột 4 */}
                <div>
                    <h4 className="font-semibold text-lg mb-4">FACEBOOK</h4>
                    <a href="#" className="italic text-blue-400 hover:underline">Facebook</a>
                    <div className="mt-3 text-sm text-gray-300 space-y-1">
                        <p><strong>Hộ kinh doanh JAPANBABY</strong></p>
                        <p>MST: 0108369593</p>
                        <p>Do: UBND Quận Nam Từ Liêm cấp ngày 17/07/2018</p>
                        <p>(Sửa đổi ngày 05/11/2023)</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
