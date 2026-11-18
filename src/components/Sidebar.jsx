
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const fullName = user?.user_metadata?.full_name || "Daymark User";
  const email = user?.email || "";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const getNavLinkClass = ({ isActive }) =>
    `nav-link${isActive ? " active" : ""}`;

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <i className="bi bi-check-lg"></i>
          </div>

          <div>
            <h3>Daymark</h3>
            <p>Organize. Focus. Achieve.</p>
          </div>

          <button
            className="sidebar-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-title">WORKSPACE</p>

          <NavLink
            to="/dashboard"
            end
            className={getNavLinkClass}
            onClick={onClose}
          >
            <i className="bi bi-grid"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={getNavLinkClass}
            onClick={onClose}
          >
            <i className="bi bi-list-check"></i>
            <span>My Tasks</span>
          </NavLink>

          <NavLink
            to="/completed"
            className={getNavLinkClass}
            onClick={onClose}
          >
            <i className="bi bi-check-circle"></i>
            <span>Completed Tasks</span>
          </NavLink>

          <NavLink
            to="/calendar"
            className={getNavLinkClass}
            onClick={onClose}
          >
            <i className="bi bi-calendar3"></i>
            <span>Calendar</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={getNavLinkClass}
            onClick={onClose}
          >
            <i className="bi bi-bar-chart"></i>
            <span>Reports</span>
          </NavLink>

          <p className="sidebar-section-title account-section-title">
            PREFERENCES
          </p>

          <NavLink
            to="/settings"
            className={getNavLinkClass}
            onClick={onClose}
          >
            <i className="bi bi-gear"></i>
            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={getNavLinkClass}
            onClick={onClose}
          >
            <i className="bi bi-person"></i>
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-promo">
          <div className="promo-icon">
            <i className="bi bi-rocket-takeoff"></i>
          </div>

          <h5>Stay Productive!</h5>
          <p>Small steps lead to big achievements.</p>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>

          <div className="user-info">
            <h6>{fullName}</h6>
            <span>{email}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
