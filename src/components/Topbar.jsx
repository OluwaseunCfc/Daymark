
function Topbar() {
  return (
    <header className="topbar">

      <div className="search-box">
        <i className="bi bi-search"></i>

        <input
          type="text"
          placeholder="Search your tasks..."
        />

        <span className="search-shortcut">Ctrl + K</span>
      </div>

      <div className="topbar-actions">

        <button className="notification-btn" type="button">
          <i className="bi bi-bell"></i>
          <span className="notification-dot">2</span>
        </button>

        <div className="topbar-avatar">
          JD
        </div>

        <i className="bi bi-chevron-down profile-arrow"></i>

      </div>

    </header>
  );
}

export default Topbar;
