import fs from 'node:fs';
import path from 'node:path';

type UserRole = 'admin' | 'employee';

type AuthUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type GlobalWithMockAuth = typeof globalThis & {
  __mockUsers?: AuthUser[];
};

const globalWithMockAuth = globalThis as GlobalWithMockAuth;
const storeFilePath = path.join(process.cwd(), '.mock-auth', 'users.json');

function readUsersFromDisk(): AuthUser[] {
  try {
    if (!fs.existsSync(storeFilePath)) {
      return [];
    }

    const raw = fs.readFileSync(storeFilePath, 'utf8');
    const parsed = JSON.parse(raw) as AuthUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsersToDisk(users: AuthUser[]): void {
  const dir = path.dirname(storeFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(storeFilePath, JSON.stringify(users, null, 2), 'utf8');
}

function getStore(): AuthUser[] {
  if (!globalWithMockAuth.__mockUsers) {
    globalWithMockAuth.__mockUsers = readUsersFromDisk();
  }

  return globalWithMockAuth.__mockUsers;
}

export function getAllUsers(): AuthUser[] {
  return getStore();
}

export function hasAnyUser(): boolean {
  return getStore().length > 0;
}

export function getUserByEmail(email: string): AuthUser | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  return getStore().find((user) => user.email === normalizedEmail);
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
}): AuthUser {
  const store = getStore();
  const normalizedEmail = input.email.trim().toLowerCase();

  const user: AuthUser = {
    name: input.name.trim(),
    email: normalizedEmail,
    password: input.password,
    role: store.length === 0 ? 'admin' : 'employee',
  };

  store.push(user);
  writeUsersToDisk(store);
  return user;
}
