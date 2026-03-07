import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../component/ProductCard';
import { assets } from '../assets/assets';
const AllProducts = () => {
    const { products, searchQuery } = useAppContext();
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (searchQuery.length > 0) {
            setFilteredProducts(
                products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        else {
            setFilteredProducts(products);
        }
    }, [products, searchQuery]);

    return (
        <div className='mt-16 flex flex-col'>
            <div className='flex flex-col items-end w-max'>
                <p className='text-2xl font-medium uppercase'>All Products</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>

            {products.length === 0 ? (
                <div className='flex flex-col items-center justify-center mt-20 py-10'>
                    <img className='w-20 opacity-40' src={assets.box_icon} alt="No Products" />
                    <p className='text-xl text-gray-400 mt-4'>No product available.</p>
                </div>
            ) : filteredProducts.filter((product) => product.inStock).length > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
                    {filteredProducts.filter((product) => product.inStock).map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center mt-20 py-10'>
                    <img className='w-20 opacity-40' src={assets.box_icon} alt="No Products" />
                    <p className='text-xl text-gray-400 mt-4'>No products found matching your search.</p>
                </div>
            )}

        </div>
    )
}

export default AllProducts;
