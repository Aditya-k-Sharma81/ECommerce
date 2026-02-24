import React from 'react'
import Navbar from './component/Navbar';
import Home from './pages/Home';
import {Toaster} from 'react-hot-toast'
import {Routes, Route, useLocation} from 'react-router-dom';
import Footer from './component/Footer';
import Login from './component/Login';
import {useAppContext} from './context/AppContext'
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import SellerLogin from './component/seller/SellerLogin';
import Seller_Layout from './pages/seller/Seller_Layout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import Loading from './pages/Loading';

export default function App() 
{
  const isSellerPath = useLocation().pathname.includes("seller");
  const {showUserLogin, isSeller} = useAppContext();
  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
        {isSellerPath ? null : <Navbar></Navbar>}
        {showUserLogin ? <Login></Login> : null}
        <Toaster/>
        <div className={`${isSellerPath ? "":"px-6 md:px-16 lg:px-24 xl:px-32"}`}>
          <Routes>
            <Route path='/' element={<Home></Home>}></Route>
            <Route path='/products' element={<AllProducts/>}></Route>
            <Route path='/products/:category' element={<ProductCategory></ProductCategory>}></Route>
            <Route path='/products/:category/:id' element={<ProductDetails/>}></Route>
            <Route path='/cart' element={<Cart/>}></Route>
            <Route path='/add-address' element={<AddAddress/>}></Route>
            <Route path='/my-orders' element={<MyOrders/>}></Route>
            <Route path='/loader' element={<Loading/>}></Route>
            <Route path='seller' element={isSeller ? <Seller_Layout/> : <SellerLogin/>}>
                <Route index element={isSeller ? <AddProduct/>:null}></Route>
                <Route path='product-list' element={<ProductList/>}></Route>
                <Route path='orders' element={<Orders/>}></Route>
            </Route>
            
          </Routes>
        </div>
        {isSellerPath ? null : <Footer></Footer>}
    </div>
  )
}
