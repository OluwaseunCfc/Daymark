
function Sidebar() {
  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="brand">
        <div className="brand-icon">
          <i className="bi bi-check-lg"></i>
        </div>

        <div>
          <h3>Daymark</h3>
          <p>Organize. Focus. Achieve.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">

        <a href="#" className="nav-link active">
          <i className="bi bi-grid-fill"></i>
          <span>Dashboard</span>
        </a>

        <a href="#" className="nav-link">
          <i className="bi bi-check2-square"></i>
          <span>My Tasks</span>
        </a>

        <a href="#" className="nav-link">
          <i className="bi bi-check-circle"></i>
          <span>Completed</span>
        </a>

        <a href="#" className="nav-link">
          <i className="bi bi-gear"></i>
          <span>Settings</span>
        </a>

        <a href="#" className="nav-link">
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </a>

      </nav>

      {/* Productivity Card */}
      <div className="sidebar-promo">
        <div className="promo-icon">
          <i className="bi bi-rocket-takeoff"></i>
        </div>

        <h5>Stay Productive!</h5>

        <p>
          Small steps lead to big achievements.
        </p>
      </div>

      {/* User Profile */}
      <div className="sidebar-user">
        <div className="user-avatar">JD</div>

        <div className="user-info">
          <h6>John Doe</h6>
          <span>john@daymark.com</span>
        </div>

        <i className="bi bi-chevron-down"></i>
      </div>

    </aside>
  );
}

export default Sidebar;
