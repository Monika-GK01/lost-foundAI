import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/ui/Loading';

// Lazy-loaded pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const LostItemsPage = lazy(() => import('@/pages/LostItemsPage'));
const FoundItemsPage = lazy(() => import('@/pages/FoundItemsPage'));
const CreateLostItemPage = lazy(() => import('@/pages/CreateLostItemPage'));
const CreateFoundItemPage = lazy(() => import('@/pages/CreateFoundItemPage'));
const LostItemDetailPage = lazy(() => import('@/pages/LostItemDetailPage'));
const FoundItemDetailPage = lazy(() => import('@/pages/FoundItemDetailPage'));
const AIMatchResultsPage = lazy(() => import('@/pages/AIMatchResultsPage'));
const SubmitClaimPage = lazy(() => import('@/pages/SubmitClaimPage'));
const MyClaimsPage = lazy(() => import('@/pages/MyClaimsPage'));
const ClaimDetailPage = lazy(() => import('@/pages/ClaimDetailPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const AdminClaimReviewPage = lazy(() => import('@/pages/AdminClaimReviewPage'));
const AdminClaimsPage = lazy(() => import('@/pages/admin/AdminClaimsPage'));
const AdminItemsPage = lazy(() => import('@/pages/admin/AdminItemsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />

          {/* Protected Routes (all authenticated users) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/lost-items" element={<LostItemsPage />} />
              <Route path="/lost-items/new" element={<CreateLostItemPage />} />
              <Route path="/lost-items/:id" element={<LostItemDetailPage />} />
              <Route path="/lost-items/:id/matches" element={<AIMatchResultsPage />} />
              <Route path="/found-items" element={<FoundItemsPage />} />
              <Route path="/found-items/new" element={<CreateFoundItemPage />} />
              <Route path="/found-items/:id" element={<FoundItemDetailPage />} />
              <Route path="/claims" element={<MyClaimsPage />} />
              <Route path="/claims/new" element={<SubmitClaimPage />} />
              <Route path="/claims/:id" element={<ClaimDetailPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminOverviewPage />} />
                <Route path="/admin/claims" element={<AdminClaimsPage />} />
                <Route path="/admin/claims/:id" element={<AdminClaimReviewPage />} />
                <Route path="/admin/lost-items" element={<AdminItemsPage type="lost" />} />
                <Route path="/admin/found-items" element={<AdminItemsPage type="found" />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
