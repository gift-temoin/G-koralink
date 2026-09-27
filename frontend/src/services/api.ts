/**
 * G KORALINK API Service
 * Routes all requests through the in-browser mock database (mockDb.ts).
 * The app is fully self-contained — no backend server required.
 */

import { mockApi, seedDatabase } from './mockDb';

// Seed initial data on first load
seedDatabase();

function getToken(): string {
  return localStorage.getItem('g_koralink_token') || '';
}

// Simulate async delay to mimic network (feels real)
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function call(fn: () => any): Promise<{ data: any }> {
  await delay();
  try {
    const result = fn();
    return { data: result };
  } catch (err: any) {
    throw new Error(err.message || 'Habaye ikibazo. Ongera ugerageze nyuma gato.');
  }
}

const api = {
  post: async (url: string, body?: any) => {
    const token = getToken();

    // AUTH
    if (url === '/auth/register') return call(() => mockApi.authRegister(body));
    if (url === '/auth/login') return call(() => mockApi.authLogin(body.phone_number, body.password));

    // IKIBINA
    const joinMatch = url.match(/^\/ikibina\/(\d+)\/join$/);
    if (joinMatch) return call(() => mockApi.joinIkibina(token, parseInt(joinMatch[1])));

    // SAVINGS
    if (url === '/savings') return call(() => mockApi.submitSavings(token, body));
    const approveSavingMatch = url.match(/^\/savings\/(\d+)\/approve$/);
    if (approveSavingMatch) return call(() => mockApi.approveSaving(token, parseInt(approveSavingMatch[1])));
    const rejectSavingMatch = url.match(/^\/savings\/(\d+)\/reject$/);
    if (rejectSavingMatch) return call(() => mockApi.rejectSaving(token, parseInt(rejectSavingMatch[1]), body?.reason || ''));

    // LOANS
    if (url === '/loans') return call(() => mockApi.requestLoan(token, body));
    const approveLoanMatch = url.match(/^\/loans\/(\d+)\/approve$/);
    if (approveLoanMatch) return call(() => mockApi.approveLoan(token, parseInt(approveLoanMatch[1]), body?.approved_amount));
    const rejectLoanMatch = url.match(/^\/loans\/(\d+)\/reject$/);
    if (rejectLoanMatch) return call(() => mockApi.rejectLoan(token, parseInt(rejectLoanMatch[1]), body?.reason || ''));
    const repaymentMatch = url.match(/^\/loans\/(\d+)\/repayments$/);
    if (repaymentMatch) return call(() => mockApi.submitRepayment(token, parseInt(repaymentMatch[1]), body));
    const approveRepayMatch = url.match(/^\/loans\/repayments\/(\d+)\/approve$/);
    if (approveRepayMatch) return call(() => mockApi.approveRepayment(token, parseInt(approveRepayMatch[1])));

    // NOTIFICATIONS
    const markReadMatch = url.match(/^\/notifications\/(\d+)\/read$/);
    if (markReadMatch) return call(() => mockApi.markNotificationRead(token, parseInt(markReadMatch[1])));
    if (url === '/notifications/read-all') return call(() => mockApi.markAllNotificationsRead(token));

    // ADMIN - IKIBINA
    if (url === '/admin/ikibina') return call(() => mockApi.adminCreateIkibina(token, body));
    const toggleIkibinaMatch = url.match(/^\/admin\/ikibina\/(\d+)\/toggle$/);
    if (toggleIkibinaMatch) return call(() => mockApi.adminToggleIkibina(token, parseInt(toggleIkibinaMatch[1])));

    // ADMIN - USERS
    const toggleUserMatch = url.match(/^\/admin\/users\/(\d+)\/toggle$/);
    if (toggleUserMatch) return call(() => mockApi.adminToggleUser(token, parseInt(toggleUserMatch[1])));

    // ADMIN - PROFITS
    if (url === '/admin/profits') return call(() => mockApi.adminAddProfit(token, body));

    throw new Error(`POST ${url} habonetse nabi`);
  },

  get: async (url: string, config?: any) => {
    const token = config?.headers?.Authorization?.replace('Bearer ', '') || getToken();

    // AUTH
    if (url === '/auth/me') return call(() => mockApi.authMe(token));

    // USER
    if (url === '/users/me') return call(() => mockApi.getMe(token));
    if (url === '/users/me/dashboard') return call(() => mockApi.getDashboard(token));

    // IKIBINA
    if (url === '/ikibina' || url.startsWith('/ikibina?')) {
      const showAll = url.includes('show_all=true');
      return call(() => mockApi.getIkibina(token, showAll));
    }

    // SAVINGS
    if (url === '/savings/me') return call(() => mockApi.getMySavings(token));
    if (url === '/savings' || url.startsWith('/savings?')) {
      const statusMatch = url.match(/status=([^&]+)/);
      const status = statusMatch ? decodeURIComponent(statusMatch[1]) : undefined;
      return call(() => mockApi.getAllSavings(token, status));
    }

    // LOANS
    if (url === '/loans/me') return call(() => mockApi.getMyLoans(token));
    if (url === '/loans' || url.startsWith('/loans?')) {
      const statusMatch = url.match(/status=([^&]+)/);
      const status = statusMatch ? decodeURIComponent(statusMatch[1]) : undefined;
      return call(() => mockApi.getAllLoans(token, status));
    }

    // NOTIFICATIONS
    if (url === '/notifications') return call(() => mockApi.getMyNotifications(token));

    // ADMIN
    if (url === '/admin/dashboard') return call(() => mockApi.adminDashboard(token));
    if (url === '/admin/users') return call(() => mockApi.adminGetUsers(token));
    if (url === '/admin/profits') return call(() => mockApi.adminGetProfits(token));
    if (url === '/admin/reports') return call(() => mockApi.adminGetReports(token));
    if (url === '/admin/audit') return call(() => mockApi.adminGetAuditLogs(token));

    const adminUserMatch = url.match(/^\/admin\/users\/(\d+)$/);
    if (adminUserMatch) return call(() => mockApi.adminGetUser(token, parseInt(adminUserMatch[1])));

    throw new Error(`GET ${url} habonetse nabi`);
  },

  put: async (url: string, body?: any) => {
    const token = getToken();

    if (url === '/users/me') return call(() => mockApi.updateMe(token, body));
    if (url === '/users/me/password') return call(() => mockApi.changePassword(token, body.old_password, body.new_password));

    // ADMIN - IKIBINA UPDATE
    const updateIkibinaMatch = url.match(/^\/admin\/ikibina\/(\d+)$/);
    if (updateIkibinaMatch) return call(() => mockApi.adminUpdateIkibina(token, parseInt(updateIkibinaMatch[1]), body));

    throw new Error(`PUT ${url} habonetse nabi`);
  },

  delete: async (url: string) => {
    return { data: {} };
  },

  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};

export default api;
