import { configureStore } from '@reduxjs/toolkit'
import userReducer from '@/features/user/userSlice'
import templateReducer from '@/features/template/templateSlice'

const store = configureStore({
    reducer: {
        user: userReducer,
        template: templateReducer
    }
})

export default store