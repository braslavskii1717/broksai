import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { User, type UserDocument } from '../models/User';
import type { PublicUser, UserRole } from '../types/users';

const SALT_ROUNDS = 10;
const TOKEN_TTL = '7d';
let cachedJwtSecret: string | null = null;

export type AuthTokenPayload = JwtPayload & {
  sub: string;
};

function getJwtSecret() {
  if (cachedJwtSecret) {
    return cachedJwtSecret;
  }

  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) {
    cachedJwtSecret = secret;
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured and at least 16 characters long');
  }

  cachedJwtSecret = randomBytes(32).toString('hex');
  console.warn('JWT_SECRET не задан. Используется временный ключ, токены обнулятся после перезапуска.');
  return cachedJwtSecret;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(userId: string) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: TOKEN_TTL });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company,
    role: user.role,
  };
}

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  role?: UserRole;
};

export async function createUserAccount(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);
  return User.create({
    name: input.name,
    email: normalizeEmail(input.email),
    phone: input.phone,
    company: input.company,
    role: input.role ?? 'buyer',
    passwordHash,
  });
}

export function findUserByEmail(email: string) {
  return User.findOne({ email: normalizeEmail(email) });
}

export function findUserById(id: string) {
  return User.findById(id);
}

export function ensureEmail(email: string) {
  return normalizeEmail(email);
}
