"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
    },
    company: {
        type: String,
    },
    role: {
        type: String,
        enum: ['broker', 'buyer', 'admin'],
        default: 'buyer',
    },
    passwordHash: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
userSchema.index({ email: 1 }, { unique: true });
exports.User = (0, mongoose_1.model)('User', userSchema);
