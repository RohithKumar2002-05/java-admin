import { req } from './client';

export const loginApi = (email: string, password: string) =>
    req('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getMeApi = () => req('/admin/me');

export const getRolesApi = () => req('/admin/roles');

export const createRoleApi = (name: string, permissions: string[]) =>
    req('/admin/roles', { method: 'POST', body: JSON.stringify({ name, permissions }) });

export const deleteRoleApi = (roleId: string) =>
    req(`/admin/roles/${roleId}`, { method: 'DELETE' });

export const getAdminsApi = () => req('/admin/users');

export const createAdminApi = (data: { name: string; email: string; phone: string; password: string; role_name: string }) =>
    req('/admin/users', { method: 'POST', body: JSON.stringify(data) });

export const deleteAdminApi = (adminId: string) =>
    req(`/admin/users/${adminId}`, { method: 'DELETE' });

export const updateAdminRoleApi = (adminId: string, role_name: string) =>
    req(`/admin/users/${adminId}/role`, { method: 'PUT', body: JSON.stringify({ role_name }) });

export const getCategoriesApi = () => req('/admin/categories');

export const createCategoryApi = (form: FormData) =>
    req('/admin/categories', { method: 'POST', body: form });

export const getSubCategoriesApi = (categoryId: string) =>
    req(`/admin/categories/${categoryId}/subcategories`);

export const createSubCategoryApi = (categoryId: string, form: FormData) =>
    req(`/admin/categories/${categoryId}/subcategories`, { method: 'POST', body: form });

// Products — uses admin-scoped endpoint that accepts AdminPrincipal
export const getProductsApi = () => req('/hub-admin/products/all');

export const createProductApi = (form: FormData) =>
    req('/hub-admin/products', { method: 'POST', body: form });

export const updateProductApi = (id: string, form: FormData) =>
    req(`/hub-admin/products/${id}`, { method: 'PATCH', body: form });

export const deleteProductApi = (id: string) =>
    req(`/hub-admin/products/${id}`, { method: 'DELETE' });

// Hubs
export const getHubsApi = () => req('/hub-admin/hubs');

export const getHubByIdApi = (id: string) => req(`/hub-admin/hubs/${id}`);

// ── Orders ────────────────────────────────────────────────────────────────────
export const getAllOrdersApi = () => req('/order/all');
export const getGlobalRevenueApi = () => req('/order/revenue');
