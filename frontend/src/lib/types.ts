export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at?: string;
}

export interface Group {
  id: string;
  name: string;
  created_by: string;
  members: { user_id: string; role: string; full_name?: string | null }[];
  custom_categories: string[];
  created_at?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_by: string;
  group_id: string;
  created_at?: string;
}

export interface Stats {
  total: number;
  by_category: { category: string; total: number }[];
  by_user: { user_id: string; total: number }[];
  monthly: { year: number; month: number; total: number }[];
}
