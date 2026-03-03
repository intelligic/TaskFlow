type AdminUser = {
  name: string;
  email: string;
  password: string;
};

type GlobalWithMockAuth = typeof globalThis & {
  __mockAdminUser?: AdminUser;
};

const globalWithMockAuth = globalThis as GlobalWithMockAuth;

export function getAdminUser(): AdminUser | undefined {
  return globalWithMockAuth.__mockAdminUser;
}

export function setAdminUser(user: AdminUser): void {
  globalWithMockAuth.__mockAdminUser = user;
}
