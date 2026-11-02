type Role = "tourist" | "researcher" | "admin"

interface MockUser {
  id: string
  email: string
  name?: string | null
  role: Role
  createdAt?: string
  password: string
}

export type MockPublicUser = Omit<MockUser, "password">

const mockUsers: MockUser[] = [
  {
    id: "tourist-001",
    email: "tourist@example.com",
    password: "tourist123",
    name: "Tashi Explorer",
    role: "tourist",
    createdAt: new Date("2024-01-05").toISOString(),
  },
  {
    id: "researcher-001",
    email: "researcher@example.com",
    password: "research123",
    name: "Dr. Karma Scholar",
    role: "researcher",
    createdAt: new Date("2023-11-12").toISOString(),
  },
  {
    id: "admin-001",
    email: "admin@example.com",
    password: "admin123",
    name: "Sonam Administrator",
    role: "admin",
    createdAt: new Date("2023-06-18").toISOString(),
  },
]

export function authenticateMockUser(email: string, password: string): MockPublicUser | null {
  const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
  if (!user) return null
  const { password: _pw, ...rest } = user
  return rest
}

export function getMockUsers(): MockPublicUser[] {
  return mockUsers.map(({ password: _pw, ...rest }) => rest)
}
