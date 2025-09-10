import React from 'react';
import Header from './Header';
import Footer from './Footer';
import FollowingCarousel from './FollowingCarousel';
import FollowingPhotos from './FollowingPhotos';

const User = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <section className="my-4">
        <h2 className="text-xl font-bold px-4">Usuarios que sigues</h2>
        <FollowingCarousel />
      </section>

      <section className="my-4">
        <h2 className="text-xl font-bold px-4">Fotos recientes de tus seguidos</h2>
        
        </section>

      <Footer />
    </div>
  );
};

export default User;
