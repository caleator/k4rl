"use client";

import React, { createContext, useContext, useState } from "react";

export type UserRole = "k4rl-admin" | "brand-admin" | "brand-editor";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  brandId?: string;
  brandName?: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: "user-k4rl",
    name: "Alexandros Daskalakis",
    email: "alex@quintessential.gr",
    role: "k4rl-admin",
  },
  {
    id: "user-brand-admin",
    name: "Sofia Papadaki",
    email: "sofia@ateliernoir.com",
    role: "brand-admin",
    brandId: "brand-001",
    brandName: "Atelier Noir",
  },
  {
    id: "user-brand-editor",
    name: "Nikos Andreou",
    email: "nikos@ateliernoir.com",
    role: "brand-editor",
    brandId: "brand-001",
    brandName: "Atelier Noir",
  },
];

interface AuthContextValue {
  user: MockUser;
  setRole: (role: UserRole) => void;
  can: (action: Permission) => boolean;
}

// Permissions matrix
export type Permission =
  | "manage:materials"
  | "manage:brands"
  | "view:analytics:platform"
  | "create:product"
  | "generate:dpp"
  | "generate:batch"
  | "manage:factories"
  | "manage:resellers"
  | "manage:team"
  | "manage:billing"
  | "view:billing";

const PERMISSIONS: Record<UserRole, Permission[]> = {
  "k4rl-admin": [
    "manage:materials",
    "manage:brands",
    "view:analytics:platform",
  ],
  "brand-admin": [
    "create:product",
    "generate:dpp",
    "generate:batch",
    "manage:factories",
    "manage:resellers",
    "manage:team",
    "manage:billing",
    "view:billing",
  ],
  "brand-editor": [
    "create:product",
    "generate:dpp",
    "generate:batch",
    "manage:factories",
  ],
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser>(MOCK_USERS[0]); // default: k4rl-admin

  function setRole(role: UserRole) {
    const next = MOCK_USERS.find((u) => u.role === role);
    if (next) setUser(next);
  }

  function can(action: Permission): boolean {
    return PERMISSIONS[user.role].includes(action);
  }

  return (
    <AuthContext.Provider value={{ user, setRole, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { MOCK_USERS };
