import React from 'react';
import Header from './Header';
import Footer from './Footer';
import GroupManager from './GroupChat/GroupManager';
import GroupList from './GroupChat/GroupList';

const Group = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-6 w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Grupos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <GroupList />

          <GroupManager />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Group;
