import React from 'react'
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
const ProductList = () => {
    const { products, currency, axios, fetchProducts } = useAppContext();
    const toggleStock = async (id, inStock) => {
        try {
            const { data } = await axios.post('/api/product/stock', { id, inStock });
            if (data.success) {
                fetchProducts();
                toast.success(data.message);
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-lg font-medium">All Products</h2>
                <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 w-full text-center">
                            <div className="bg-slate-100 p-6 rounded-full mb-4">
                                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-600">No products added yet</h3>
                            <p className="text-slate-400 mt-2 max-w-xs">You haven't added any products to your store. Start adding them to see them here.</p>
                            <button onClick={() => window.location.href = '/seller'} className="mt-6 px-6 py-2 bg-primary text-white rounded font-medium hover:bg-primary-dull transition-colors cursor-pointer">
                                Add Your First Product
                            </button>
                        </div>
                    ) : (
                        <table className="md:table-auto table-fixed w-full overflow-hidden">
                            <thead className="text-gray-900 text-sm text-left">
                                <tr>
                                    <th className="px-4 py-3 font-semibold truncate">Product</th>
                                    <th className="px-4 py-3 font-semibold truncate">Category</th>
                                    <th className="px-4 py-3 font-semibold truncate hidden md:block">Selling Price</th>
                                    <th className="px-4 py-3 font-semibold truncate">In Stock</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-500">
                                {products.map((product) => (
                                    <tr key={product._id} className="border-t border-gray-500/20">
                                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                            <div className="border border-gray-300 rounded overflow-hidden">
                                                <img src={product.image[0]} alt="Product" className="w-16" />
                                            </div>
                                            <span className="truncate max-sm:hidden w-full">{product.name}</span>
                                        </td>
                                        <td className="px-4 py-3">{product.category}</td>
                                        <td className="px-4 py-3 max-sm:hidden">{currency}{product.offerPrice}</td>
                                        <td className="px-4 py-3">
                                            <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                                <input onClick={() => toggleStock(product._id, !product.inStock)} checked={product.inStock} type="checkbox" className="sr-only peer" />
                                                <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                                                <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductList
