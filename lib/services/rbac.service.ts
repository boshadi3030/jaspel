export type Role = 'superadmin' | 'unit_manager' | 'employee'

export type Permission =
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'units:read'
  | 'units:create'
  | 'units:update'
  | 'units:delete'
  | 'kpi:read'
  | 'kpi:create'
  | 'kpi:update'
  | 'kpi:delete'
  | 'pool:read'
  | 'pool:create'
  | 'pool:update'
  | 'pool:approve'
  | 'realization:read'
  | 'realization:create'
  | 'realization:update'
  | 'calculation:run'
  | 'calculation:view'
  | 'reports:view'
  | 'reports:export'
  | 'settings:read'
  | 'settings:update'
  | 'audit:read'
  | 'profile:read'
  | 'profile:update'

// Define permissions for each role
const rolePermissions: Record<Role, Permission[]> = {
  superadmin: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'units:read',
    'units:create',
    'units:update',
    'units:delete',
    'kpi:read',
    'kpi:create',
    'kpi:update',
    'kpi:delete',
    'pool:read',
    'pool:create',
    'pool:update',
    'pool:approve',
    'realization:read',
    'realization:create',
    'realization:update',
    'calculation:run',
    'calculation:view',
    'reports:view',
    'reports:export',
    'settings:read',
    'settings:update',
    'audit:read',
    'profile:read',
    'profile:update',
  ],
  unit_manager: [
    'realization:read',
    'realization:create',
    'realization:update',
    'calculation:view',
    'reports:view',
    'reports:export',
    'profile:read',
    'profile:update',
  ],
  employee: [
    'calculation:view',
    'reports:view',
    'profile:read',
    'profile:update',
  ],
}

// Define route permissions
export interface RoutePermission {
  path: string
  permissions: Permission[]
  roles: Role[]
}

export const routePermissions: RoutePermission[] = [
  // Admin routes
  {
    path: '/admin/dashboard',
    permissions: ['users:read', 'units:read'],
    roles: ['superadmin'],
  },
  {
    path: '/admin/users',
    permissions: ['users:read'],
    roles: ['superadmin'],
  },
  {
    path: '/admin/pegawai',
    permissions: ['users:read'],
    roles: ['superadmin'],
  },
  {
    path: '/admin/units',
    permissions: ['units:read'],
    roles: ['superadmin'],
  },
  {
    path: '/admin/kpi-config',
    permissions: ['kpi:read'],
    roles: ['superadmin'],
  },
  {
    path: '/admin/pool',
    permissions: ['pool:read'],
    roles: ['superadmin'],
  },
  {
    path: '/admin/settings',
    permissions: ['settings:read'],
    roles: ['superadmin'],
  },
  {
    path: '/admin/audit',
    permissions: ['audit:read'],
    roles: ['superadmin'],
  },
  {
    path: '/admin/reports',
    permissions: ['reports:view'],
    roles: ['superadmin'],
  },

  // Manager routes
  {
    path: '/manager/dashboard',
    permissions: ['realization:read'],
    roles: ['unit_manager'],
  },
  {
    path: '/manager/realization',
    permissions: ['realization:read', 'realization:create'],
    roles: ['unit_manager'],
  },
  {
    path: '/manager/reports',
    permissions: ['reports:view'],
    roles: ['unit_manager'],
  },

  // Employee routes
  {
    path: '/employee/dashboard',
    permissions: ['calculation:view'],
    roles: ['employee'],
  },
  {
    path: '/employee/reports',
    permissions: ['reports:view'],
    roles: ['employee'],
  },

  // Shared routes
  {
    path: '/profile',
    permissions: ['profile:read'],
    roles: ['superadmin', 'unit_manager', 'employee'],
  },
  {
    path: '/notifications',
    permissions: ['profile:read'],
    roles: ['superadmin', 'unit_manager', 'employee'],
  },
]

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role] || []
  return permissions.includes(permission)
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: Role, path: string): boolean {
  // Find route permission
  const routePermission = routePermissions.find(rp =>
    path.startsWith(rp.path)
  )

  if (!routePermission) {
    // If route is not defined, allow access (default behavior)
    return true
  }

  // Check if role is allowed
  if (!routePermission.roles.includes(role)) {
    return false
  }

  // Check if role has required permissions
  return hasAllPermissions(role, routePermission.permissions)
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || []
}

/**
 * Get accessible routes for a role
 */
export function getAccessibleRoutes(role: Role): string[] {
  return routePermissions
    .filter(rp => rp.roles.includes(role))
    .map(rp => rp.path)
}

/**
 * Get menu items for a role
 */
export interface MenuItem {
  id: string
  label: string
  path: string
  icon?: string
  children?: MenuItem[]
}

export function getMenuItemsForRole(role: Role): MenuItem[] {
  const allMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: role === 'superadmin' ? '/admin/dashboard' : role === 'unit_manager' ? '/manager/dashboard' : '/employee/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      id: 'users',
      label: 'Manajemen Pengguna',
      path: '/admin/users',
      icon: 'Users',
    },
    {
      id: 'pegawai',
      label: 'Master Pegawai',
      path: '/admin/pegawai',
      icon: 'Users',
    },
    {
      id: 'units',
      label: 'Manajemen Unit',
      path: '/admin/units',
      icon: 'Building2',
    },
    {
      id: 'kpi',
      label: 'Konfigurasi KPI',
      path: '/admin/kpi-config',
      icon: 'Target',
    },
    {
      id: 'pool',
      label: 'Manajemen Pool',
      path: '/admin/pool',
      icon: 'Wallet',
    },
    {
      id: 'realization',
      label: 'Input Realisasi',
      path: '/manager/realization',
      icon: 'FileText',
    },
    {
      id: 'reports',
      label: 'Laporan',
      path: role === 'superadmin' ? '/admin/reports' : role === 'unit_manager' ? '/manager/reports' : '/employee/reports',
      icon: 'BarChart3',
    },
    {
      id: 'notifications',
      label: 'Notifikasi',
      path: '/notifications',
      icon: 'Bell',
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      path: '/admin/settings',
      icon: 'Settings',
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      path: '/admin/audit',
      icon: 'Shield',
    },
    {
      id: 'profile',
      label: 'Profil',
      path: '/profile',
      icon: 'User',
    },
  ]

  // Filter menu items based on role's accessible routes
  const accessibleRoutes = getAccessibleRoutes(role)

  return allMenuItems.filter(item => {
    // Check if the menu item's path is accessible
    // Match if item path starts with accessible route, or route starts with item path
    return accessibleRoutes.some(route =>
      item.path === route || item.path.startsWith(route + '/') || route.startsWith(item.path + '/')
    )
  })
}
