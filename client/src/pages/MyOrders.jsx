import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext';
import { dummyOrders } from '../assets/assets';

const MyOrders = () => {

    const [myOrders, setMyOrders] = useState([]);
    const { currency, user, axios } = useAppContext();

    const fetchMyOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/user');
            if (data.success) {
                setMyOrders(data.orders)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const cancelOrder = async (orderId) => {
        try {
            const { data } = await axios.post('/api/order/cancel', { orderId });
            if (data.success) {
                fetchMyOrders();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (user) {
            fetchMyOrders();
        }
    }, [user])

    return (
        <div className='mt-16 pb-16'>
            <div className='flex flex-col items-end w-max mb-8'>
                <p className='text-2xl font-medium uppercase'>My Orders</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>
            {myOrders.map((order, index) => (
                <div key={index} className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl">
                    <p className='flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col'>
                        <span>OrderId : {order._id}</span>
                        <span>Payment : {order.paymentType}</span>
                        <span>Total Amount : {currency}{order.amount}</span>
                    </p>
                    {order.items.map((item, index) => (
                        <div key={index} className={`relative bg-white text-gray-500/70 ${order.items.length !== index + 1 && "border-b"
                            } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}>
                            <div className='flex items-center mb-4 md:mb-0'>
                                <div className="bg-primary/10 p-4 rounded-lg">
                                    <img className='w-16 h-16' src={item.product?.image?.[0]} />
                                </div>
                                <div className='ml-4'>
                                    <h2 className='text-xl font-medium text-gray-800'>{item.product.name}</h2>
                                    <p>Category: {item.product.category}</p>
                                </div>
                            </div>
                            <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
                                <p>Quantity: {item.quantity}</p>
                                <p className='flex items-center gap-2'>
                                    <span className={`w-2 h-2 rounded-full ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                    <span className='font-medium'>{order.status}</span>
                                </p>
                                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                {order.status === "Order Placed" && (
                                    <button
                                        onClick={() => cancelOrder(order._id)}
                                        className='mt-2 text-sm text-red-500 hover:text-red-700 font-medium underline cursor-pointer w-fit'
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                            <p className='text-primary text-lg font-medium'>Amount: {currency}{item.product.offerPrice * item.quantity}</p>
                        </div>
                    ))}
                    {/* Status Stepper */}
                    {order.status !== 'Cancelled' && (
                        <div className='mt-6 px-4 py-8 border-t border-gray-100'>
                            <div className='flex items-center justify-between relative'>
                                {['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'].map((step, sIdx) => {
                                    const statuses = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'];
                                    const currentIdx = statuses.indexOf(order.status);
                                    const isCompleted = sIdx <= currentIdx;
                                    const isCurrent = sIdx === currentIdx;

                                    return (
                                        <div key={sIdx} className='flex flex-col items-center flex-1 relative z-10'>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors duration-300 ${isCompleted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                {isCompleted ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <span className='text-xs font-bold'>{sIdx + 1}</span>
                                                )}
                                            </div>
                                            <p className={`text-[10px] md:text-xs font-medium text-center ${isCurrent ? 'text-primary' : 'text-gray-400'}`}>
                                                {step}
                                            </p>
                                            {/* Connector Line */}
                                            {sIdx < 4 && (
                                                <div className={`absolute left-1/2 top-4 w-full h-0.5 -z-10 ${sIdx < currentIdx ? 'bg-primary' : 'bg-gray-100'}`}></div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default MyOrders
