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
import DoctorPatientAssessment from "./pages/DoctorPatientAssessment";
import FollowUp from "./pages/FollowUp";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "register",
      element: <DoctorRegistration />,
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
              path: "profile-status/:did",
              element: <ApplicationStatusBanner />,
            },
            {
              path: "reffer-doctor",
              element: <RefferDoctor />,
            },
            {
              path: "appointment",
              element: <DoctorPatientAssessment />,
            },
            {
              path: "follow-up",
              element: <FollowUp />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
