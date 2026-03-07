import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext';
import { assets, dummyOrders } from '../../assets/assets';
import toast from 'react-hot-toast';

const Orders = () => {
    const { currency, axios } = useAppContext();
    const [orders, setOrders] = useState([]);
    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                setOrders(data.orders)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const updateStatus = async (event, orderId) => {
        try {
            const { data } = await axios.post('/api/order/status', { orderId, status: event.target.value });
            if (data.success) {
                await fetchOrders();
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, [])

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium">Orders List</h2>
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 w-full text-center border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                            <img className="w-16 h-16 opacity-40" src={assets.box_icon} alt="Empty Orders" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700">No Orders Found</h3>
                        <p className="text-gray-400 mt-2 max-w-sm mx-auto">
                            Customer orders will appear here once they start placing requests. Keep your products updated to attract buyers!
                        </p>
                    </div>
                ) : (
                    orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 ">
                            <div className="flex gap-5 max-w-80">
                                <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                                <div>
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex flex-col">
                                            <p className="font-medium">
                                                {item.product.name}{" "}<span className="text-primary">x {item.quantity}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-sm md:text-base text-black/60">
                                <p className='font-medium mb-1'>{order.address.firstName} {order.address.lastName}</p>
                                <p>{order.address.street}, {order.address.city}</p>
                                <p> {order.address.state}, {order.address.zipcode}, {order.address.country}</p>
                                <p></p>
                                <p>{order.address.phone}</p>
                            </div>

                            <p className="font-medium text-lg my-auto">{currency}{order.amount}</p>

                            <div className="flex flex-col text-sm md:text-base text-black/60">
                                <p>Method: {order.paymentType}</p>
                                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
                            </div>
                            <select
                                onChange={(event) => updateStatus(event, order._id)}
                                value={order.status}
                                disabled={order.status === "Delivered" || order.status === "Cancelled"}
                                className={`p-2 font-semibold border border-gray-300 rounded-md outline-none ${order.status === "Delivered" || order.status === "Cancelled" ? "bg-gray-200 cursor-not-allowed" : "bg-gray-50"}`}
                            >
                                <option value="Order Placed">Order Placed</option>
                                <option value="Packing">Packing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for delivery">Out for delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Orders
