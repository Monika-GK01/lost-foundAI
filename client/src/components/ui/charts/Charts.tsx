import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const AXIS_COLOR = '#9ca3af';
const GRID_COLOR = 'rgba(156, 163, 175, 0.2)';
const LOST_COLOR = '#ef4444';
const FOUND_COLOR = '#22c55e';
const PRIMARY_COLOR = '#4f46e5';

const PIE_COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899'];

const tooltipStyle = {
  borderRadius: '0.75rem',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: '12px',
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--color-text-secondary)]">{subtitle}</p>}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

export function MonthlyItemsChart({ data }: { data: { month: string; lost: number; found: number }[] }) {
  return (
    <ChartCard title="Monthly Reports" subtitle="Lost vs found items over the last 6 months">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="month" stroke={AXIS_COLOR} fontSize={12} tickLine={false} />
          <YAxis stroke={AXIS_COLOR} fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="lost" name="Lost" stroke={LOST_COLOR} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="found" name="Found" stroke={FOUND_COLOR} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategoryPieChart({ data }: { data: { category: string; count: number }[] }) {
  return (
    <ChartCard title="Category Distribution" subtitle="Lost items grouped by category">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={45}
            paddingAngle={2}
            label={({ name, value }) => `${name} (${value})`}
            labelLine={false}
            fontSize={11}
          >
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RecoveryAreaChart({ data }: { data: { month: string; lost: number; found: number }[] }) {
  // Cumulative recovered proxy: show found items trend as recovery activity.
  return (
    <ChartCard title="Recovery Activity" subtitle="Items found and returned over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="recoveryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.4} />
              <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="month" stroke={AXIS_COLOR} fontSize={12} tickLine={false} />
          <YAxis stroke={AXIS_COLOR} fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="found"
            name="Recovered"
            stroke={PRIMARY_COLOR}
            strokeWidth={2}
            fill="url(#recoveryGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
