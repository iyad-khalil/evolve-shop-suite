
import React from 'react';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProducts />
      <CategoryShowcase />
    </div>
  );
};

export default Home;
