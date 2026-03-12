import React from 'react'
import MainBanner from '../component/MainBanner';
import Categories from '../component/Categories';
import BestSeller from '../component/BestSeller';
import BottomBanner from '../component/BottomBanner';

export default function Home() {
  return (
    <div className='mt-10'>
      <MainBanner></MainBanner>
      <Categories></Categories>
      <BestSeller></BestSeller>
      <BottomBanner></BottomBanner>
    </div>
  )
}
