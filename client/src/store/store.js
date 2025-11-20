import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminOrderSlice from "./admin/order-slice";
import shipperSlice from "./shipper/shipper-slice";

import shopProductsSlice from "./shop/products-slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";
import shopCouponSlice from "./shop/coupon-slice";
import userReducer from "./shop/user-slice";
import commonFeatureSlice from "./common-slice";
import notificationSlice from "./shop/notify-slice/index";

const store = configureStore({
  reducer: {
    auth: authReducer,

    adminProducts: adminProductsSlice,
    adminOrder: adminOrderSlice,

    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,
    shopReview: shopReviewSlice,
    user: userReducer,
    coupons: shopCouponSlice,
    shipper: shipperSlice,
    notification: notificationSlice,

    commonFeature: commonFeatureSlice,
  },
});

export default store;