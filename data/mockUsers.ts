export interface UserOrder {
  id: string;
  service: string;
  quantity: number;
  status: "completed" | "processing" | "shipped" | "cancelled";
  total: number;
  date: string;
}

export interface UserSubscription {
  plan: string;
  billingCycle: "monthly" | "annual";
  status: "active" | "cancelled" | "past_due";
  renewalDate: string;
  paymentHistory: { date: string; amount: number; status: string }[];
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: "user" | "admin";
  orders: number;
  totalSpent: number;
  status: "active" | "suspended";
  joinedDate: string;
  phone: string;
  address: string;
  subscription: UserSubscription;
  orderHistory: UserOrder[];
}

export const mockUsers: MockUser[] = [
  {
    id: "u1",
    name: "Sarah Mitchell",
    email: "sarah@brightprint.com",
    company: "BrightPrint Co.",
    role: "user",
    orders: 47,
    totalSpent: 12450,
    status: "active",
    joinedDate: "2024-01-15",
    phone: "+1 (555) 234-5678",
    address: "123 Print Ave, New York, NY 10001",
    subscription: {
      plan: "Professional",
      billingCycle: "annual",
      status: "active",
      renewalDate: "2026-01-15",
      paymentHistory: [
        { date: "2025-01-15", amount: 599, status: "paid" },
        { date: "2024-01-15", amount: 599, status: "paid" },
      ],
    },
    orderHistory: [
      { id: "ORD-1001", service: "Business Cards (500)", quantity: 500, status: "completed", total: 89, date: "2026-02-28" },
      { id: "ORD-1002", service: "Flyers A4 (1000)", quantity: 1000, status: "processing", total: 245, date: "2026-03-05" },
      { id: "ORD-1003", service: "Brochures Tri-fold (250)", quantity: 250, status: "shipped", total: 320, date: "2026-03-01" },
    ],
  },
  {
    id: "u2",
    name: "James Rodriguez",
    email: "james@megaads.io",
    company: "MegaAds Agency",
    role: "user",
    orders: 112,
    totalSpent: 34780,
    status: "active",
    joinedDate: "2023-06-22",
    phone: "+1 (555) 876-5432",
    address: "456 Banner Blvd, Los Angeles, CA 90001",
    subscription: {
      plan: "Enterprise",
      billingCycle: "annual",
      status: "active",
      renewalDate: "2026-06-22",
      paymentHistory: [
        { date: "2025-06-22", amount: 1299, status: "paid" },
        { date: "2024-06-22", amount: 1299, status: "paid" },
      ],
    },
    orderHistory: [
      { id: "ORD-2001", service: "Vinyl Banners (10)", quantity: 10, status: "completed", total: 890, date: "2026-02-20" },
      { id: "ORD-2002", service: "Posters 24x36 (500)", quantity: 500, status: "completed", total: 1250, date: "2026-02-15" },
      { id: "ORD-2003", service: "Stickers (5000)", quantity: 5000, status: "processing", total: 430, date: "2026-03-07" },
    ],
  },
  {
    id: "u3",
    name: "Emily Chen",
    email: "emily@designhub.co",
    company: "DesignHub Studios",
    role: "admin",
    orders: 23,
    totalSpent: 5670,
    status: "active",
    joinedDate: "2024-08-10",
    phone: "+1 (555) 345-6789",
    address: "789 Creative St, San Francisco, CA 94102",
    subscription: {
      plan: "Professional",
      billingCycle: "monthly",
      status: "active",
      renewalDate: "2026-04-10",
      paymentHistory: [
        { date: "2026-03-10", amount: 59, status: "paid" },
        { date: "2026-02-10", amount: 59, status: "paid" },
      ],
    },
    orderHistory: [
      { id: "ORD-3001", service: "Booklets A5 (100)", quantity: 100, status: "completed", total: 560, date: "2026-01-18" },
    ],
  },
  {
    id: "u4",
    name: "Marcus Johnson",
    email: "marcus@quickcopy.net",
    company: "QuickCopy LLC",
    role: "user",
    orders: 8,
    totalSpent: 1230,
    status: "suspended",
    joinedDate: "2025-03-01",
    phone: "+1 (555) 456-7890",
    address: "321 Copy Lane, Chicago, IL 60601",
    subscription: {
      plan: "Starter",
      billingCycle: "monthly",
      status: "past_due",
      renewalDate: "2026-03-01",
      paymentHistory: [
        { date: "2026-02-01", amount: 29, status: "failed" },
        { date: "2026-01-01", amount: 29, status: "paid" },
      ],
    },
    orderHistory: [
      { id: "ORD-4001", service: "Flyers A5 (500)", quantity: 500, status: "cancelled", total: 120, date: "2026-02-10" },
    ],
  },
  {
    id: "u5",
    name: "Aisha Patel",
    email: "aisha@eventprint.com",
    company: "EventPrint Solutions",
    role: "user",
    orders: 65,
    totalSpent: 18900,
    status: "active",
    joinedDate: "2023-11-05",
    phone: "+1 (555) 567-8901",
    address: "654 Event Dr, Miami, FL 33101",
    subscription: {
      plan: "Enterprise",
      billingCycle: "annual",
      status: "active",
      renewalDate: "2026-11-05",
      paymentHistory: [
        { date: "2025-11-05", amount: 1299, status: "paid" },
      ],
    },
    orderHistory: [
      { id: "ORD-5001", service: "Event Banners (20)", quantity: 20, status: "completed", total: 1780, date: "2026-03-02" },
      { id: "ORD-5002", service: "Invitations (2000)", quantity: 2000, status: "shipped", total: 640, date: "2026-03-04" },
    ],
  },
  {
    id: "u6",
    name: "Tom Bradley",
    email: "tom@localshop.com",
    company: "Local Shop Inc.",
    role: "user",
    orders: 3,
    totalSpent: 340,
    status: "active",
    joinedDate: "2026-02-14",
    phone: "+1 (555) 678-9012",
    address: "987 Main St, Denver, CO 80201",
    subscription: {
      plan: "Starter",
      billingCycle: "monthly",
      status: "active",
      renewalDate: "2026-04-14",
      paymentHistory: [
        { date: "2026-03-14", amount: 29, status: "paid" },
      ],
    },
    orderHistory: [
      { id: "ORD-6001", service: "Business Cards (250)", quantity: 250, status: "completed", total: 55, date: "2026-02-20" },
      { id: "ORD-6002", service: "Flyers A4 (200)", quantity: 200, status: "completed", total: 78, date: "2026-03-01" },
    ],
  },
  {
    id: "u7",
    name: "Lisa Wong",
    email: "lisa@artcraft.co",
    company: "ArtCraft Designs",
    role: "user",
    orders: 31,
    totalSpent: 9450,
    status: "active",
    joinedDate: "2024-04-20",
    phone: "+1 (555) 789-0123",
    address: "159 Art Blvd, Portland, OR 97201",
    subscription: {
      plan: "Professional",
      billingCycle: "annual",
      status: "active",
      renewalDate: "2026-04-20",
      paymentHistory: [
        { date: "2025-04-20", amount: 599, status: "paid" },
      ],
    },
    orderHistory: [
      { id: "ORD-7001", service: "Canvas Prints (5)", quantity: 5, status: "completed", total: 425, date: "2026-02-25" },
      { id: "ORD-7002", service: "Art Prints A3 (100)", quantity: 100, status: "processing", total: 310, date: "2026-03-06" },
    ],
  },
  {
    id: "u8",
    name: "David Kim",
    email: "david@packpro.io",
    company: "PackPro Packaging",
    role: "user",
    orders: 89,
    totalSpent: 42100,
    status: "suspended",
    joinedDate: "2023-02-11",
    phone: "+1 (555) 890-1234",
    address: "753 Pack Way, Houston, TX 77001",
    subscription: {
      plan: "Enterprise",
      billingCycle: "annual",
      status: "cancelled",
      renewalDate: "2026-02-11",
      paymentHistory: [
        { date: "2025-02-11", amount: 1299, status: "paid" },
        { date: "2024-02-11", amount: 1299, status: "paid" },
      ],
    },
    orderHistory: [
      { id: "ORD-8001", service: "Custom Boxes (1000)", quantity: 1000, status: "completed", total: 3200, date: "2026-01-15" },
      { id: "ORD-8002", service: "Labels (10000)", quantity: 10000, status: "completed", total: 890, date: "2026-01-28" },
    ],
  },
];
