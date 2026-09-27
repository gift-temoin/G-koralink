export interface User {
  id: number;
  amazina_ya_mbere: string;
  izina_rya_kabiri: string;
  full_name: string;
  phone_number: string;
  location: string;
  role: 'UMUKORESHA' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  current_ikibina_id?: number;
  current_ikibina_name?: string;
}

export interface IkibinaGroup {
  id: number;
  name: string;
  contribution_amount: number;
  frequency: string;
  max_members: number;
  current_members_count: number;
  start_date: string;
  end_date: string;
  description: string;
  is_active: boolean;
  profit_enabled: boolean;
  profit_rate: number;
  created_at: string;
  is_joined?: boolean;
}

export interface SavingsTransaction {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  group_id: number;
  group_name: string;
  amount: number;
  payment_method: string;
  payment_reference: string;
  status: 'Bitegereje kwemezwa' | 'Byemejwe' | 'Byanzwe';
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
}

export interface LoanRepayment {
  id: number;
  loan_id: number;
  user_id: number;
  user_name: string;
  amount: number;
  payment_reference: string;
  status: 'Bitegereje kwemezwa' | 'Byemejwe' | 'Byanzwe';
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
}

export interface LoanRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  requested_amount: number;
  approved_amount?: number;
  reason: string;
  repayment_months: number;
  status: 'Bitegereje' | 'Yemejwe' | 'Yanzwe' | 'Iri kwishyura' | 'Yarangiye';
  rejection_reason?: string;
  interest_rate: number;
  total_repaid: number;
  remaining_balance: number;
  due_date?: string;
  created_at: string;
  approved_at?: string;
  repayments: LoanRepayment[];
}

export type LoanOut = LoanRequest;

export interface ProfitRecord {
  id: number;
  user_id: number;
  amount: number;
  description: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface UserDashboardStats {
  user_name: string;
  total_savings: number;
  pending_savings: number;
  total_profit: number;
  remaining_loan_balance: number;
  approved_loan_limit: number;
  total_repaid_loans: number;
  remaining_loan_to_pay: number;
  pending_loans_count: number;
  current_ikibina_name?: string;
}

export interface AdminDashboardStats {
  total_users: number;
  new_users_this_month: number;
  active_ikibina_count: number;
  total_savings_approved: number;
  pending_savings_amount: number;
  pending_loans_count: number;
  approved_loans_count: number;
  total_outstanding_loans: number;
  total_repaid_loans: number;
}

export interface FinancialReport {
  period: string;
  total_savings: number;
  pending_savings: number;
  approved_loans: number;
  pending_loans: number;
  loan_repayments: number;
  outstanding_loans: number;
  net_fund_balance: number;
  transactions_count: number;
}

export interface AuditLog {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  previous_value?: string;
  new_value?: string;
  timestamp: string;
}
