import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  type LucideProps,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../features/Auth/authSlice";

interface navitem {
  label: string;
  to: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}

const Header = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const navItems: navitem[] = [
    {
      label: "Dashboard",
      to: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Appointments",
      to: "/appointments?tab=upcoming",
      icon: CalendarDays,
    },
    {
      label: "Earnings",
      to: "/earnings",
      icon: DollarSign,
    },
    {
      label: "Calendar",
      to: "/calendar",
      icon: CalendarDays,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header>
      <div className="flex items-center justify-between px-5 bg-gradient-to-br from-[#faf7ff] to-[#f3ebff]">
        <div className="w-16 cursor-pointer" onClick={() => navigate("/")}>
          <img src="/inticure icon.png" className="p-2" alt="" />
        </div>
        <div className="bg-[#582768] rounded-xl">
          <nav className="flex  items-center ">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-tl-xl rounded-bl-xl transition-all ${
                    isActive ? "text-white" : "text-white/70"
                  } 
                  }`
                }
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-white cursor-pointer flex gap-2 items-center text-xs bg-[#582768] hover:bg-gray-100 transition-colors"
            title="Log out"
          >
            <LogOut className="h-3 w-3" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
