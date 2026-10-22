import { lazy, Suspense } from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Cars = lazy(() => import('./pages/Cars'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'))
const AddCar = lazy(() => import('./pages/admin/AddCar'))
const UpdateCar = lazy(() => import('./pages/admin/UpdateCar'))
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'))
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'))
const BookCar = lazy(() => import('./pages/customer/BookCar'))
const MyBookings = lazy(() => import('./pages/customer/MyBookings'))
const Payment = lazy(() => import('./pages/customer/Payment'))
const UserProfile = lazy(() => import('./pages/customer/UserProfile'))
const Notifications = lazy(() => import('./pages/customer/Notifications'))

function PageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16" role="status">
      <div className="h-8 w-64 animate-pulse rounded-badge bg-line" />
      <div className="mt-6 h-4 w-full max-w-xl animate-pulse rounded-badge bg-line" />
      <div className="mt-3 h-4 w-3/4 max-w-lg animate-pulse rounded-badge bg-line" />
      <span className="sr-only">Loading page</span>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:text-primary focus:shadow-lift"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/add-car" element={<ProtectedRoute role="ADMIN"><AddCar /></ProtectedRoute>} />
              <Route path="/admin/car/:id" element={<ProtectedRoute role="ADMIN"><UpdateCar /></ProtectedRoute>} />
              <Route path="/admin/bookings" element={<ProtectedRoute role="ADMIN"><AdminBookings /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><ManageUsers /></ProtectedRoute>} />

              {/* Customer */}
              <Route path="/customer/dashboard" element={<ProtectedRoute role="CUSTOMER"><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/customer/book/:id" element={<ProtectedRoute role="CUSTOMER"><BookCar /></ProtectedRoute>} />
              <Route path="/customer/bookings" element={<ProtectedRoute role="CUSTOMER"><MyBookings /></ProtectedRoute>} />
              <Route path="/customer/profile" element={<ProtectedRoute role="CUSTOMER"><UserProfile /></ProtectedRoute>} />
              <Route path="/customer/notifications" element={<ProtectedRoute role="CUSTOMER"><Notifications /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute role="CUSTOMER"><Payment /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" closeButton />
    </BrowserRouter>
  )
}

export default App