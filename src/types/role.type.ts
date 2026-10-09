export interface AdminRole {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystemRole?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPermission {
  id: string;
  action: string;
  resource: string;
  description?: string | null;
}

export interface CreateRolePayload {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export interface AssignRolePayload {
  roleId: string;
}

export interface UpdateRolePermissionsPayload {
  permissionIds: string[];
}
