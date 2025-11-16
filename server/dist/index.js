"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const connect_1 = require("./lib/connect");
const cities_1 = __importDefault(require("./routes/cities"));
const chat_1 = __importDefault(require("./routes/chat"));
const properties_1 = __importDefault(require("./routes/properties"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN?.split(',') ?? '*',
}));
app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
});
app.use('/uploads', express_1.default.static(path_1.default.resolve(__dirname, '../uploads')));
app.use('/api/cities', cities_1.default);
app.use('/api/properties', properties_1.default);
app.use('/api/auth', auth_1.default);
app.use(chat_1.default);
app.use('/api/uploads', uploads_1.default);
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
(0, connect_1.connectDB)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 API server ready on http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error('Failed to start API server', error);
    process.exit(1);
});
