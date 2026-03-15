import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  Search,
  Bell,
  DollarSign,
  Loader2,
  CheckCircle2,
  BarChart2,
  RefreshCw,
  MoreHorizontal,
  Star,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG = "#F9F7E8";
const GREEN = "#4C6B50";
const GREEN_LIGHT = "#e8ece3";

// ─── Data ─────────────────────────────────────────────────────────────────────
const salesData = [
  { time: "8 AM", coffee: 320, tea: 180, snack: 90 },
  { time: "9 AM", coffee: 580, tea: 290, snack: 140 },
  { time: "10 AM", coffee: 1145, tea: 2345, snack: 345 },
  { time: "11 AM", coffee: 820, tea: 510, snack: 220 },
  { time: "12 PM", coffee: 1280, tea: 680, snack: 410 },
  { time: "1 PM", coffee: 960, tea: 820, snack: 280 },
  { time: "2 PM", coffee: 740, tea: 640, snack: 190 },
  { time: "3 PM", coffee: 1100, tea: 730, snack: 360 },
  { time: "4 PM", coffee: 880, tea: 560, snack: 240 },
  { time: "5 PM", coffee: 650, tea: 420, snack: 150 },
  { time: "6 PM", coffee: 480, tea: 310, snack: 120 },
];

const radarData = [
  { item: "Espresso", value: 90 },
  { item: "Americano", value: 75 },
  { item: "Mocha", value: 85 },
  { item: "Expreso", value: 60 },
  { item: "Salted Caramel", value: 70 },
  { item: "Flat White", value: 80 },
  { item: "Latte", value: 88 },
  { item: "Ice Coffee", value: 65 },
];

const transactions = [
  {
    id: 1,
    name: "John Smith",
    avatar: "https://i.pravatar.cc/40?img=1",
    email: "smithjohn@gmail.com",
    phone: "+21 34567890",
    items: "Tea, Snack, Coffee",
    value: "$20.00",
    category: ["Tea", "Snack", "Coffee"],
  },
  {
    id: 2,
    name: "Michael Will",
    avatar: "https://i.pravatar.cc/40?img=2",
    email: "john@gmail.com",
    phone: "+25 12345678",
    items: "Coffee, Tea, Snack",
    value: "$24.00",
    category: ["Coffee", "Tea", "Snack"],
  },
  {
    id: 3,
    name: "Kevin Brown",
    avatar: "https://i.pravatar.cc/40?img=3",
    email: "johnsmith@gmail.com",
    phone: "+24 98765432",
    items: "Coffee, Tea, Snack",
    value: "$24.00",
    category: ["Coffee", "Tea", "Snack"],
  },
  {
    id: 4,
    name: "Lia Thompson",
    avatar: "https://i.pravatar.cc/40?img=5",
    email: "smith@gmail.com",
    phone: "+22 87654321",
    items: "Snack, Coffee, Tea",
    value: "$4.00",
    category: ["Snack", "Coffee", "Tea"],
  },
  {
    id: 5,
    name: "Sara Martinez",
    avatar: "https://i.pravatar.cc/40?img=9",
    email: "sara@gmail.com",
    phone: "+33 56789012",
    items: "Tea, Coffee",
    value: "$18.00",
    category: ["Tea", "Coffee"],
  },
  {
    id: 6,
    name: "David Lee",
    avatar: "https://i.pravatar.cc/40?img=11",
    email: "dlee@gmail.com",
    phone: "+44 34512678",
    items: "Snack",
    value: "$6.00",
    category: ["Snack"],
  },
];

const metricCards = [
  {
    icon: <DollarSign size={16} className="text-green-700" />,
    bg: "bg-green-50",
    label: "Total Revenue",
    helper: "Details",
    value: "$2,357.00",
    trend: "+2%",
    up: true,
  },
  {
    icon: <Loader2 size={16} className="text-blue-500" />,
    bg: "bg-blue-50",
    label: "On Progress",
    value: "10",
    sub: "Orders",
    trend: null,
  },
  {
    icon: <CheckCircle2 size={16} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    label: "Performance",
    value: "Good",
    sub: "2/24",
    trend: null,
  },
  {
    icon: <BarChart2 size={16} className="text-sage-500" />,
    bg: "bg-lime-50",
    label: "Today Sales",
    value: "234",
    trend: "+2%",
    up: true,
  },
  {
    icon: <Loader2 size={16} className="text-purple-500" />,
    bg: "bg-purple-50",
    label: "On Progress",
    value: "10",
    sub: "Orders",
    trend: null,
  },
];

const TIME_FILTERS = ["Day", "Month", "Year", "All", "Custom"];
const TXN_FILTERS = ["All", "Tea", "Coffee", "Snack"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-sage-200 rounded-2xl shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-sage-700 mb-2">{label} · Jan 14, 24</p>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-4 mb-1"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: p.color }}
            />
            <span className="text-sage-600 capitalize">{p.dataKey}</span>
          </span>
          <span className="font-bold text-sage-900">${p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Circular Score ───────────────────────────────────────────────────────────
function ScoreRing({ score = 98 }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      <svg width="144" height="144" className="-rotate-90">
        <circle
          cx="72"
          cy="72"
          r={r}
          fill="none"
          stroke="#e8ece3"
          strokeWidth="10"
          strokeDasharray="4 4"
        />
        <circle
          cx="72"
          cy="72"
          r={r}
          fill="none"
          stroke="#a3c45a"
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-extrabold text-sage-900 leading-none">
          {score}
        </p>
        <p className="text-[10px] text-sage-500 mt-0.5">2/98 order</p>
        <p className="text-[10px] text-sage-500">Complains</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard({ onNavigate }) {
  const [timeFilter, setTimeFilter] = useState("Day");
  const [txnFilter, setTxnFilter] = useState("All");
  const [selected, setSelected] = useState({});

  const filteredTxns =
    txnFilter === "All"
      ? transactions
      : transactions.filter((t) => t.category.includes(txnFilter));

  const toggleRow = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{ background: BG }}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-sage-100 bg-[#F9F7E8] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: GREEN }}
          >
            <span className="text-white text-xs font-extrabold tracking-tight">
              GG
            </span>
          </div>
          <div className="leading-[1.2]">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-sage-800">
              Green
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-sage-800">
              Grounds
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-sage-500">
              Coffee
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-sage-200 rounded-2xl px-4 py-2 shadow-sm w-52">
            <Search size={15} className="text-sage-400" />
            <input
              placeholder="Search"
              className="flex-1 bg-transparent outline-none text-sm text-sage-800 placeholder-sage-400"
            />
            <SlidersHorizontal size={14} className="text-sage-400" />
          </div>
          <div className="relative cursor-pointer">
            <Bell size={20} className="text-sage-700" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              1
            </span>
          </div>
          <div className="flex items-center gap-2.5 bg-white border border-sage-200 rounded-2xl px-3 py-1.5 shadow-sm">
            <img
              src="https://i.pravatar.cc/40?img=7"
              alt="Adam S"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-sage-900">Adam S</p>
              <p className="text-xs text-sage-500">Admin</p>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("pos")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-sage-300 text-sage-700 hover:bg-sage-100 transition-colors"
            >
              <LayoutGrid size={14} /> POS View
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {metricCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-sage-100 shadow-sm p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bg}`}
                >
                  {card.icon}
                </div>
                {card.helper && (
                  <span className="text-xs text-sage-400 hover:text-sage-600 cursor-pointer">
                    {card.helper}
                  </span>
                )}
              </div>
              <p className="text-xs text-sage-500 font-medium">{card.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-extrabold text-sage-900 leading-none">
                  {card.value}
                </p>
                {card.sub && (
                  <p className="text-xs text-sage-400 pb-0.5">{card.sub}</p>
                )}
                {card.trend && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold pb-0.5 ${card.up ? "text-green-600" : "text-red-500"}`}
                  >
                    {card.up ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {card.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-sage-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                  <BarChart2 size={15} className="text-sage-500" /> Sales
                  Statistic
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                  {[
                    { color: "#EAB308", label: "Tea" },
                    { color: GREEN, label: "Coffee" },
                    { color: "#ef4444", label: "Snack" },
                  ].map((l) => (
                    <span
                      key={l.label}
                      className="flex items-center gap-1 text-xs text-sage-500"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: l.color }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-sage-50 text-sage-400 transition-colors">
                  <MoreHorizontal size={15} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-sage-50 text-sage-400 transition-colors">
                  <RefreshCw size={13} />
                </button>
                <div className="flex bg-sage-50 rounded-xl p-0.5 gap-0.5">
                  {TIME_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setTimeFilter(f)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${timeFilter === f ? "bg-sage-800 text-white shadow-sm" : "text-sage-500 hover:text-sage-700"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0ede0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "#9aaa8a" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9aaa8a" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="coffee"
                    stroke={GREEN}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: GREEN }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tea"
                    stroke="#EAB308"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#EAB308" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="snack"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score + Feedback */}
          <div className="bg-white rounded-3xl border border-sage-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />{" "}
                Score
              </h2>
              <button className="p-1.5 rounded-lg hover:bg-sage-50 text-sage-400 transition-colors">
                <MoreHorizontal size={15} />
              </button>
            </div>

            <ScoreRing score={98} />

            <div className="space-y-2 mt-auto">
              {[
                {
                  icon: <AlertTriangle size={14} className="text-red-500" />,
                  bg: "bg-red-50",
                  title: "Wrong Menu",
                  sub: "Andrew Tate",
                },
                {
                  icon: <AlertCircle size={14} className="text-yellow-500" />,
                  bg: "bg-yellow-50",
                  title: "Bad Rating",
                  sub: "Don Ozwald",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 bg-sage-50 rounded-xl p-2.5"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.bg}`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-sage-900">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-sage-400">{item.sub}</p>
                  </div>
                  <button className="text-[11px] font-semibold px-3 py-1 rounded-lg border border-sage-300 text-sage-700 hover:bg-white transition-colors flex-shrink-0">
                    Solve
                  </button>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[0, 1, 2].map((b) => (
                      <span
                        key={b}
                        className="w-1 h-4 rounded-full bg-sage-300 block"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Radar Chart */}
          <div className="bg-white rounded-3xl border border-sage-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                <BarChart2 size={14} className="text-sage-500" /> Items
                Performance
              </h2>
              <button className="p-1.5 rounded-lg hover:bg-sage-50 text-sage-400 transition-colors">
                <MoreHorizontal size={15} />
              </button>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="#e8ece3" />
                  <PolarAngleAxis
                    dataKey="item"
                    tick={{ fontSize: 9, fill: "#7a8f63" }}
                  />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke={GREEN}
                    fill={GREEN}
                    fillOpacity={0.18}
                    strokeWidth={2}
                    dot={{ fill: GREEN, r: 3 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-sage-100 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                <ChevronRight size={14} className="text-sage-500" /> Recent
                Transaction
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-sage-50 text-sage-400 transition-colors">
                  <RefreshCw size={13} />
                </button>
                <div className="flex bg-sage-50 rounded-xl p-0.5 gap-0.5">
                  {TXN_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setTxnFilter(f)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${txnFilter === f ? "bg-sage-800 text-white shadow-sm" : "text-sage-500 hover:text-sage-700"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sage-100">
                    {[
                      "",
                      "Customer Name",
                      "Email",
                      "Phone",
                      "Items",
                      "Value",
                      "",
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="text-left text-xs font-semibold text-sage-400 pb-2.5 pr-3 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTxns.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-b border-sage-50 hover:bg-sage-50/60 transition-colors group"
                    >
                      <td className="py-2.5 pr-2 w-6">
                        <input
                          type="checkbox"
                          checked={!!selected[txn.id]}
                          onChange={() => toggleRow(txn.id)}
                          className="w-3.5 h-3.5 accent-sage-700 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={txn.avatar}
                            alt={txn.name}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="font-medium text-sage-900 whitespace-nowrap">
                            {txn.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-sage-500 whitespace-nowrap">
                        {txn.email}
                      </td>
                      <td className="py-2.5 pr-3 text-sage-500 whitespace-nowrap">
                        {txn.phone}
                      </td>
                      <td className="py-2.5 pr-3 text-sage-600 max-w-[140px] truncate">
                        {txn.items}
                      </td>
                      <td className="py-2.5 pr-3 font-semibold text-sage-900 whitespace-nowrap">
                        {txn.value}
                      </td>
                      <td className="py-2.5">
                        <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-sage-100 text-sage-400 transition-all">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
