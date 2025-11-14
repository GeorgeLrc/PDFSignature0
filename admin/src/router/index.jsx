import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import useAuth from "@/hooks/useAuth";
import AppLayout from "@/pages/AppLayout";
import TemplatePage from "@/pages/TemplatePage";
import ManageUsersPage from "@/pages/ManageUsersPage";
import DashboradPage from "@/pages/DashboradPage";

export default function Router() {
  const { isAuthenticated, authReady } = useAuth()

  const router = createBrowserRouter([
    {
      path: "/",
      element: isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />,
      children: [
        {
          index: true,
          element: <Navigate to={'dashboard'} replace />
        },
        {
          path: 'dashboard',
          element: <DashboradPage />
        },
        {
          path: "manage-users",
          element: <ManageUsersPage />,
        },
        {
          path: "template",
          element: <TemplatePage />
        },
      ]
    },
    {
      path: "/login",
      element: !isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />,
    },
    {
      path: "*",
      element: <h1>404</h1>
    }
  ]);

  return (
    authReady && <RouterProvider router={router} />
  )
}



