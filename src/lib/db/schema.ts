import { pgTable, uuid, varchar, text, boolean, timestamp, decimal, integer, date, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'analyst', 'cashier']);
export const clientStatusEnum = pgEnum('client_status', ['active', 'blocked', 'defaulted']);
export const loanMethodEnum = pgEnum('loan_method', ['french', 'german']);
export const loanStatusEnum = pgEnum('loan_status', ['pending', 'approved', 'active', 'paid', 'rejected', 'defaulted']);
export const scheduleStatusEnum = pgEnum('schedule_status', ['pending', 'paid', 'overdue', 'partial']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'transfer', 'card']);

// Users
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').default('analyst').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Clients
export const clients = pgTable('clients', {
    id: uuid('id').primaryKey().defaultRandom(),
    cedula: varchar('cedula', { length: 20 }).notNull().unique(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 255 }),
    address: text('address'),
    birthDate: date('birth_date'),
    occupation: varchar('occupation', { length: 255 }),
    monthlyIncome: decimal('monthly_income', { precision: 12, scale: 2 }),
    status: clientStatusEnum('status').default('active').notNull(),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Loans
export const loans = pgTable('loans', {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id').references(() => clients.id).notNull(),
    loanNumber: varchar('loan_number', { length: 50 }).notNull().unique(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    approvedAmount: decimal('approved_amount', { precision: 12, scale: 2 }),
    interestRate: decimal('interest_rate', { precision: 5, scale: 2 }).notNull(),
    termMonths: integer('term_months').notNull(),
    method: loanMethodEnum('method').default('french').notNull(),
    purpose: text('purpose'),
    status: loanStatusEnum('status').default('pending').notNull(),
    disbursementDate: date('disbursement_date'),
    firstPaymentDate: date('first_payment_date'),
    approvedBy: uuid('approved_by').references(() => users.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Amortization Schedule
export const amortizationSchedule = pgTable('amortization_schedule', {
    id: uuid('id').primaryKey().defaultRandom(),
    loanId: uuid('loan_id').references(() => loans.id).notNull(),
    installmentNumber: integer('installment_number').notNull(),
    dueDate: date('due_date').notNull(),
    principalAmount: decimal('principal_amount', { precision: 12, scale: 2 }).notNull(),
    interestAmount: decimal('interest_amount', { precision: 12, scale: 2 }).notNull(),
    totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
    remainingBalance: decimal('remaining_balance', { precision: 12, scale: 2 }).notNull(),
    status: scheduleStatusEnum('status').default('pending').notNull(),
    paidAt: timestamp('paid_at'),
});

// Payments
export const payments = pgTable('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    loanId: uuid('loan_id').references(() => loans.id).notNull(),
    scheduleId: uuid('schedule_id').references(() => amortizationSchedule.id),
    amountPaid: decimal('amount_paid', { precision: 12, scale: 2 }).notNull(),
    paymentDate: timestamp('payment_date').defaultNow().notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    referenceNumber: varchar('reference_number', { length: 100 }),
    lateFee: decimal('late_fee', { precision: 12, scale: 2 }).default('0'),
    notes: text('notes'),
    receivedBy: uuid('received_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Penalties
export const penalties = pgTable('penalties', {
    id: uuid('id').primaryKey().defaultRandom(),
    loanId: uuid('loan_id').references(() => loans.id).notNull(),
    scheduleId: uuid('schedule_id').references(() => amortizationSchedule.id).notNull(),
    daysOverdue: integer('days_overdue').notNull(),
    penaltyRate: decimal('penalty_rate', { precision: 5, scale: 2 }).notNull(),
    penaltyAmount: decimal('penalty_amount', { precision: 12, scale: 2 }).notNull(),
    isPaid: boolean('is_paid').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    clientsCreated: many(clients),
    loansApproved: many(loans, { relationName: 'approvedBy' }),
    loansCreated: many(loans, { relationName: 'createdBy' }),
    paymentsReceived: many(payments),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
    creator: one(users, { fields: [clients.createdBy], references: [users.id] }),
    loans: many(loans),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
    client: one(clients, { fields: [loans.clientId], references: [clients.id] }),
    approvedBy: one(users, { fields: [loans.approvedBy], references: [users.id], relationName: 'approvedBy' }),
    createdBy: one(users, { fields: [loans.createdBy], references: [users.id], relationName: 'createdBy' }),
    schedule: many(amortizationSchedule),
    payments: many(payments),
    penalties: many(penalties),
}));

export const amortizationScheduleRelations = relations(amortizationSchedule, ({ one, many }) => ({
    loan: one(loans, { fields: [amortizationSchedule.loanId], references: [loans.id] }),
    payments: many(payments),
    penalties: many(penalties),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    loan: one(loans, { fields: [payments.loanId], references: [loans.id] }),
    schedule: one(amortizationSchedule, { fields: [payments.scheduleId], references: [amortizationSchedule.id] }),
    receiver: one(users, { fields: [payments.receivedBy], references: [users.id] }),
}));

export const penaltiesRelations = relations(penalties, ({ one }) => ({
    loan: one(loans, { fields: [penalties.loanId], references: [loans.id] }),
    schedule: one(amortizationSchedule, { fields: [penalties.scheduleId], references: [amortizationSchedule.id] }),
}));
