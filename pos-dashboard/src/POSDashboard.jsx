import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Plus,
  Minus,
  AlertCircle,
  SlidersHorizontal,
  ChevronLeft,
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Receipt,
  BarChart2,
  X,
  Printer,
  CalendarClock,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const categories = [
  {
    id: "coffee",
    name: "Coffee",
    items: 50,
    status: "Available",
    warning: false,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop&auto=format",
  },
  {
    id: "tea",
    name: "Tea",
    items: 20,
    status: "Available",
    warning: false,
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop&auto=format",
  },
  {
    id: "snack",
    name: "Snack",
    items: 10,
    status: "Need to re-stock",
    warning: true,
    image:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop&auto=format",
  },
];

const productsByCategory = {
  coffee: [
    {
      id: "espresso",
      name: "Espresso",
      price: 4.2,
      image:
        "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "cappuccino",
      name: "Cappuccino",
      price: 3.3,
      image:
        "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "latte",
      name: "Latte",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "americano",
      name: "Americano",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "mocha",
      name: "Mocha",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "iced-coffee",
      name: "Iced Coffee Milk",
      price: 3.8,
      image:
        "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "cold-brew",
      name: "Cold Brew",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "flat-white",
      name: "Flat White",
      price: 3.8,
      image:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "caramel-mac",
      name: "Caramel Mac",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "salted-caramel",
      name: "Salted Caramel",
      price: 4.2,
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "hazelnut-latte",
      name: "Hazelnut Latte",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "pour-over",
      name: "Pour Over",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&auto=format",
    },
  ],
  tea: [
    {
      id: "green-jasmine",
      name: "Green Jasmine Tea",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "earl-grey",
      name: "Earl Grey",
      price: 4.5,
      image:
        "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "chamomile",
      name: "Chamomile",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "peppermint",
      name: "Peppermint Tea",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "rooibos",
      name: "Rooibos Chai",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "hibiscus",
      name: "Hibiscus Berry Tea",
      price: 3.8,
      image:
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "darjeeling",
      name: "Darjeeling",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "genmaicha",
      name: "Genmaicha",
      price: 3.8,
      image:
        "https://images.unsplash.com/photo-1563822249548-9a72b6353d08?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "sencha",
      name: "Sencha",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "white-peony",
      name: "White Peony",
      price: 4.2,
      image:
        "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "lemon-ginger",
      name: "Lemon Ginger",
      price: 3.5,
      image:
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "moroccan-mint",
      name: "Moroccan Mint",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1563822249548-9a72b6353d08?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "lapsang",
      name: "Lapsang Souchong",
      price: 4.5,
      image:
        "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "dragon-well",
      name: "Dragon Well",
      price: 5.0,
      image:
        "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "lemongrass",
      name: "Lemongrass Tea",
      price: 3.5,
      image:
        "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop&auto=format",
    },
  ],
  snack: [
    {
      id: "croissant",
      name: "Butter Croissant",
      price: 3.5,
      image:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "muffin",
      name: "Blueberry Muffin",
      price: 3.0,
      image:
        "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "brownie",
      name: "Chocolate Brownie",
      price: 3.5,
      image:
        "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "cookie",
      name: "Oat Raisin Cookie",
      price: 2.5,
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "banana-bread",
      name: "Banana Bread",
      price: 4.0,
      image:
        "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=300&fit=crop&auto=format",
    },
    {
      id: "granola-bar",
      name: "Granola Bar",
      price: 2.8,
      image:
        "https://images.unsplash.com/photo-1490567674331-8f0605bc5f53?w=300&h=300&fit=crop&auto=format",
    },
  ],
};

const TAX_RATE = 0.1;
const ORDER_TYPES = ["Dine In", "Take Away", "Order Online"];
const TABLES = ["B12 - Indoor", "A01 - Indoor", "C04 - Outdoor", "D09 - VIP"];
const CUSTOMIZATIONS = [
  "Regular",
  "Medium",
  "Large",
  "Less Sugar",
  "No Sugar",
  "Extra Shot",
];

const INITIAL_ORDER_HISTORY = [
  {
    id: "ORD-27357",
    ticketNumber: "#27357",
    createdAt: "2026-03-19T07:10:00.000Z",
    orderType: "Dine In",
    customerName: "John Smith",
    table: "A01 - Indoor",
    subtotal: 12.6,
    tax: 1.26,
    total: 13.86,
    items: [
      { id: "latte", name: "Latte", qty: 2, price: 4.0, customization: "Medium" },
      { id: "cookie", name: "Oat Raisin Cookie", qty: 1, price: 2.5, customization: "Regular" },
    ],
  },
  {
    id: "ORD-27358",
    ticketNumber: "#27358",
    createdAt: "2026-03-19T07:24:00.000Z",
    orderType: "Take Away",
    customerName: "Lia Thompson",
    table: "-",
    subtotal: 8.0,
    tax: 0.8,
    total: 8.8,
    items: [
      { id: "americano", name: "Americano", qty: 1, price: 4.0, customization: "Less Sugar" },
      { id: "croissant", name: "Butter Croissant", qty: 1, price: 3.5, customization: "Regular" },
    ],
  },
];

const formatDateTime = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const createTicketNumber = () => `#${Math.floor(10000 + Math.random() * 90000)}`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function POSDashboard({ onNavigate, onLogout, user }) {
  const [activeCategory, setActiveCategory] = useState("coffee");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [orderType, setOrderType] = useState("Dine In");
  const [customerName, setCustomerName] = useState("Muadz");
  const [table, setTable] = useState("B12 - Indoor");
  const [orderHistory, setOrderHistory] = useState(INITIAL_ORDER_HISTORY);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(INITIAL_ORDER_HISTORY[0]?.id || null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [latestTicket, setLatestTicket] = useState(null);

  const sidebarOpen = cartItems.length > 0;

  const currentProducts = (productsByCategory[activeCategory] || []).filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Cart helpers ──
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...product, qty: 1, customization: "Medium" }];
    });
  };

  const changeQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const selectedOrder = orderHistory.find((order) => order.id === selectedOrderId) || null;

  const handlePlaceOrder = () => {
    if (!cartItems.length) return;

    const ticketNumber = createTicketNumber();
    const now = new Date().toISOString();
    const newOrder = {
      id: `ORD-${Date.now()}`,
      ticketNumber,
      createdAt: now,
      orderType,
      customerName: customerName.trim() || "Walk-in",
      table: orderType === "Dine In" ? table : "-",
      subtotal,
      tax,
      total,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        customization: item.customization,
      })),
    };

    setOrderHistory((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    setLatestTicket(newOrder);
    setTicketOpen(true);
    setCartItems([]);
  };

  const printTicket = (order) => {
    if (!order) return;
    const ticketWindow = window.open("", "_blank", "width=380,height=640");
    if (!ticketWindow) return;

    const itemsHtml = order.items
      .map(
        (item) => `
          <div class="item-row">
            <div>
              <p class="item-name">${item.name} x${item.qty}</p>
              <p class="item-meta">${item.customization}</p>
            </div>
            <span class="item-price">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `,
      )
      .join("");

    ticketWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${order.ticketNumber}</title>
          <style>
            :root {
              --bg: #f9f7e8;
              --ink: #1f2f23;
              --muted: #6e7f67;
              --brand: #4c6b50;
              --line: #ccd6c4;
            }
            * { box-sizing: border-box; }
            @page { size: 80mm auto; margin: 10mm; }
            body {
              margin: 0;
              background: var(--bg);
              color: var(--ink);
              font-family: "Segoe UI", Arial, sans-serif;
              padding: 16px;
            }
            p, h1, h2 { margin: 0; }
            .ticket {
              border: 1px solid var(--line);
              border-radius: 16px;
              background: #fffef8;
              padding: 14px;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 10px;
            }
            .brand-badge {
              width: 34px;
              height: 34px;
              border-radius: 10px;
              background: var(--brand);
              color: white;
              font-weight: 800;
              font-size: 13px;
              display: flex;
              align-items: center;
              justify-content: center;
              letter-spacing: 0.4px;
            }
            .brand-name {
              font-size: 18px;
              font-weight: 800;
              letter-spacing: 0.2px;
            }
            .meta {
              color: var(--muted);
              font-size: 12px;
              line-height: 1.45;
            }
            .ticket-id {
              font-size: 20px;
              font-weight: 800;
              margin: 8px 0 4px;
            }
            .line {
              border-top: 1px dashed var(--line);
              margin: 12px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              margin: 8px 0;
            }
            .item-name {
              font-size: 15px;
              font-weight: 700;
              color: var(--ink);
            }
            .item-meta {
              font-size: 12px;
              color: var(--muted);
              margin-top: 2px;
            }
            .item-price {
              font-size: 15px;
              font-weight: 700;
              color: var(--ink);
              white-space: nowrap;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin: 7px 0;
              font-size: 15px;
            }
            .summary-label { color: var(--muted); }
            .summary-value { font-weight: 700; color: var(--ink); }
            .summary-total {
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid var(--line);
              font-size: 22px;
              font-weight: 800;
            }
            .footer {
              margin-top: 12px;
              text-align: center;
              font-size: 11px;
              color: var(--muted);
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="brand">
              <div class="brand-badge">GG</div>
              <h2 class="brand-name">Green Grounds Coffee</h2>
            </div>
            <p class="ticket-id">Ticket ${order.ticketNumber}</p>
            <p class="meta">${formatDateTime(order.createdAt)}</p>
            <p class="meta">${order.orderType} • ${order.customerName}${order.table && order.table !== "-" ? ` • ${order.table}` : ""}</p>
            <div class="line"></div>
            ${itemsHtml}
            <div class="line"></div>
            <div class="summary-row"><span class="summary-label">Subtotal</span><span class="summary-value">$${order.subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span class="summary-label">Tax</span><span class="summary-value">$${order.tax.toFixed(2)}</span></div>
            <div class="summary-total"><span>Total</span><span>$${order.total.toFixed(2)}</span></div>
            <p class="footer">Thank you for visiting Green Grounds Coffee</p>
          </div>
        </body>
      </html>
    `);
    ticketWindow.document.close();
    ticketWindow.focus();
    ticketWindow.print();
  };

  return (
    <div className="h-screen bg-cream-50 font-sans flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-sage-100 bg-cream-50 flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sage-800 flex items-center justify-center">
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
          <span className="text-sm text-sage-600 font-medium hidden sm:inline">
            Thursday, 23 June
          </span>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setHistoryOpen(true)}
            className="text-sm text-sage-600 hidden md:inline px-3 py-2 rounded-xl border border-transparent hover:border-sage-200 hover:bg-white transition-colors"
          >
            Total : <strong className="text-sage-900">{orderHistory.length} Orders</strong>
          </button>
          <div className="relative cursor-pointer">
            <Bell size={20} className="text-sage-700" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold leading-none">
              1
            </span>
          </div>
          <div className="flex items-center gap-2.5 bg-white border border-sage-200 rounded-2xl px-3 py-1.5 shadow-sm">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format"}
              alt={user?.name || "Staff"}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-sage-900">{user?.name || "Staff"}</p>
              <p className="text-xs text-sage-500 capitalize">{user?.role === "admin" ? "Admin" : "Cashier"}</p>
            </div>
          </div>
          {onNavigate && user?.role === "admin" && (
            <button
              onClick={() => onNavigate("admin")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-sage-300 text-sage-700 hover:bg-sage-100 transition-colors"
            >
              <BarChart2 size={14} /> Analytics
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        <div
          className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${sidebarOpen ? "min-w-0" : ""}`}
        >
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl border border-sage-200 px-4 py-2.5 shadow-sm">
                <Search size={17} className="text-sage-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sage-800 placeholder-sage-400 text-sm min-w-0"
                />
              </div>
              <button className="w-10 h-10 flex-shrink-0 rounded-2xl bg-white border border-sage-200 flex items-center justify-center shadow-sm hover:bg-sage-50 transition-colors">
                <SlidersHorizontal size={17} className="text-sage-600" />
              </button>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`relative rounded-2xl p-4 overflow-hidden text-left cursor-pointer transition-all duration-200
                      ${isActive ? "bg-sage-800 text-white" : "bg-white border border-sage-200 hover:border-sage-300 text-sage-900"}
                    `}
                    style={{ minHeight: "96px" }}
                  >
                    <div className="relative z-10">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-1.5
                        ${cat.warning ? "bg-red-50 text-red-600 border border-red-200" : isActive ? "bg-white/20 text-white" : "bg-sage-50 text-sage-600 border border-sage-200"}
                      `}
                      >
                        {cat.status}
                        {cat.warning && <AlertCircle size={9} />}
                      </span>
                      <h3
                        className={`text-base font-bold leading-tight ${isActive ? "text-white" : "text-sage-900"}`}
                      >
                        {cat.name}
                      </h3>
                      <p
                        className={`text-xs mt-0.5 ${isActive ? "text-white/70" : "text-sage-400"}`}
                      >
                        {cat.items} items
                      </p>
                    </div>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className={`absolute right-1 bottom-0 w-20 h-20 object-contain transition-opacity ${isActive ? "opacity-20" : "opacity-40"}`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Product Grid */}
            <div
              className={`grid gap-3 ${sidebarOpen ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"}`}
            >
              {currentProducts.map((product) => {
                const inCart = cartItems.find((i) => i.id === product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-white border border-sage-200 rounded-2xl p-3 flex flex-col transition-shadow hover:shadow-md group"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-sage-50 flex items-center justify-center mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="flex items-end justify-between gap-1">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-sage-900 leading-tight truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-sage-500 mt-0.5">
                          ${product.price.toFixed(1)}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150
                          ${inCart ? "bg-sage-800 border-sage-800 text-white" : "border-sage-700 text-sage-700 hover:bg-sage-700 hover:text-white"}
                        `}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Checkout Sidebar ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-[320px] xl:w-[360px] flex-shrink-0 border-l border-sage-200 bg-cream-50 flex flex-col overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="px-5 pt-5 pb-4 border-b border-sage-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCartItems([])}
                      className="w-8 h-8 rounded-full bg-sage-800 text-white flex items-center justify-center hover:bg-sage-700 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div>
                      <p className="text-xs text-sage-500 leading-none">
                        Purchase Receipt
                      </p>
                      <p className="text-sm font-bold text-sage-900">#27362</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full border border-sage-200 bg-white text-sage-600 flex items-center justify-center hover:bg-sage-50 transition-colors">
                    <AlignJustify size={15} />
                  </button>
                </div>

                {/* Order type toggle */}
                <div className="flex bg-sage-100 rounded-xl p-1 gap-1">
                  {ORDER_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all duration-150
                        ${orderType === type ? "bg-sage-800 text-white shadow-sm" : "text-sage-600 hover:text-sage-800"}
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="px-5 py-3 border-b border-sage-100 flex-shrink-0">
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-semibold text-sage-500 uppercase tracking-wider block mb-1">
                      Customer name
                    </label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-sage-200 rounded-xl px-3 py-2 text-sm text-sage-900 outline-none focus:border-sage-500 transition-colors"
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-semibold text-sage-500 uppercase tracking-wider block mb-1">
                      Table
                    </label>
                    <div className="relative">
                      <select
                        value={table}
                        onChange={(e) => setTable(e.target.value)}
                        className="w-full appearance-none bg-white border border-sage-200 rounded-xl px-3 py-2 text-sm text-sage-900 outline-none focus:border-sage-500 transition-colors pr-7"
                      >
                        {TABLES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sage-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order List */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">
                  Order list
                </p>
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-sage-200 rounded-2xl p-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-semibold text-sage-900 leading-tight">
                              {item.name}
                            </p>
                            <p className="text-sm font-bold text-sage-900 ml-2 flex-shrink-0">
                              ${(item.price * item.qty).toFixed(1)}
                            </p>
                          </div>
                          <p className="text-xs text-sage-400 mt-0.5">
                            ${item.price.toFixed(1)} x{item.qty}
                          </p>
                          {/* Customization row */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5">
                              <Receipt size={11} className="text-sage-400" />
                              <span className="text-[11px] text-sage-500">
                                {item.customization}
                              </span>
                            </div>
                            {/* Qty stepper */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => changeQty(item.id, -1)}
                                className="w-6 h-6 rounded-full border border-sage-300 flex items-center justify-center text-sage-600 hover:bg-sage-50 transition-colors"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="text-sm font-semibold text-sage-900 w-4 text-center">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => changeQty(item.id, 1)}
                                className="w-6 h-6 rounded-full border border-sage-300 flex items-center justify-center text-sage-600 hover:bg-sage-50 transition-colors"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Payment Summary + CTA */}
              <div className="px-5 pt-3 pb-5 border-t border-sage-100 flex-shrink-0 space-y-4">
                <div>
                  <p className="text-sm font-bold text-sage-900 mb-2">
                    Payment Details
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Subtotal", value: subtotal },
                      { label: "Tax (10%)", value: tax },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-sage-500">{label}</span>
                        <span className="font-medium text-sage-800">
                          ${value.toFixed(1)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-1 border-t border-sage-100 mt-1">
                      <span className="font-bold text-sage-900">Total</span>
                      <span className="font-bold text-sage-900">
                        ${total.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={!cartItems.length}
                  className="w-full flex items-center justify-between bg-sage-800 hover:bg-sage-700 active:bg-sage-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl px-5 py-4 transition-colors shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <ChevronRight size={18} className="text-white" />
                  </div>
                  <span className="font-semibold text-base">
                    Place Order ${total.toFixed(1)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <ChevronRight size={18} className="text-white" />
                  </div>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── Orders History Modal ── */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 p-4 md:p-8"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="h-full max-h-[760px] mx-auto max-w-5xl bg-cream-50 rounded-3xl border border-sage-200 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[320px,1fr]"
            >
              <div className="border-r border-sage-100 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-sage-900">Orders History</h3>
                  <button
                    onClick={() => setHistoryOpen(false)}
                    className="w-8 h-8 rounded-full border border-sage-200 flex items-center justify-center hover:bg-sage-50"
                  >
                    <X size={14} className="text-sage-600" />
                  </button>
                </div>
                <div className="space-y-2">
                  {orderHistory.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`w-full text-left rounded-2xl border p-3 transition-colors ${selectedOrderId === order.id ? "border-sage-500 bg-sage-50" : "border-sage-200 bg-white hover:bg-sage-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sage-900">{order.ticketNumber}</p>
                        <p className="text-sm font-bold text-sage-900">${order.total.toFixed(1)}</p>
                      </div>
                      <p className="text-xs text-sage-500 mt-1">{order.customerName} • {order.orderType}</p>
                      <p className="text-xs text-sage-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 md:p-6 overflow-y-auto">
                {selectedOrder ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm text-sage-500">Command Ticket</p>
                        <h3 className="text-2xl font-bold text-sage-900">{selectedOrder.ticketNumber}</h3>
                      </div>
                      <button
                        onClick={() => printTicket(selectedOrder)}
                        className="flex items-center gap-2 rounded-xl border border-sage-300 bg-white px-3 py-2 text-sm font-semibold text-sage-700 hover:bg-sage-50"
                      >
                        <Printer size={14} /> Print Ticket
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="bg-white rounded-2xl border border-sage-200 p-3">
                        <p className="text-xs text-sage-500">Customer</p>
                        <p className="font-semibold text-sage-900">{selectedOrder.customerName}</p>
                      </div>
                      <div className="bg-white rounded-2xl border border-sage-200 p-3">
                        <p className="text-xs text-sage-500">Type</p>
                        <p className="font-semibold text-sage-900">{selectedOrder.orderType}</p>
                      </div>
                      <div className="bg-white rounded-2xl border border-sage-200 p-3">
                        <p className="text-xs text-sage-500">Created</p>
                        <p className="font-semibold text-sage-900 flex items-center gap-1.5">
                          <CalendarClock size={13} className="text-sage-500" />
                          {formatDateTime(selectedOrder.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-sage-200 p-3 mb-4">
                      <p className="text-sm font-semibold text-sage-900 mb-2">Items</p>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item) => (
                          <div key={`${selectedOrder.id}-${item.id}`} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium text-sage-900">{item.name} x{item.qty}</p>
                              <p className="text-xs text-sage-500">{item.customization}</p>
                            </div>
                            <p className="font-semibold text-sage-900">${(item.price * item.qty).toFixed(1)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-sage-200 p-4">
                      <div className="flex justify-between text-sm text-sage-600"><span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(1)}</span></div>
                      <div className="flex justify-between text-sm text-sage-600 mt-1"><span>Tax</span><span>${selectedOrder.tax.toFixed(1)}</span></div>
                      <div className="flex justify-between text-base font-bold text-sage-900 mt-2 pt-2 border-t border-sage-100"><span>Total</span><span>${selectedOrder.total.toFixed(1)}</span></div>
                    </div>
                  </>
                ) : (
                  <p className="text-sage-500">Select an order to view details.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Payment Ticket Modal ── */}
      <AnimatePresence>
        {ticketOpen && latestTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-md bg-cream-50 rounded-3xl border border-sage-200 shadow-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-sage-500">Payment received</p>
                  <h3 className="text-2xl font-bold text-sage-900">{latestTicket.ticketNumber}</h3>
                </div>
                <button
                  onClick={() => setTicketOpen(false)}
                  className="w-8 h-8 rounded-full border border-sage-200 flex items-center justify-center hover:bg-sage-50"
                >
                  <X size={14} className="text-sage-600" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-sage-200 p-3 space-y-1 mb-4">
                <div className="flex justify-between text-sm"><span className="text-sage-500">Customer</span><span className="font-medium text-sage-900">{latestTicket.customerName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-sage-500">Type</span><span className="font-medium text-sage-900">{latestTicket.orderType}</span></div>
                <div className="flex justify-between text-sm"><span className="text-sage-500">Total paid</span><span className="font-bold text-sage-900">${latestTicket.total.toFixed(1)}</span></div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => printTicket(latestTicket)}
                  className="flex-1 rounded-xl border border-sage-300 bg-white px-3 py-2 text-sm font-semibold text-sage-700 hover:bg-sage-50"
                >
                  <span className="inline-flex items-center gap-1.5"><Printer size={14} /> Print Ticket</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedOrderId(latestTicket.id);
                    setTicketOpen(false);
                    setHistoryOpen(true);
                  }}
                  className="flex-1 rounded-xl bg-sage-800 px-3 py-2 text-sm font-semibold text-white hover:bg-sage-700"
                >
                  View Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
