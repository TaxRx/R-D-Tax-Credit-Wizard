import { v4 as uuidv4 } from 'uuid';

export const demoUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@demo.com',
    name: 'Demo Admin',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'client@demo.com',
    name: 'Demo Client',
    role: 'client',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'client2@demo.com',
    name: 'Demo Client 2',
    role: 'client',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoBusinesses = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    name: 'Demo Business',
    user_id: demoUsers[1].id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    name: 'Demo Business 2',
    user_id: demoUsers[2].id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoBusinessLinks = [
  {
    id: uuidv4(),
    user_id: demoUsers[1].id,
    business_id: demoBusinesses[0].id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    user_id: demoUsers[2].id,
    business_id: demoBusinesses[1].id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoActivities = [
  {
    id: uuidv4(),
    name: 'Develop New Feature',
    description: 'Developing a new feature for the healthcare app',
    client_id: demoUsers[1].id,
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Research AI Models',
    description: 'Researching AI models for diagnostics',
    client_id: demoUsers[1].id,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Compliance Review',
    description: 'Reviewing compliance for new regulations',
    client_id: demoUsers[2].id,
    status: 'rejected',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Data Migration',
    description: 'Migrating legacy data to new system',
    client_id: demoUsers[2].id,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Pending Activity Client 1',
    description: 'A pending activity for client 1',
    client_id: demoUsers[1].id,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Pending Activity Client 2',
    description: 'A pending activity for client 2',
    client_id: demoUsers[2].id,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoExpenses = [
  {
    id: uuidv4(),
    type: 'wage',
    description: 'Software Engineer Salary',
    client_id: demoUsers[1].id,
    amount: 90000,
    status: 'approved',
    year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { employee_id: 'emp1' },
  },
  {
    id: uuidv4(),
    type: 'contractor',
    description: 'AI Consultant',
    client_id: demoUsers[1].id,
    amount: 20000,
    status: 'pending',
    year: 2022,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { contractor_id: 'cont1', start_date: '2022-01-01', end_date: '2022-06-30' },
  },
  {
    id: uuidv4(),
    type: 'supply',
    description: 'Cloud Hosting',
    client_id: demoUsers[2].id,
    amount: 1200,
    status: 'rejected',
    year: 2021,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { supplier_id: 'sup1' },
  },
  {
    id: uuidv4(),
    type: 'wage',
    description: 'Data Analyst Salary',
    client_id: demoUsers[2].id,
    amount: 70000,
    status: 'pending',
    year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { employee_id: 'emp2' },
  },
  {
    id: uuidv4(),
    type: 'contractor',
    description: 'Security Audit',
    client_id: demoUsers[1].id,
    amount: 5000,
    status: 'approved',
    year: 2021,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { contractor_id: 'cont2', start_date: '2021-03-01', end_date: '2021-03-31' },
  },
  {
    id: uuidv4(),
    type: 'supply',
    description: 'Medical Supplies',
    client_id: demoUsers[2].id,
    amount: 3000,
    status: 'approved',
    year: 2022,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { supplier_id: 'sup2' },
  },
  {
    id: uuidv4(),
    type: 'wage',
    description: 'Pending Wage Expense Client 1',
    client_id: demoUsers[1].id,
    amount: 80000,
    status: 'pending',
    year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { employee_id: 'emp3' },
  },
  {
    id: uuidv4(),
    type: 'supply',
    description: 'Pending Supply Expense Client 2',
    client_id: demoUsers[2].id,
    amount: 1500,
    status: 'pending',
    year: 2022,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: { supplier_id: 'sup3' },
  },
];

export const demoDocuments = [
  {
    id: uuidv4(),
    file_name: 'spec.pdf',
    document_type: 'technical',
    file_url: '/demo/spec.pdf',
    client_id: demoUsers[1].id,
    review_status: 'approved',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    file_size: 123456,
    mime_type: 'application/pdf',
  },
  {
    id: uuidv4(),
    file_name: 'payroll.xlsx',
    document_type: 'payroll',
    file_url: '/demo/payroll.xlsx',
    client_id: demoUsers[1].id,
    review_status: 'pending',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    file_size: 234567,
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    id: uuidv4(),
    file_name: 'financials.csv',
    document_type: 'financial',
    file_url: '/demo/financials.csv',
    client_id: demoUsers[2].id,
    review_status: 'rejected',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    file_size: 345678,
    mime_type: 'text/csv',
  },
  {
    id: uuidv4(),
    file_name: 'other.txt',
    document_type: 'other',
    file_url: '/demo/other.txt',
    client_id: demoUsers[2].id,
    review_status: 'pending',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    file_size: 4567,
    mime_type: 'text/plain',
  },
  {
    id: uuidv4(),
    file_name: 'pending_doc_client1.pdf',
    document_type: 'technical',
    file_url: '/demo/pending_doc_client1.pdf',
    client_id: demoUsers[1].id,
    review_status: 'pending',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    file_size: 111111,
    mime_type: 'application/pdf',
  },
  {
    id: uuidv4(),
    file_name: 'pending_doc_client2.pdf',
    document_type: 'financial',
    file_url: '/demo/pending_doc_client2.pdf',
    client_id: demoUsers[2].id,
    review_status: 'pending',
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    file_size: 222222,
    mime_type: 'application/pdf',
  },
];

export const demoEmployees = [
  {
    id: uuidv4(),
    name: 'Jane Doe',
    role: 'Engineer',
    annual_wage: 90000,
    is_business_owner: false,
    yearly_activities: {},
    business_id: demoBusinesses[0].id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoChangelog = [
  {
    id: uuidv4(),
    actor_id: demoUsers[0].id,
    target_user_id: demoUsers[1].id,
    action: 'created_business',
    details: 'Created Demo Business',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: uuidv4(),
    actor_id: demoUsers[0].id,
    target_user_id: demoUsers[1].id,
    action: 'document_approved',
    details: 'Approved document spec.pdf',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: uuidv4(),
    actor_id: demoUsers[0].id,
    target_user_id: demoUsers[2].id,
    action: 'activity_rejected',
    details: 'Rejected activity Compliance Review',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: uuidv4(),
    actor_id: demoUsers[0].id,
    target_user_id: demoUsers[1].id,
    action: 'expense_approved',
    details: 'Approved expense Software Engineer Salary',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: uuidv4(),
    actor_id: demoUsers[0].id,
    target_user_id: demoUsers[2].id,
    action: 'impersonation',
    details: 'Admin impersonated client2@demo.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: uuidv4(),
    actor_id: demoUsers[0].id,
    target_user_id: demoUsers[2].id,
    action: 'document_rejected',
    details: 'Rejected document financials.csv',
    created_at: new Date().toISOString(),
  },
];

export const demoPendingChanges = [
  {
    id: uuidv4(),
    client_id: demoUsers[1].id,
    proposed_by_admin_id: demoUsers[0].id,
    change_type: 'activity_update',
    change_details: { activity_id: 'activity1', new_status: 'approved' },
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoUsers[2].id,
    proposed_by_admin_id: demoUsers[0].id,
    change_type: 'expense_update',
    change_details: { expense_id: 'expense1', new_status: 'approved' },
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
]; 