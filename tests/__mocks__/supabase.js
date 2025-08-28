// Mock Supabase client
const mockSelect = jest.fn().mockReturnThis()
const mockInsert = jest.fn().mockReturnThis()
const mockUpdate = jest.fn().mockReturnThis()
const mockDelete = jest.fn().mockReturnThis()
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
  csv: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
}))

const mockSupabase = {
  from: mockFrom,
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      list: jest.fn(),
    })),
  },
}

const createClient = jest.fn(() => mockSupabase)

module.exports = {
  createClient,
  SupabaseClient: jest.fn(),
}
