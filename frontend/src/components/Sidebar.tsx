import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const role = user?.role;

  const canSeeCustomers =
    role === "ADMIN" || role === "SALES";

  const canSeeProducts =
    role === "ADMIN" || role === "WAREHOUSE";

  const canSeeInventory =
    role === "ADMIN" || role === "WAREHOUSE";

  const canSeeChallans =
    role === "ADMIN" ||
    role === "SALES" ||
    role === "ACCOUNTS";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Fundstrom</h2>
        <span>ERP Portal</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          Dashboard
        </NavLink>

        {canSeeCustomers && (
          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Customers
          </NavLink>
        )}

        {canSeeProducts && (
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Products
          </NavLink>
        )}

        {canSeeInventory && (
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Inventory
          </NavLink>
        )}

        {canSeeChallans && (
          <NavLink
            to="/challans"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Sales Challans
          </NavLink>
        )}
      </nav>

      <button
        className="logout-button"
        onClick={logout}
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;