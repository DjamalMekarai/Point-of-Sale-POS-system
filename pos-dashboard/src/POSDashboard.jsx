import { useState } from "react";
import {
  Search,
  Bell,
  FileText,
  Plus,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";

const categories = [
  {
    id: "coffee",
    name: "Coffee",
    items: 50,
    status: "Available",
    statusColor: "bg-white text-sage-800 border border-sage-200",
    bg: "bg-white",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "tea",
    name: "Tea",
    items: 20,
    status: "Available",
    statusColor: "bg-white text-sage-800 border border-sage-200",
    bg: "bg-coral-100",
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "snack",
    name: "Snack",
    items: 10,
    status: "Need to re-stock",
    statusColor: "bg-coral-100 text-red-700",
    bg: "bg-white",
    image:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop&auto=format",
    warning: true,
  },
];

const teaProducts = [
  {
    name: "Green Jasmine Tea",
    price: "$4.00",
    image:
      "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Earl Grey",
    price: "$4.50",
    image:
      "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Chamomile",
    price: "$4.00",
    image:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Peppermint Tea",
    price: "$4.00",
    image:
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Rooibos Chai",
    price: "$4.00",
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Hibiscus Berry Tea",
    price: "$3.80",
    image:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Darjeeling",
    price: "$4.00",
    image:
      "https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Genmaicha",
    price: "$3.80",
    image:
      "https://images.unsplash.com/photo-1563822249548-9a72b6353d08?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Sencha",
    price: "$4.00",
    image:
      "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "White Peony",
    price: "$4.20",
    image:
      "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Lemon Ginger",
    price: "$3.50",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Moroccan Mint",
    price: "$4.00",
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Lapsang Souchong",
    price: "$4.50",
    image:
      "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Dragon Well",
    price: "$5.00",
    image:
      "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Lemongrass Tea",
    price: "$3.50",
    image:
      "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop&auto=format",
  },
];

export default function POSDashboard() {
  const [activeCategory, setActiveCategory] = useState("tea");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = teaProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream-50 font-sans flex flex-col">
      <div className="w-full flex-1 overflow-hidden flex flex-col">
        {/* ── Header ── */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-sage-100 bg-cream-50">
          {/* Logo + Date */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sage-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">GG</span>
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-sage-800">
                  Green
                </p>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-sage-800">
                  Grounds
                </p>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-sage-600">
                  Coffee
                </p>
              </div>
            </div>
            <span className="text-sm text-sage-700 font-medium hidden sm:inline">
              Thursday, 23 June
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-sage-600 hidden md:inline">
              Total : <strong className="text-sage-800">20 Orders</strong>
            </span>

            <button className="flex items-center gap-1.5 text-sm font-medium text-sage-800 hover:text-sage-600 transition-colors">
              <span>Report</span>
              <FileText size={16} />
            </button>

            <div className="relative">
              <Bell size={20} className="text-sage-700 cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                1
              </span>
            </div>

            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format"
                alt="Samantha W"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-sage-800">
                  Samantha W
                </p>
                <p className="text-xs text-sage-500">Cashier</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="p-5 md:p-6 space-y-5">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl border border-sage-200 px-4 py-2.5 shadow-sm">
              <Search size={18} className="text-sage-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sage-800 placeholder-sage-400 text-sm"
              />
            </div>
            <button className="w-10 h-10 rounded-2xl bg-white border border-sage-200 flex items-center justify-center shadow-sm hover:bg-sage-50 transition-colors">
              <SlidersHorizontal size={18} className="text-sage-600" />
            </button>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-3 gap-4">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative rounded-3xl p-4 flex items-center justify-between overflow-hidden transition-all duration-200 text-left cursor-pointer
                    ${isActive ? "bg-coral-100 ring-2 ring-coral-300" : "bg-white border border-sage-200 hover:border-sage-300"}
                  `}
                  style={{ minHeight: "110px" }}
                >
                  <div className="relative z-10">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-2 ${cat.warning ? cat.statusColor : isActive ? "bg-white/80 text-sage-700" : "bg-sage-50 text-sage-600 border border-sage-200"}`}
                    >
                      {cat.status}
                      {cat.warning && (
                        <AlertCircle size={10} className="inline ml-1 -mt-px" />
                      )}
                    </span>
                    <h3 className="text-lg font-bold text-sage-900">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-sage-500">{cat.items} Items</p>
                  </div>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute right-2 bottom-0 w-24 h-24 object-contain opacity-80"
                  />
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.name}
                className="bg-white border border-sage-200 rounded-3xl p-3 flex flex-col items-center transition-shadow hover:shadow-md group"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-sage-50 flex items-center justify-center mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-4/5 h-4/5 object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="w-full flex items-end justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-sage-900 leading-tight">
                      {product.name}
                    </h4>
                    <p className="text-sm text-sage-600 mt-0.5">
                      {product.price}
                    </p>
                  </div>
                  <button className="w-8 h-8 rounded-full border-2 border-sage-700 flex items-center justify-center text-sage-700 hover:bg-sage-700 hover:text-white transition-colors flex-shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
