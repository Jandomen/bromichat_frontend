import "./tailwind.css";
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./components/VerifyEmail";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/userProfile/UserProfile";
import Profile from "./components/Profile";
import Messages from "./components/Messages";
import Groups from "./pages/Groups/Groups";
import GroupProfile from "./pages/Groups/GroupProfile";
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
import SavedPosts from "./components/posts/SavedPosts";
import NotFound from "./components/NotFound";
import SearchUsers from "./pages/SearchUsers";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import ProtectedRoute from "./middlewares/ProtectedRoute";
import AdminRoute from "./middlewares/AdminRoute";
import ToastContainer from "./components/UI/ToastContainer";
import ConfirmModal from "./components/UI/ConfirmModal";
import CallModal from "./components/calls/CallModal";
import PostDetailModal from "./components/posts/PostDetailModal";
import MobileNav from "./components/UI/MobileNav";
import NetworkStatus from "./components/UI/NetworkStatus";
import Terms from "./pages/Static/Terms";
import Privacy from "./pages/Static/Privacy";
import Support from "./pages/Static/Support";

function ChatRouteWrapper() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  return (
    <div className="h-screen w-full">
      <ChatComponent
        conversationId={conversationId}
        onBack={() => navigate("/messages")}
      />
    </div>
  );
}

function GroupChatRouteWrapper() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  return (
    <div className="h-screen w-full">
      <GroupChat
        groupId={groupId}
        onBack={() => navigate("/groups")}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin" element={<AdminLogin />} />

        
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
          path="/messages/:conversationId"
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
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute>
              <GroupProfile />
            </ProtectedRoute>
          }
        />


        <Route
          path="/chat/group-settings/:groupId"
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
          path="/gallery/:photoId"
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
          path="/search"
          element={
            <ProtectedRoute>
              <SearchUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/followers"
          element={
            <ProtectedRoute>
              <FollowersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/following"
          element={
            <ProtectedRoute>
              <FollowingList />
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
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/support" element={<Support />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MobileNav />
      <ToastContainer />
      <ConfirmModal />
      <CallModal />
      <PostDetailModal />
      <NetworkStatus />
    </Router>
  );
}



