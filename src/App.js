import "./tailwind.css";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/userProfile/UserProfile";
import Profile from "./components/Profile";
import Messages from "./components/Messages";
import Group from "./components/Group";
import Videos from "./components/Videos";
import VideoDetail from "./components/videos/VideoDetail";
import Gallery from "./components/Gallery";
import Shop from "./components/Shop";
import Notifications from "./components/Notifications";
import Settings from "./components/Settings";
import ChatComponent from "./components/messages/ChatComponent";
import GroupDetails from "./components/GroupChat/GroupDetails";
import GroupEdit from "./components/GroupChat/GroupEdit";
import GroupChat from "./components/GroupChat/GroupChat";
import FriendsList from "./components/friends/FriendsList";
import FollowersList from "./components/friends/FollowersList";
import FollowingList from "./components/friends/FollowingList";
import BlockedUsersList from "./components/Settings/BlockedUsersList";
import PostDetail from "./components/posts/PostDetail";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./middlewares/ProtectedRoute";

function ChatRouteWrapper() {
  const { conversationId } = useParams();
  return <ChatComponent conversationId={conversationId} />;
}

function GroupChatRouteWrapper() {
  const { groupId } = useParams();
  return <GroupChat groupId={groupId} />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Group />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute>
              <GroupDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/edit"
          element={
            <ProtectedRoute>
              <GroupEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/group/:groupId"
          element={
            <ProtectedRoute>
              <GroupChatRouteWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <ChatRouteWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:userId"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:userId/friends"
          element={
            <ProtectedRoute>
              <FriendsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:userId/followers"
          element={
            <ProtectedRoute>
              <FollowersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:userId/following"
          element={
            <ProtectedRoute>
              <FollowingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/blocked"
          element={
            <ProtectedRoute>
              <BlockedUsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos/:videoId"
          element={
            <ProtectedRoute>
              <VideoDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:postId"
          element={
            <ProtectedRoute>
              <PostDetail />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}