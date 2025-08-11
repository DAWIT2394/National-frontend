import React, { useState } from "react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import AdminCreateUser from "./AdminCreateUser";
import ButcherPage from "./ButcherPage";
import Adminpage from "./Adminpage";
import ReportPage from "./ReportPage";
import Cooker from "./CookerPage";

export const AllComponents = () => {
  const [activePage, setActivePage] = useState("admin-create-user");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "admin-create-user":
        return <AdminCreateUser />;
      case "butcher":
        return <ButcherPage />;
      case "admin-dashboard":
        return <Adminpage />;
      case "reports":
        return <ReportPage />;
      case "cooker":
        return <Cooker />;
      default:
        return <Adminpage />;
    }
  };

  const navButtonClass = (page) =>
    `w-full text-left px-6 py-3 hover:bg-blue-50 transition ${
      activePage === page ? "bg-blue-100 font-semibold" : ""
    }`;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center bg-white shadow px-4 py-3">
        <h1 className="text-xl font-bold text-blue-600">Dashboard</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? (
            <XIcon className="h-6 w-6 text-gray-700" />
          ) : (
            <MenuIcon className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 z-50`}
      >
        <div className="p-6 border-b hidden md:block">
          <h1 className="text-2xl font-bold text-blue-600">Dashboard</h1>
        </div>
        <nav className="mt-4">
          <button onClick={() => { setActivePage("admin-create-user"); setSidebarOpen(false); }} className={navButtonClass("admin-create-user")}>
            Create User
          </button>
          <button onClick={() => { setActivePage("butcher"); setSidebarOpen(false); }} className={navButtonClass("butcher")}>
            Butcher Page
          </button>
          <button onClick={() => { setActivePage("admin-dashboard"); setSidebarOpen(false); }} className={navButtonClass("admin-dashboard")}>
            Admin Dashboard
          </button>
          <button onClick={() => { setActivePage("reports"); setSidebarOpen(false); }} className={navButtonClass("reports")}>
            Reports
          </button>
          <button onClick={() => { setActivePage("cooker"); setSidebarOpen(false); }} className={navButtonClass("cooker")}>
            Cooker Page
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 mt-14 md:mt-0">
        <div className="bg-white rounded-xl shadow p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};
