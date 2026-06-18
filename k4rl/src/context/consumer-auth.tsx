"use client";

import React, { createContext, useContext, useState } from "react";
import { CONSUMER_USERS, type ConsumerUser } from "@/lib/mock/consumers";

interface ConsumerAuthContextValue {
  user: ConsumerUser | null;
  login: (email: string, password: string) => "ok" | "invalid";
  register: (name: string, email: string, password: string) => "ok" | "taken";
  logout: () => void;
}

const ConsumerAuthContext = createContext<ConsumerAuthContextValue | null>(null);

// Mutable session-scoped list (starts from seeded users, persists registrations within the session)
const SESSION_USERS: ConsumerUser[] = [...CONSUMER_USERS];

export function ConsumerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ConsumerUser | null>(null);

  function login(email: string, password: string): "ok" | "invalid" {
    const found = SESSION_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!found) return "invalid";
    setUser(found);
    return "ok";
  }

  function register(name: string, email: string, password: string): "ok" | "taken" {
    const exists = SESSION_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) return "taken";
    const newUser: ConsumerUser = {
      id: `cons-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      joinedAt: new Date().toISOString(),
    };
    SESSION_USERS.push(newUser);
    setUser(newUser);
    return "ok";
  }

  function logout() {
    setUser(null);
  }

  return (
    <ConsumerAuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </ConsumerAuthContext.Provider>
  );
}

export function useConsumerAuth() {
  const ctx = useContext(ConsumerAuthContext);
  if (!ctx) throw new Error("useConsumerAuth must be used within ConsumerAuthProvider");
  return ctx;
}
