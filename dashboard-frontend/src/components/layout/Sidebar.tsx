import { useState } from "react";
import "./sidebar.css";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  handleLogout: () => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "bi-speedometer2",
  },
  {
    id: "warehouse",
    label: "Warehouse Monitoring",
    icon: "bi-box-seam",
  },
  {
    id: "office",
    label: "Office Monitoring",
    icon: "bi-building",
  },
  {
    id: "education",
    label: "Mitigation Education",
    icon: "bi-book",
  },
  {
    id: "attacks",
    label: "Cyber Attack Records",
    icon: "bi-shield-lock",
  },
];

export default function Sidebar({
  activePage,
  setActivePage,
  handleLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-circle">WS</div>

          {!collapsed && (
            <div>
              <h3>WareSafe</h3>
              <small>Monitoring System</small>
            </div>
          )}
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i
            className={`bi ${
              collapsed ? "bi-chevron-right" : "bi-chevron-left"
            }`}
          ></i>
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => setActivePage(item.id)}
          >
            <i className={`bi ${item.icon}`}></i>

            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-logout"
        onClick={handleLogout}
      >
        <i className="bi bi-box-arrow-right"></i>

        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}