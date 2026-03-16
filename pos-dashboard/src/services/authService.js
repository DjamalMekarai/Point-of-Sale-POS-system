const STORAGE_KEY = "ggc_auth_user";

// Mock user database – in a real app this would be a backend call
const MOCK_USERS = [
  {
    id: 1,
    name: "Adam S",
    email: "admin@coffee.com",
    password: "password",
    role: "admin",
    avatar: "https://i.pravatar.cc/80?img=7",
  },
  {
    id: 2,
    name: "Samantha W",
    email: "staff@coffee.com",
    password: "password",
    role: "staff",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
  },
];

// Runtime registry for new signups (resets on page reload — demo only)
const runtimeUsers = [...MOCK_USERS];

export const authService = {
  /**
   * Authenticate a user. Returns the session object or throws.
   */
  login(email, password) {
    const user = runtimeUsers.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );
    if (!user) throw new Error("Invalid email or password.");
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Register a new user as staff. Returns the session object or throws.
   */
  signup(name, email, password) {
    const exists = runtimeUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) throw new Error("An account with this email already exists.");
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: "staff",
      avatar: `https://i.pravatar.cc/80?u=${email}`,
    };
    runtimeUsers.push(newUser);
    const session = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
  },

  getUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getUser();
  },
};
