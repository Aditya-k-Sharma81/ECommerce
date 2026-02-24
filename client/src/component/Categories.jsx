import React from 'react'
import {categories} from '../assets/assets';
import {useAppContext} from '../context/AppContext'
const Categories = () => {
  const {navigate} = useAppContext();
  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>Categories</p>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 mt-6 gap-6'>
        {categories.map((category, index)=>{
          return <div onClick={()=>{navigate(`/products/${category.path.toLowerCase()}`); scrollTo(0,0)}} style={{backgroundColor:category.bgColor}} key={index} className='group cursor-pointer flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-lg'>
            <img className='group-hover:scale-108 transition max-w-28' src={category.image}/>
            <p className='text-sm font-medium'>{category.text}</p>
          </div>
        })}
        
      </div>
    </div>
  )
}

export default Categories
