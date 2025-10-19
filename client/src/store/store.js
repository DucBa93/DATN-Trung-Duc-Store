import { configureStore } from '@reduxjs/toolkit'

import authReducer from './auth-slice'
import adminProductsReducer from './admin/products-slice'
import shoppingProductSlice from './shop/products-slice'
import shopCartSlice from "./shop/cart-slice";
import shopReviewSlice from "./shop/review-slice";



/*File store.js = nơi tạo Redux store.

Nó gom tất cả reducer con (authReducer, cartReducer, …) vào một global state.

Sau đó bạn export ra để cung cấp cho toàn bộ ứng dụng.*/

const store = configureStore({
    reducer: {
        auth: authReducer,
        adminProducts: adminProductsReducer,
        shopProducts: shoppingProductSlice,
        shopCart: shopCartSlice,
        shopReview: shopReviewSlice
    },
})

export default store