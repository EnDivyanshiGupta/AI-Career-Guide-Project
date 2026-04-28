import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: "Too many requests, please wait 5 minutes." }
});
app.use("/api/career", limiter);

// ─── DB ───────────────────────────────────────────────────────
const DB_DIR = path.join(__dirname, "../database");
const USERS_FILE = path.join(DB_DIR, "users.json");
const HISTORY_FILE = path.join(DB_DIR, "history.json");

function readDB(file) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}
function writeDB(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ─── OPENROUTER API KEY ──────────────────────────────────────
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

// ─── SIGNUP ───────────────────────────────────────────────────
app.post("/api/signup", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: "All fields required" });
    const users = readDB(USERS_FILE);
    if (users.find(u => u.email === email))
        return res.status(409).json({ error: "Email already registered" });
    const newUser = { id: Date.now().toString(), name, email, password, createdAt: new Date().toISOString() };
    users.push(newUser);
    writeDB(USERS_FILE, users);
    res.json({ success: true, user: { id: newUser.id, name, email } });
});

// ─── LOGIN ────────────────────────────────────────────────────
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const users = readDB(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
});

// ─── CAREER (OPENROUTER - FREE) ─────────────────────────────────────
app.post("/api/career", async (req, res) => {
    const { skills, interest, cgpa, field, userId } = req.body;

    const prompt = `You are an expert career counselor for Indian students. Analyze this profile:
- Preferred Field: ${field || "Not specified"}
- Technical Skills: ${skills || "Not specified"}
- Interests: ${interest || "Not specified"}
- CGPA: ${cgpa || "Not specified"}

Respond in this EXACT format:

CAREER TITLE: [One clear career title]

WHY THIS FITS YOU: [2-3 sentences explaining why]

TOP SKILLS TO LEARN:
• [Skill 1]
• [Skill 2]
• [Skill 3]

ROADMAP:
• [Step 1]
• [Step 2]
• [Step 3]

SALARY IN INDIA: Entry level: X LPA | Mid level: Y LPA | Senior: Z LPA

TOP COMPANIES: Company1, Company2, Company3, Company4, Company5`;

    try {
        console.log("Calling OpenRouter API...");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "AI Career Guide"
    },
    body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
            { role: "user", content: prompt }
        ],
        max_tokens: 1000
    })
});

        const data = await response.json();
        console.log("HTTP Status:", response.status);

        if (data.error) {
            console.error("Groq error:", data.error.message);
            return res.status(500).json({ error: "Groq Error: " + data.error.message });
        }

        const result = data.choices[0].message.content;
        console.log("✅ Success!");

        if (userId) {
            const history = readDB(HISTORY_FILE);
            history.push({
                id: Date.now().toString(), userId,
                input: { skills, interest, cgpa, field },
                result, createdAt: new Date().toISOString()
            });
            writeDB(HISTORY_FILE, history);
        }

        res.json({ success: true, result });

    } catch (err) {
        console.error("ERROR:", err.message);
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// ─── HISTORY ──────────────────────────────────────────────────
app.get("/api/history/:userId", (req, res) => {
    const history = readDB(HISTORY_FILE);
    const userHistory = history
        .filter(h => h.userId === req.params.userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, history: userHistory });
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
