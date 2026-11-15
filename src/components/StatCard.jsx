
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`stat-card ${color}`}>

      <div className="stat-icon">
        <i className={`bi ${icon}`}></i>
      </div>

      <div className="stat-info">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>

    </div>
  );
}

export default StatCard;
