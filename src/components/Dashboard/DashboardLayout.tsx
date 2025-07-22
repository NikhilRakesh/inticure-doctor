import { Outlet } from "react-router-dom";
import Headder from "../Headder/Headder";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-indigo-50 w-full">
      <div >
        <Headder />
        <main className="w-full min-h-screen ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
