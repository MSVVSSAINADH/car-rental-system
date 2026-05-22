import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AddCar from './pages/admin/AddCar';
import UpdateCar from './pages/admin/UpdateCar';
import BookCar from './pages/customer/BookCar';
import MyBookings from './pages/customer/MyBookings';
import AdminBookings from './pages/admin/AdminBookings';
import Payment from './pages/customer/Payment';
import UserProfile from './pages/customer/UserProfile';
import Home from './pages/Home';
import Footer from './components/Footer';
import ManageUsers from './pages/admin/ManageUsers';
import Notifications from './pages/customer/Notifications';

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#4f46e5',
            colorBgContainer: '#ffffff',
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif',
          },
        }}
      >
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/add-car" element={<ProtectedRoute role="ADMIN"><AddCar /></ProtectedRoute>} />
            <Route path="/admin/car/:id" element={<ProtectedRoute role="ADMIN"><UpdateCar /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute role="ADMIN"><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><ManageUsers /></ProtectedRoute>} />

            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={<ProtectedRoute role="CUSTOMER"><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/customer/book/:id" element={<ProtectedRoute role="CUSTOMER"><BookCar /></ProtectedRoute>} />
            <Route path="/customer/bookings" element={<ProtectedRoute role="CUSTOMER"><MyBookings /></ProtectedRoute>} />
            <Route path="/customer/profile" element={<ProtectedRoute role="CUSTOMER"><UserProfile /></ProtectedRoute>} />
            <Route path="/customer/notifications" element={<ProtectedRoute role="CUSTOMER"><Notifications /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute role="CUSTOMER"><Payment /></ProtectedRoute>} />
          </Routes>
        </div>
        <Footer />
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
