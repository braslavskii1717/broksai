"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.signAuthToken = signAuthToken;
exports.verifyAuthToken = verifyAuthToken;
exports.toPublicUser = toPublicUser;
exports.createUserAccount = createUserAccount;
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.ensureEmail = ensureEmail;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const SALT_ROUNDS = 10;
const TOKEN_TTL = '7d';
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
        throw new Error('JWT_SECRET must be configured and at least 16 characters long');
    }
    return secret;
}
const normalizeEmail = (email) => email.trim().toLowerCase();
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
}
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function signAuthToken(userId) {
    return jsonwebtoken_1.default.sign({ sub: userId }, getJwtSecret(), { expiresIn: TOKEN_TTL });
}
function verifyAuthToken(token) {
    return jsonwebtoken_1.default.verify(token, getJwtSecret());
}
function toPublicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role,
    };
}
async function createUserAccount(input) {
    const passwordHash = await hashPassword(input.password);
    return User_1.User.create({
        name: input.name,
        email: normalizeEmail(input.email),
        phone: input.phone,
        company: input.company,
        role: input.role ?? 'buyer',
        passwordHash,
    });
}
function findUserByEmail(email) {
    return User_1.User.findOne({ email: normalizeEmail(email) });
}
function findUserById(id) {
    return User_1.User.findById(id);
}
function ensureEmail(email) {
    return normalizeEmail(email);
}
