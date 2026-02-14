type Props = {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
};

export default function StatCard({ label, value, color = "#3b82f6", icon }: Props) {
  return (
    <div className="stat-card" style={{ borderInlineStartColor: color }}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
