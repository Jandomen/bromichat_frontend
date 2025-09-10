import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import UserSearch from './userProfile/UserSearch';
import CreatePost from './posts/CreatePost';
import FriendsPosts from './posts/FriendsPosts';
import LogoutButton from '../buttons/LogoutButton';
import DashboardVideos from './DashboardVideos';

const Dashboard = () => {
  const [refresh, setRefresh] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6 space-y-6">
        <UserSearch />

        <div className="my-4">
          <CreatePost onPostCreated={() => setRefresh(!refresh)} />
        </div>

        <DashboardVideos />

        <FriendsPosts />

        <div className="mt-6">
          <LogoutButton />
        </div>
      </main>

      <Footer />

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Dashboard;
