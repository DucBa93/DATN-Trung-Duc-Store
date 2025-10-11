import { configureStore } from '@reduxjs/toolkit'

import authReducer from './auth-slice'
import adminProductsReducer from './admin/products-slice'

/*File store.js = nơi tạo Redux store.

Nó gom tất cả reducer con (authReducer, cartReducer, …) vào một global state.

Sau đó bạn export ra để cung cấp cho toàn bộ ứng dụng.*/

const store = configureStore({
    reducer: {
        auth: authReducer,
        adminProducts: adminProductsReducer
    },
})

export default store