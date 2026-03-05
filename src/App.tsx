import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppDispatch } from './hooks/useRedux';
import { initializeAuth } from './store/authSlice';

// Pages - Public
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Listings from './pages/Listings';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Pages - Dashboards
import OwnerDashboard from './pages/OwnerDashboard';
import AdvertiserDashboard from './pages/AdvertiserDashboard';

// Pages - Owner
import CreateListing from './pages/owner/CreateListing';
import MyListings from './pages/owner/MyListings';
import OwnerBookings from './pages/owner/OwnerBookings';
import OwnerAnalytics from './pages/owner/OwnerAnalytics';

// Pages - Advertiser
import MyCampaigns from './pages/advertiser/MyCampaigns';
import Favorites from './pages/advertiser/Favorites';
import BrowseBillboards from './pages/advertiser/BrowseBillboards';
import Payments from './pages/advertiser/Payments';

// Pages - Shared
import Messages from './pages/shared/Messages';
import BillboardDetails from './pages/shared/BillboardDetails';
import Settings from './pages/shared/Settings';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ListingVerification from './pages/admin/ListingVerification';
import AdminTransactions from './pages/admin/AdminTransactions';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppContent() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Initialize auth state listener
        dispatch(initializeAuth());
    }, [dispatch]);

    return (
        <>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/billboards/:id" element={<BillboardDetails />} />

                {/* Owner Dashboard Routes */}
                <Route
                    path="/dashboard/owner"
                    element={
                        <ProtectedRoute>
                            <OwnerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/owner/create"
                    element={
                        <ProtectedRoute>
                            <CreateListing />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/owner/listings"
                    element={
                        <ProtectedRoute>
                            <MyListings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/owner/bookings"
                    element={
                        <ProtectedRoute>
                            <OwnerBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/owner/analytics"
                    element={
                        <ProtectedRoute>
                            <OwnerAnalytics />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/owner/messages"
                    element={
                        <ProtectedRoute>
                            <Messages userRole="owner" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/owner/settings"
                    element={
                        <ProtectedRoute>
                            <Settings userRole="owner" />
                        </ProtectedRoute>
                    }
                />

                {/* Advertiser Dashboard Routes */}
                <Route
                    path="/dashboard/advertiser"
                    element={
                        <ProtectedRoute>
                            <AdvertiserDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/advertiser/browse"
                    element={
                        <ProtectedRoute>
                            <BrowseBillboards />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/advertiser/campaigns"
                    element={
                        <ProtectedRoute>
                            <MyCampaigns />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/advertiser/favorites"
                    element={
                        <ProtectedRoute>
                            <Favorites />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/advertiser/payments"
                    element={
                        <ProtectedRoute>
                            <Payments />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/advertiser/messages"
                    element={
                        <ProtectedRoute>
                            <Messages userRole="advertiser" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/advertiser/settings"
                    element={
                        <ProtectedRoute>
                            <Settings userRole="advertiser" />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard Routes */}
                <Route
                    path="/dashboard/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin/users"
                    element={
                        <ProtectedRoute>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin/listings"
                    element={
                        <ProtectedRoute>
                            <ListingVerification />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin/transactions"
                    element={
                        <ProtectedRoute>
                            <AdminTransactions />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin/settings"
                    element={
                        <ProtectedRoute>
                            <Settings userRole="admin" />
                        </ProtectedRoute>
                    }
                />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#0a0a0a',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                    },
                    success: {
                        iconTheme: {
                            primary: '#0ea5e9',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}

function App() {
    return (
        <Provider store={store}>
            <Router>
                <AppContent />
            </Router>
        </Provider>
    );
}

export default App;
