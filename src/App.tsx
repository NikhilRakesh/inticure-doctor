import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import RoutesProtector from "./features/Auth/RoutesProtector";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import AppointmentsPage from "./pages/AppointmentsPage";
import EarningsPage from "./pages/EarningsPage";
import DoctorCalendar from "./pages/DoctorCalendar";
import DoctorRegistration from "./pages/DoctorRegistration";
import ApplicationStatusBanner from "./components/Common/ApplicationStatusBanner";
import RefferDoctor from "./pages/RefferDoctor";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: <RoutesProtector />,
      children: [
        {
          path: "",
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: <Dashboard />,
            },
            {
              path: "appointments",
              element: <AppointmentsPage />,
            },
            {
              path: "earnings",
              element: <EarningsPage />,
            },
            {
              path: "calendar",
              element: <DoctorCalendar />,
            },
            {
              path: "register",
              element: <DoctorRegistration />,
            },
            {
              path: "profile-status/:did",
              element: <ApplicationStatusBanner />,
            },
            {
              path: "reffer-doctor",
              element: <RefferDoctor />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
