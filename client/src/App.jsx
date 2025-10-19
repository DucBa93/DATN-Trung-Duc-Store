import { Route, Routes } from "react-router-dom"
import Layout from './components/auth/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLayout from "./components/admin_view/layout"
import AdminDashboard from "./pages/admin-view/dashboard"
import AdminFeatures from "./pages/admin-view/features"
import AdminOrders from "./pages/admin-view/orders"
import AdminProducts from "./pages/admin-view/products"
import ShoppingLayout from "./components/shopping-view/layout"
import NotFound from "./pages/not-found"
import ShoppingAccount from "./pages/shopping-view/account"
import ShoppingListing from "./pages/shopping-view/listing"
import ShoppingHome from "./pages/shopping-view/home"
import ShoppingCheckout from "./pages/shopping-view/checkout"
import CheckAuth from "./components/common/check-auth"
import UnauthPage from "./pages/unauth-page"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { checkAuth } from "./store/auth-slice"
import { Skeleton } from "@/components/ui/skeleton"

function App() {

  const {user, isAuthenticated, isLoading} = useSelector(state => state.auth)
  const dispatch = useDispatch()
  useEffect(()=>{
    dispatch(checkAuth())
  },[dispatch])

  if(isLoading) return  <Skeleton className="h-[600px] w-[800px] bg-black" />
  

  return (
    <div className="min-h-screen min-w-screen bg-white">
      
      <Routes>
        <Route path="/auth" element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <Layout/>
          </CheckAuth>
        }
        >
          <Route path="login" element={<Login/>} />
          <Route path="register" element={<Register/>} />
        </Route>
        <Route path="/admin" element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <AdminLayout/>
          </CheckAuth>
        }>
          <Route path="dashboard" element={<AdminDashboard/>}/>
          <Route path="features" element={<AdminFeatures/>}/>
          <Route path="orders" element={<AdminOrders/>}/>
          <Route path="products" element={<AdminProducts/>}/>
        </Route>
        <Route path="/shop" element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <ShoppingLayout/>
          </CheckAuth>
        }>
          <Route path="account" element={<ShoppingAccount/>}/>
          <Route path="listing" element={<ShoppingListing/>}/>
          <Route path="home" element={<ShoppingHome/>}/>
          <Route path="checkout" element={<ShoppingCheckout/>}/>
        </Route>
        <Route path="unauth-page" element={<UnauthPage/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </div>
  )
}

export default App
