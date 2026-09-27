/**
 * G KORALINK - Mock In-Browser Database
 * Simulates the FastAPI backend using localStorage.
 * All data is persisted in the browser across sessions.
 */

import { User, IkibinaGroup, SavingsTransaction, LoanRequest, LoanRepayment, ProfitRecord, NotificationItem } from '../types';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function now() { return new Date().toISOString(); }

function genId(key: string): number {
  const val = parseInt(localStorage.getItem(`gk_seq_${key}`) || '0', 10) + 1;
  localStorage.setItem(`gk_seq_${key}`, String(val));
  return val;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Simple bcrypt-like hash (just for demo — NOT cryptographically secure)
function hashPassword(pw: string): string {
  // We'll store a deterministic "hash" by encoding
  return btoa(unescape(encodeURIComponent(pw + '_gk_salt_2026')));
}

function checkPassword(plain: string, hashed: string): boolean {
  return hashPassword(plain) === hashed;
}

function fakeJwt(userId: number): string {
  const payload = btoa(JSON.stringify({ sub: userId, exp: Date.now() + 86400000 }));
  return `gk.${payload}.mock`;
}

function decodeJwt(token: string): { sub: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

// ─── Storage Keys ───────────────────────────────────────────────────────────

const KEYS = {
  users: 'gk_users',
  ikibina: 'gk_ikibina',
  members: 'gk_members',
  savings: 'gk_savings',
  loans: 'gk_loans',
  repayments: 'gk_repayments',
  profits: 'gk_profits',
  notifications: 'gk_notifications',
  audit: 'gk_audit',
  seeded: 'gk_seeded',
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

export function seedDatabase() {
  if (localStorage.getItem(KEYS.seeded)) return;

  // Admin user
  const admin: User & { password_hash: string } = {
    id: 1,
    amazina_ya_mbere: 'Enock',
    izina_rya_kabiri: 'Irankunda',
    full_name: 'Enock Irankunda',
    phone_number: '0784772228',
    location: 'Kigali, Rwanda',
    role: 'ADMIN',
    is_active: true,
    created_at: now(),
    password_hash: hashPassword('Enock@koralinK'),
  } as any;

  // Sample users
  const users: Array<User & { password_hash: string }> = [
    admin,
    {
      id: 2, amazina_ya_mbere: 'Alice', izina_rya_kabiri: 'Mutoni', full_name: 'Alice Mutoni',
      phone_number: '0781234567', location: 'Musanze', role: 'UMUKORESHA',
      is_active: true, created_at: now(), password_hash: hashPassword('Alice@2026'),
      current_ikibina_id: 1, current_ikibina_name: 'Ikibina Inkingi',
    } as any,
    {
      id: 3, amazina_ya_mbere: 'Jean', izina_rya_kabiri: 'Bizimana', full_name: 'Jean Bizimana',
      phone_number: '0789876543', location: 'Huye', role: 'UMUKORESHA',
      is_active: true, created_at: now(), password_hash: hashPassword('Jean@2026'),
      current_ikibina_id: 1, current_ikibina_name: 'Ikibina Inkingi',
    } as any,
    {
      id: 4, amazina_ya_mbere: 'Marie', izina_rya_kabiri: 'Uwamahoro', full_name: 'Marie Uwamahoro',
      phone_number: '0722111222', location: 'Rubavu', role: 'UMUKORESHA',
      is_active: true, created_at: now(), password_hash: hashPassword('Marie@2026'),
      current_ikibina_id: 2, current_ikibina_name: 'Ikibina Amahoro',
    } as any,
  ];

  // Ikibina groups
  const ikibina: IkibinaGroup[] = [
    {
      id: 1, name: 'Ikibina Inkingi', contribution_amount: 10000, frequency: 'Buri kwezi',
      max_members: 20, current_members_count: 2, start_date: '2026-01-01', end_date: '2026-12-31',
      description: 'Ikibina cy\'inkunga y\'abakozi n\'abahinzi bo mu Rwanda.',
      is_active: true, profit_enabled: true, profit_rate: 5, created_at: now(), is_joined: false,
    },
    {
      id: 2, name: 'Ikibina Amahoro', contribution_amount: 5000, frequency: 'Buri kwezi',
      max_members: 15, current_members_count: 1, start_date: '2026-02-01', end_date: '2026-12-31',
      description: 'Ikibina cy\'amahoro no guteza imbere abanyamuryango.',
      is_active: true, profit_enabled: false, profit_rate: 0, created_at: now(), is_joined: false,
    },
    {
      id: 3, name: 'Ikibina Ubwoba', contribution_amount: 20000, frequency: 'Buri kwezi',
      max_members: 10, current_members_count: 0, start_date: '2026-03-01', end_date: '2026-12-31',
      description: 'Ikibina cy\'inguzanyo zo mu rwego rwo hejuru.',
      is_active: false, profit_enabled: true, profit_rate: 8, created_at: now(), is_joined: false,
    },
  ];

  // Members
  const members = [
    { id: 1, user_id: 2, group_id: 1, joined_at: now() },
    { id: 2, user_id: 3, group_id: 1, joined_at: now() },
    { id: 3, user_id: 4, group_id: 2, joined_at: now() },
  ];

  // Sample savings
  const savings: SavingsTransaction[] = [
    {
      id: 1, user_id: 2, user_name: 'Alice Mutoni', user_phone: '0781234567',
      group_id: 1, group_name: 'Ikibina Inkingi', amount: 10000,
      payment_method: 'MTN MoMo', payment_reference: 'MM20260115001',
      status: 'Byemejwe', created_at: '2026-01-15T10:00:00Z', approved_at: '2026-01-16T08:00:00Z',
    },
    {
      id: 2, user_id: 2, user_name: 'Alice Mutoni', user_phone: '0781234567',
      group_id: 1, group_name: 'Ikibina Inkingi', amount: 10000,
      payment_method: 'MTN MoMo', payment_reference: 'MM20260215002',
      status: 'Byemejwe', created_at: '2026-02-15T10:00:00Z', approved_at: '2026-02-16T08:00:00Z',
    },
    {
      id: 3, user_id: 2, user_name: 'Alice Mutoni', user_phone: '0781234567',
      group_id: 1, group_name: 'Ikibina Inkingi', amount: 10000,
      payment_method: 'MTN MoMo', payment_reference: 'MM20260315003',
      status: 'Bitegereje kwemezwa', created_at: '2026-03-15T10:00:00Z',
    },
    {
      id: 4, user_id: 3, user_name: 'Jean Bizimana', user_phone: '0789876543',
      group_id: 1, group_name: 'Ikibina Inkingi', amount: 10000,
      payment_method: 'MTN MoMo', payment_reference: 'MM20260116004',
      status: 'Byemejwe', created_at: '2026-01-16T10:00:00Z', approved_at: '2026-01-17T08:00:00Z',
    },
    {
      id: 5, user_id: 4, user_name: 'Marie Uwamahoro', user_phone: '0722111222',
      group_id: 2, group_name: 'Ikibina Amahoro', amount: 5000,
      payment_method: 'MTN MoMo', payment_reference: 'MM20260120005',
      status: 'Byemejwe', created_at: '2026-01-20T10:00:00Z', approved_at: '2026-01-21T08:00:00Z',
    },
  ];

  // Sample loan
  const loans: LoanRequest[] = [
    {
      id: 1, user_id: 3, user_name: 'Jean Bizimana', user_phone: '0789876543',
      requested_amount: 50000, approved_amount: 50000,
      reason: 'Kubaka inzu nto yo guturamo', repayment_months: 6,
      status: 'Iri kwishyura', interest_rate: 10, total_repaid: 15000,
      remaining_balance: 35000, due_date: '2026-09-01',
      created_at: '2026-03-01T08:00:00Z', approved_at: '2026-03-03T08:00:00Z',
      repayments: [],
    },
  ];

  // Repayments
  const repayments: LoanRepayment[] = [
    {
      id: 1, loan_id: 1, user_id: 3, user_name: 'Jean Bizimana',
      amount: 15000, payment_reference: 'REP20260401001',
      status: 'Byemejwe', created_at: '2026-04-01T10:00:00Z', approved_at: '2026-04-02T08:00:00Z',
    },
  ];
  loans[0].repayments = repayments;

  // Profits
  const profits: ProfitRecord[] = [
    { id: 1, user_id: 2, amount: 1000, description: 'Inyungu ya Mutarama 2026 - Ikibina Inkingi', created_at: '2026-01-31T10:00:00Z' },
    { id: 2, user_id: 2, amount: 1000, description: 'Inyungu ya Gashyantare 2026 - Ikibina Inkingi', created_at: '2026-02-28T10:00:00Z' },
  ];

  // Notifications
  const notifications: NotificationItem[] = [
    { id: 1, title: 'Murakaza neza muri G KORALINK!', message: 'Konti yawe yafunguwe. Murakaza neza Alice Mutoni!', is_read: false, created_at: now() },
    { id: 2, title: 'Kwizigama byemejwe', message: 'Kwizigama kwawe kwa 10,000 Frw byemejwe n\'ubuyobozi.', is_read: true, created_at: '2026-01-16T08:00:00Z' },
  ];

  // Set sequences
  localStorage.setItem('gk_seq_users', '4');
  localStorage.setItem('gk_seq_savings', '5');
  localStorage.setItem('gk_seq_loans', '1');
  localStorage.setItem('gk_seq_repayments', '1');
  localStorage.setItem('gk_seq_profits', '2');
  localStorage.setItem('gk_seq_notifications', '2');
  localStorage.setItem('gk_seq_audit', '0');

  save(KEYS.users, users);
  save(KEYS.ikibina, ikibina);
  save(KEYS.members, members);
  save(KEYS.savings, savings);
  save(KEYS.loans, loans);
  save(KEYS.repayments, repayments);
  save(KEYS.profits, profits);
  save(KEYS.notifications, notifications);
  save(KEYS.audit, []);
  localStorage.setItem(KEYS.seeded, '1');
}

// ─── DB Access Helpers ────────────────────────────────────────────────────────

function getUsers() { return load<any[]>(KEYS.users, []); }
function getIkibina() { return load<IkibinaGroup[]>(KEYS.ikibina, []); }
function getMembers() { return load<any[]>(KEYS.members, []); }
function getSavings() { return load<SavingsTransaction[]>(KEYS.savings, []); }
function getLoans() { return load<LoanRequest[]>(KEYS.loans, []); }
function getRepayments() { return load<LoanRepayment[]>(KEYS.repayments, []); }
function getProfits() { return load<ProfitRecord[]>(KEYS.profits, []); }
function getNotifications() { return load<NotificationItem[]>(KEYS.notifications, []); }
function getAudit() { return load<any[]>(KEYS.audit, []); }

function getUserById(id: number) { return getUsers().find((u: any) => u.id === id) || null; }
function getUserByPhone(phone: string) { return getUsers().find((u: any) => u.phone_number === phone) || null; }

function cleanUser(u: any): User {
  const { password_hash, ...rest } = u;
  return rest;
}

function addNotification(userId: number, title: string, message: string) {
  const notifs = getNotifications();
  // Filter to user's notifications and add new one
  const allNotifs = load<any[]>('gk_all_notifications', []);
  const newNotif = { id: genId('notifications'), user_id: userId, title, message, is_read: false, created_at: now() };
  allNotifs.push(newNotif);
  save('gk_all_notifications', allNotifs);
}

// ─── AUTH ENDPOINTS ───────────────────────────────────────────────────────────

export const mockApi = {

  // POST /auth/register
  authRegister: (data: any) => {
    const users = getUsers();
    if (users.find((u: any) => u.phone_number === data.phone_number)) {
      throw new Error('Nimero ya telefoni yarabanza gukoreshwa. Gerageza iyindi.');
    }
    const newUser: any = {
      id: genId('users'),
      amazina_ya_mbere: data.amazina_ya_mbere,
      izina_rya_kabiri: data.izina_rya_kabiri,
      full_name: `${data.amazina_ya_mbere} ${data.izina_rya_kabiri}`,
      phone_number: data.phone_number,
      location: data.location || '',
      role: 'UMUKORESHA',
      is_active: true,
      created_at: now(),
      password_hash: hashPassword(data.password),
    };
    users.push(newUser);
    save(KEYS.users, users);

    // Welcome notification stored in user-specific key
    const nid = genId('notifications');
    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: nid, user_id: newUser.id,
      title: 'Murakaza neza muri G KORALINK!',
      message: `Murakaza neza ${newUser.full_name}! Konti yawe yafunguwe neza. Gutangira kwizigama muri Ikibina ugize inzira nziza.`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return { access_token: fakeJwt(newUser.id), token_type: 'bearer' };
  },

  // POST /auth/login
  authLogin: (phone_number: string, password: string) => {
    const user = getUserByPhone(phone_number);
    if (!user || !checkPassword(password, user.password_hash)) {
      throw new Error('Nimero ya telefoni cyangwa ijambobanga ntabwo ari byo. Ongera ugerageze.');
    }
    if (!user.is_active) {
      throw new Error('Konti yawe ihagaritswe. Vugana n\'ubuyobozi.');
    }
    return { access_token: fakeJwt(user.id), token_type: 'bearer' };
  },

  // GET /auth/me
  authMe: (token: string): User => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe. Banza winjire muri konti yawe.');
    const user = getUserById(payload.sub);
    if (!user) throw new Error('Ntabwo wemerewe. Banza winjire muri konti yawe.');
    return cleanUser(user);
  },

  // ─── USER ENDPOINTS ─────────────────────────────────────────────────────────

  // GET /users/me
  getMe: (token: string): User => mockApi.authMe(token),

  // PUT /users/me
  updateMe: (token: string, data: any): User => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const users = getUsers();
    const idx = users.findIndex((u: any) => u.id === payload.sub);
    if (idx < 0) throw new Error('Umutumiyi ntabwo abonetse.');
    users[idx] = { ...users[idx], ...data, full_name: `${data.amazina_ya_mbere || users[idx].amazina_ya_mbere} ${data.izina_rya_kabiri || users[idx].izina_rya_kabiri}` };
    save(KEYS.users, users);
    return cleanUser(users[idx]);
  },

  // PUT /users/me/password
  changePassword: (token: string, old_password: string, new_password: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const users = getUsers();
    const idx = users.findIndex((u: any) => u.id === payload.sub);
    if (idx < 0) throw new Error('Umutumiyi ntabwo abonetse.');
    if (!checkPassword(old_password, users[idx].password_hash)) {
      throw new Error('Ijambobanga rya kera ntabwo ari ryo. Ongera ugerageze.');
    }
    users[idx].password_hash = hashPassword(new_password);
    save(KEYS.users, users);
    return { message: 'Ijambobanga ryahindutse neza.' };
  },

  // GET /users/me/dashboard
  getDashboard: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const user = getUserById(payload.sub);
    if (!user) throw new Error('Umutumiyi ntabwo abonetse.');

    const userSavings = getSavings().filter((s: any) => s.user_id === payload.sub);
    const approvedSavings = userSavings.filter((s: any) => s.status === 'Byemejwe');
    const pendingSavings = userSavings.filter((s: any) => s.status === 'Bitegereje kwemezwa');
    const totalSavings = approvedSavings.reduce((sum: number, s: any) => sum + s.amount, 0);
    const pendingSavingsAmt = pendingSavings.reduce((sum: number, s: any) => sum + s.amount, 0);

    const userLoans = getLoans().filter((l: any) => l.user_id === payload.sub);
    const activeLoans = userLoans.filter((l: any) => l.status === 'Iri kwishyura' || l.status === 'Yemejwe');
    const remainingLoan = activeLoans.reduce((sum: number, l: any) => sum + (l.remaining_balance || 0), 0);
    const totalRepaid = userLoans.reduce((sum: number, l: any) => sum + (l.total_repaid || 0), 0);
    const pendingLoans = userLoans.filter((l: any) => l.status === 'Bitegereje').length;

    const userProfits = getProfits().filter((p: any) => p.user_id === payload.sub);
    const totalProfit = userProfits.reduce((sum: number, p: any) => sum + p.amount, 0);

    // Loan limit = 3x approved savings
    const approvedLoanLimit = totalSavings * 3;

    return {
      user_name: user.full_name,
      total_savings: totalSavings,
      pending_savings: pendingSavingsAmt,
      total_profit: totalProfit,
      remaining_loan_balance: remainingLoan,
      approved_loan_limit: approvedLoanLimit,
      total_repaid_loans: totalRepaid,
      remaining_loan_to_pay: remainingLoan,
      pending_loans_count: pendingLoans,
      current_ikibina_name: user.current_ikibina_name,
    };
  },

  // ─── IKIBINA ENDPOINTS ───────────────────────────────────────────────────────

  // GET /ikibina
  getIkibina: (token: string, showAll?: boolean) => {
    const payload = decodeJwt(token);
    const userId = payload?.sub;
    const members = getMembers();
    return getIkibina()
      .filter((g: any) => showAll || g.is_active)
      .map((g: any) => ({
        ...g,
        is_joined: members.some((m: any) => m.user_id === userId && m.group_id === g.id),
      }));
  },

  // POST /ikibina/{id}/join
  joinIkibina: (token: string, groupId: number) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const members = getMembers();
    if (members.some((m: any) => m.user_id === payload.sub && m.group_id === groupId)) {
      throw new Error('Wamaze kwiyandikisha muri iki kibina.');
    }
    // Check user not already in another group
    if (members.some((m: any) => m.user_id === payload.sub)) {
      throw new Error('Usanzwe uri mu kibina kimwe. Ntushobora kuba mu bibina bibiri.');
    }
    const group = getIkibina().find((g: any) => g.id === groupId);
    if (!group) throw new Error('Ikibina ntabwo kibonetse.');
    if (!group.is_active) throw new Error('Iki kibina kirahagaritswe.');
    if (group.current_members_count >= group.max_members) throw new Error('Ikibina cyuzuye abanyamuryango.');

    members.push({ id: genId('members'), user_id: payload.sub, group_id: groupId, joined_at: now() });
    save(KEYS.members, members);

    // Update group member count
    const ikibina = getIkibina();
    const gIdx = ikibina.findIndex((g: any) => g.id === groupId);
    if (gIdx >= 0) {
      (ikibina[gIdx] as any).current_members_count++;
      save(KEYS.ikibina, ikibina);
    }

    // Update user's current_ikibina
    const users = getUsers();
    const uIdx = users.findIndex((u: any) => u.id === payload.sub);
    if (uIdx >= 0) {
      users[uIdx].current_ikibina_id = groupId;
      users[uIdx].current_ikibina_name = group.name;
      save(KEYS.users, users);
    }

    return { message: `Wiyandikishije neza muri ${group.name}.` };
  },

  // ─── SAVINGS ENDPOINTS ────────────────────────────────────────────────────

  // POST /savings
  submitSavings: (token: string, data: any) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const user = getUserById(payload.sub);
    if (!user) throw new Error('Umutumiyi ntabwo abonetse.');
    const members = getMembers();
    if (!members.some((m: any) => m.user_id === payload.sub && m.group_id === data.group_id)) {
      throw new Error('Ntukiri mu kibina. Banza wiyandikishe muri ikibina.');
    }
    const group = getIkibina().find((g: any) => g.id === data.group_id);
    const savings = getSavings();
    const newSaving: any = {
      id: genId('savings'),
      user_id: payload.sub,
      user_name: user.full_name,
      user_phone: user.phone_number,
      group_id: data.group_id,
      group_name: group?.name || '',
      amount: data.amount,
      payment_method: data.payment_method || 'MTN MoMo',
      payment_reference: data.payment_reference || '',
      status: 'Bitegereje kwemezwa',
      created_at: now(),
    };
    savings.push(newSaving);
    save(KEYS.savings, savings);

    // Notification for admin
    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: genId('notifications'), user_id: 1,
      title: 'Kwizigama gushya', message: `${user.full_name} yohereje kwizigama kwa ${data.amount.toLocaleString()} Frw bitegereje kwemezwa.`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return newSaving;
  },

  // GET /savings/me
  getMySavings: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    return getSavings().filter((s: any) => s.user_id === payload.sub);
  },

  // GET /savings (admin)
  getAllSavings: (token: string, status?: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    let savings = getSavings();
    if (status) savings = savings.filter((s: any) => s.status === status);
    return savings;
  },

  // POST /savings/{id}/approve
  approveSaving: (token: string, savingId: number) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const savings = getSavings();
    const idx = savings.findIndex((s: any) => s.id === savingId);
    if (idx < 0) throw new Error('Kwizigama ntabwo kubonetse.');
    (savings[idx] as any).status = 'Byemejwe';
    (savings[idx] as any).approved_at = now();
    save(KEYS.savings, savings);

    // Check if profit should be added (if group has profit enabled)
    const saving = savings[idx];
    const group = getIkibina().find((g: any) => g.id === saving.group_id);
    if (group && group.profit_enabled && group.profit_rate > 0) {
      const profits = getProfits();
      profits.push({
        id: genId('profits'),
        user_id: saving.user_id,
        amount: Math.round(saving.amount * group.profit_rate / 100),
        description: `Inyungu ya ${group.name} - ${new Date().toLocaleDateString('fr-RW')}`,
        created_at: now(),
      });
      save(KEYS.profits, profits);
    }

    // Notify user
    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: genId('notifications'), user_id: saving.user_id,
      title: 'Kwizigama byemejwe ✅',
      message: `Kwizigama kwawe kwa ${saving.amount.toLocaleString()} Frw byemejwe n'ubuyobozi.`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return savings[idx];
  },

  // POST /savings/{id}/reject
  rejectSaving: (token: string, savingId: number, reason: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const savings = getSavings();
    const idx = savings.findIndex((s: any) => s.id === savingId);
    if (idx < 0) throw new Error('Kwizigama ntabwo kubonetse.');
    (savings[idx] as any).status = 'Byanzwe';
    (savings[idx] as any).rejection_reason = reason;
    save(KEYS.savings, savings);

    const saving = savings[idx];
    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: genId('notifications'), user_id: saving.user_id,
      title: 'Kwizigama byanzwe ❌',
      message: `Kwizigama kwawe kwa ${saving.amount.toLocaleString()} Frw byanzwe. Impamvu: ${reason}`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return savings[idx];
  },

  // ─── LOAN ENDPOINTS ──────────────────────────────────────────────────────────

  // POST /loans
  requestLoan: (token: string, data: any) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const user = getUserById(payload.sub);
    if (!user) throw new Error('Umutumiyi ntabwo abonetse.');

    // Check existing active loans
    const existingLoans = getLoans().filter((l: any) => l.user_id === payload.sub && (l.status === 'Bitegereje' || l.status === 'Yemejwe' || l.status === 'Iri kwishyura'));
    if (existingLoans.length > 0) {
      throw new Error('Usanzwe ufite inguzanyo itarangiye. Banza uyishyure mbere yo gusaba indi.');
    }

    const loans = getLoans();
    const newLoan: any = {
      id: genId('loans'),
      user_id: payload.sub,
      user_name: user.full_name,
      user_phone: user.phone_number,
      requested_amount: data.requested_amount,
      reason: data.reason,
      repayment_months: data.repayment_months,
      status: 'Bitegereje',
      interest_rate: 10,
      total_repaid: 0,
      remaining_balance: 0,
      created_at: now(),
      repayments: [],
    };
    loans.push(newLoan);
    save(KEYS.loans, loans);

    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: genId('notifications'), user_id: 1,
      title: 'Inguzanyo nshya', message: `${user.full_name} yasabye inguzanyo ya ${data.requested_amount.toLocaleString()} Frw.`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return newLoan;
  },

  // GET /loans/me
  getMyLoans: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const allRepayments = getRepayments();
    return getLoans()
      .filter((l: any) => l.user_id === payload.sub)
      .map((l: any) => ({ ...l, repayments: allRepayments.filter((r: any) => r.loan_id === l.id) }));
  },

  // GET /loans (admin)
  getAllLoans: (token: string, status?: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const allRepayments = getRepayments();
    let loans = getLoans();
    if (status) loans = loans.filter((l: any) => l.status === status);
    return loans.map((l: any) => ({ ...l, repayments: allRepayments.filter((r: any) => r.loan_id === l.id) }));
  },

  // POST /loans/{id}/approve
  approveLoan: (token: string, loanId: number, approved_amount: number) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const loans = getLoans();
    const idx = loans.findIndex((l: any) => l.id === loanId);
    if (idx < 0) throw new Error('Inguzanyo ntabwo ibonetse.');
    const loan = loans[idx];
    const totalWithInterest = approved_amount + (approved_amount * loan.interest_rate / 100);
    (loans[idx] as any).status = 'Yemejwe';
    (loans[idx] as any).approved_amount = approved_amount;
    (loans[idx] as any).remaining_balance = totalWithInterest;
    (loans[idx] as any).approved_at = now();
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + loan.repayment_months);
    (loans[idx] as any).due_date = dueDate.toISOString();
    save(KEYS.loans, loans);

    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: genId('notifications'), user_id: loan.user_id,
      title: 'Inguzanyo yemejwe ✅',
      message: `Inguzanyo yawe ya ${approved_amount.toLocaleString()} Frw yemejwe. Uzayishyura mu mezi ${loan.repayment_months}.`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return loans[idx];
  },

  // POST /loans/{id}/reject
  rejectLoan: (token: string, loanId: number, reason: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const loans = getLoans();
    const idx = loans.findIndex((l: any) => l.id === loanId);
    if (idx < 0) throw new Error('Inguzanyo ntabwo ibonetse.');
    const loan = loans[idx];
    (loans[idx] as any).status = 'Yanzwe';
    (loans[idx] as any).rejection_reason = reason;
    save(KEYS.loans, loans);

    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: genId('notifications'), user_id: loan.user_id,
      title: 'Inguzanyo yanzwe ❌',
      message: `Inguzanyo yawe yanzwe. Impamvu: ${reason}`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return loans[idx];
  },

  // POST /loans/{id}/repayments
  submitRepayment: (token: string, loanId: number, data: any) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const user = getUserById(payload.sub);
    if (!user) throw new Error('Umutumiyi ntabwo abonetse.');
    const loans = getLoans();
    const lIdx = loans.findIndex((l: any) => l.id === loanId);
    if (lIdx < 0) throw new Error('Inguzanyo ntabwo ibonetse.');

    const repayments = getRepayments();
    const newRep: any = {
      id: genId('repayments'),
      loan_id: loanId,
      user_id: payload.sub,
      user_name: user.full_name,
      amount: data.amount,
      payment_reference: data.payment_reference || '',
      status: 'Bitegereje kwemezwa',
      created_at: now(),
    };
    repayments.push(newRep);
    save(KEYS.repayments, repayments);

    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: genId('notifications'), user_id: 1,
      title: 'Kwishyura inguzanyo', message: `${user.full_name} yohereje kwishyura kwa ${data.amount.toLocaleString()} Frw bitegereje kwemezwa.`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return newRep;
  },

  // POST /loans/repayments/{id}/approve
  approveRepayment: (token: string, repId: number) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const repayments = getRepayments();
    const rIdx = repayments.findIndex((r: any) => r.id === repId);
    if (rIdx < 0) throw new Error('Kwishyura ntabwo kubonetse.');
    const rep = repayments[rIdx];
    (repayments[rIdx] as any).status = 'Byemejwe';
    (repayments[rIdx] as any).approved_at = now();
    save(KEYS.repayments, repayments);

    // Update loan balance
    const loans = getLoans();
    const lIdx = loans.findIndex((l: any) => l.id === rep.loan_id);
    if (lIdx >= 0) {
      (loans[lIdx] as any).total_repaid = (loans[lIdx].total_repaid || 0) + rep.amount;
      const newBalance = Math.max(0, (loans[lIdx].remaining_balance || 0) - rep.amount);
      (loans[lIdx] as any).remaining_balance = newBalance;
      if (newBalance === 0) (loans[lIdx] as any).status = 'Yarangiye';
      else (loans[lIdx] as any).status = 'Iri kwishyura';
      save(KEYS.loans, loans);
    }

    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: genId('notifications'), user_id: rep.user_id,
      title: 'Kwishyura inguzanyo byemejwe ✅',
      message: `Kwishyura kwawe kwa ${rep.amount.toLocaleString()} Frw byemejwe.`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return repayments[rIdx];
  },

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

  getMyNotifications: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const allNotifs = load<any[]>('gk_all_notifications', []);
    return allNotifs
      .filter((n: any) => n.user_id === payload.sub)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  markNotificationRead: (token: string, notifId: number) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const allNotifs = load<any[]>('gk_all_notifications', []);
    const idx = allNotifs.findIndex((n: any) => n.id === notifId && n.user_id === payload.sub);
    if (idx >= 0) allNotifs[idx].is_read = true;
    save('gk_all_notifications', allNotifs);
    return allNotifs[idx];
  },

  markAllNotificationsRead: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.forEach((n: any) => { if (n.user_id === payload.sub) n.is_read = true; });
    save('gk_all_notifications', allNotifs);
    return { message: 'Ubutumwa bwose bwasomwe.' };
  },

  // ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────────

  adminGetUsers: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    return getUsers().map(cleanUser);
  },

  adminGetUser: (token: string, userId: number) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const user = getUserById(userId);
    if (!user) throw new Error('Umutumiyi ntabwo abonetse.');
    return cleanUser(user);
  },

  adminToggleUser: (token: string, userId: number) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const users = getUsers();
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx < 0) throw new Error('Umutumiyi ntabwo abonetse.');
    users[idx].is_active = !users[idx].is_active;
    save(KEYS.users, users);
    return cleanUser(users[idx]);
  },

  adminDashboard: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const users = getUsers().filter((u: any) => u.role === 'UMUKORESHA');
    const now_ = new Date();
    const thisMonth = users.filter((u: any) => {
      const d = new Date(u.created_at);
      return d.getFullYear() === now_.getFullYear() && d.getMonth() === now_.getMonth();
    });
    const savings = getSavings();
    const loans = getLoans();
    const approvedSavings = savings.filter((s: any) => s.status === 'Byemejwe');
    const pendingSavings = savings.filter((s: any) => s.status === 'Bitegereje kwemezwa');
    const pendingLoans = loans.filter((l: any) => l.status === 'Bitegereje');
    const approvedLoans = loans.filter((l: any) => l.status === 'Yemejwe' || l.status === 'Iri kwishyura');
    const activeIkibina = getIkibina().filter((g: any) => g.is_active);
    const repayments = getRepayments().filter((r: any) => r.status === 'Byemejwe');

    return {
      total_users: users.length,
      new_users_this_month: thisMonth.length,
      active_ikibina_count: activeIkibina.length,
      total_savings_approved: approvedSavings.reduce((s: number, tx: any) => s + tx.amount, 0),
      pending_savings_amount: pendingSavings.reduce((s: number, tx: any) => s + tx.amount, 0),
      pending_loans_count: pendingLoans.length,
      approved_loans_count: approvedLoans.length,
      total_outstanding_loans: approvedLoans.reduce((s: number, l: any) => s + (l.remaining_balance || 0), 0),
      total_repaid_loans: repayments.reduce((s: number, r: any) => s + r.amount, 0),
      monthly_savings_chart: [],
      loan_status_chart: [
        { name: 'Bitegereje', value: pendingLoans.length },
        { name: 'Yemejwe', value: approvedLoans.length },
        { name: 'Yarangiye', value: loans.filter((l: any) => l.status === 'Yarangiye').length },
        { name: 'Yanzwe', value: loans.filter((l: any) => l.status === 'Yanzwe').length },
      ],
    };
  },

  adminGetProfits: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    return getProfits();
  },

  adminAddProfit: (token: string, data: any) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const profits = getProfits();
    const newProfit: ProfitRecord = {
      id: genId('profits'),
      user_id: data.user_id,
      amount: data.amount,
      description: data.description,
      created_at: now(),
    };
    profits.push(newProfit);
    save(KEYS.profits, profits);

    const allNotifs = load<any[]>('gk_all_notifications', []);
    allNotifs.push({
      id: genId('notifications'), user_id: data.user_id,
      title: 'Inyungu yongewemo 💰',
      message: `Inyungu ya ${data.amount.toLocaleString()} Frw yongewemo kuri konti yawe. ${data.description}`,
      is_read: false, created_at: now(),
    });
    save('gk_all_notifications', allNotifs);

    return newProfit;
  },

  adminCreateIkibina: (token: string, data: any) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const ikibina = getIkibina();
    const newGroup: IkibinaGroup = {
      id: genId('ikibina'),
      name: data.name,
      contribution_amount: data.contribution_amount,
      frequency: data.frequency || 'Buri kwezi',
      max_members: data.max_members || 20,
      current_members_count: 0,
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || '',
      description: data.description || '',
      is_active: true,
      profit_enabled: data.profit_enabled || false,
      profit_rate: data.profit_rate || 0,
      created_at: now(),
    };
    ikibina.push(newGroup);
    save(KEYS.ikibina, ikibina);
    return newGroup;
  },

  adminUpdateIkibina: (token: string, groupId: number, data: any) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const ikibina = getIkibina();
    const idx = ikibina.findIndex((g: any) => g.id === groupId);
    if (idx < 0) throw new Error('Ikibina ntabwo kibonetse.');
    ikibina[idx] = { ...ikibina[idx], ...data };
    save(KEYS.ikibina, ikibina);
    return ikibina[idx];
  },

  adminToggleIkibina: (token: string, groupId: number) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const ikibina = getIkibina();
    const idx = ikibina.findIndex((g: any) => g.id === groupId);
    if (idx < 0) throw new Error('Ikibina ntabwo kibonetse.');
    (ikibina[idx] as any).is_active = !(ikibina[idx] as any).is_active;
    save(KEYS.ikibina, ikibina);
    return ikibina[idx];
  },

  adminGetAuditLogs: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    return getAudit();
  },

  adminGetReports: (token: string) => {
    const payload = decodeJwt(token);
    if (!payload) throw new Error('Ntabwo wemerewe.');
    const savings = getSavings();
    const loans = getLoans();
    const repayments = getRepayments().filter((r: any) => r.status === 'Byemejwe');
    const approvedSavings = savings.filter((s: any) => s.status === 'Byemejwe');
    const pendingSavings = savings.filter((s: any) => s.status === 'Bitegereje kwemezwa');
    const approvedLoans = loans.filter((l: any) => l.status !== 'Bitegereje' && l.status !== 'Yanzwe');
    const pendingLoans = loans.filter((l: any) => l.status === 'Bitegereje');
    const outstandingLoans = loans.filter((l: any) => l.status === 'Iri kwishyura' || l.status === 'Yemejwe');
    const totalSavings = approvedSavings.reduce((s: number, tx: any) => s + tx.amount, 0);
    const totalRepaid = repayments.reduce((s: number, r: any) => s + r.amount, 0);
    const totalOutstanding = outstandingLoans.reduce((s: number, l: any) => s + (l.remaining_balance || 0), 0);
    return [{
      period: 'Icyumweru gishize',
      total_savings: totalSavings,
      pending_savings: pendingSavings.reduce((s: number, tx: any) => s + tx.amount, 0),
      approved_loans: approvedLoans.length,
      pending_loans: pendingLoans.length,
      loan_repayments: totalRepaid,
      outstanding_loans: totalOutstanding,
      net_fund_balance: totalSavings - totalOutstanding,
      transactions_count: savings.length + loans.length,
    }];
  },
};
