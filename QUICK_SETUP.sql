-- ============================================
-- QUICK SETUP: Superadmin User
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor setelah user dibuat di Auth
-- Dashboard → SQL Editor → New query → Paste → Run

-- 1. Pastikan unit IT ada
INSERT INTO m_units (code, name, proportion_percentage, is_active) VALUES
('IT', 'Information Technology', 25.00, true)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert/update superadmin employee
INSERT INTO m_employees (
  employee_code, 
  full_name, 
  unit_id, 
  role, 
  email, 
  tax_status,
  is_active
) VALUES (
  'SA001',
  'Mukhsin',
  (SELECT id FROM m_units WHERE code = 'IT'),
  'superadmin',
  'mukhsin9@gmail.com',
  'TK/0',
  true
)
ON CONFLICT (email) 
DO UPDATE SET
  role = 'superadmin',
  is_active = true,
  updated_at = NOW();

-- 3. Verifikasi setup berhasil
SELECT 
  e.employee_code,
  e.full_name,
  e.email,
  e.role,
  e.is_active,
  u.name as unit_name
FROM m_employees e
LEFT JOIN m_units u ON e.unit_id = u.id
WHERE e.email = 'mukhsin9@gmail.com';

-- Jika query di atas menampilkan data, setup berhasil!
-- Sekarang bisa login di: http://localhost:3000/login
