export interface ConsumerUser {
  id: string;
  name: string;
  email: string;
  password: string; // plain text — demo only
  joinedAt: string;
}

// Pre-seeded demo accounts. Password for all: demo1234
export const CONSUMER_USERS: ConsumerUser[] = [
  {
    id: "cons-001",
    name: "Alexandros Petrou",
    email: "alex.petrou@gmail.com",
    password: "demo1234",
    joinedAt: "2026-05-20T11:08:00Z",
  },
  {
    id: "cons-002",
    name: "Maria Konstantinidou",
    email: "maria.k@hotmail.com",
    password: "demo1234",
    joinedAt: "2026-05-25T09:15:00Z",
  },
  {
    id: "cons-003",
    name: "Eleni Stavrou",
    email: "new.owner@gmail.com",
    password: "demo1234",
    joinedAt: "2026-06-09T16:00:00Z",
  },
];
