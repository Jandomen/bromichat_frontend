import React from 'react';
import Header from './Header';
import Footer from './Footer';
import UserSearch from './userProfile/UserSearch';
import CreatePost from '../components/posts/CreatePost';
import PostList from './posts/PostList';
import LogoutButton from '../buttons/LogoutButton';
import CurrentUserInfo from './friends/CurrentUserInfo';

const Profile = () => {
  const [refresh, setRefresh] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto p-4">
          <CurrentUserInfo />
        </div>

        <UserSearch />

        <div className="container mx-auto p-4">
          <CreatePost onPostCreated={() => setRefresh(!refresh)} />
          <PostList refresh={refresh} />
        </div>

        <div className="flex justify-center my-4">
          <LogoutButton />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
