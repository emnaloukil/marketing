const express = require('express')
const cors    = require('cors')

// ─────────────────────────────────────────
// app.js — Express application
//
// Rôle : configurer Express — middleware, CORS, routes.
// Ce fichier ne démarre PAS le serveur (c'est server.js qui le fait).
// Cette séparation permet de tester app.js sans démarrer le serveur.
// ─────────────────────────────────────────

const app = express()

// ── Middleware ────────────────────────────

// Parse incoming JSON bodies
app.use(express.json())

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }))

// CORS — allow frontend React to call this API
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))

// ── Health check route ────────────────────
// Used to verify the server is running
app.get('/', (req, res) => {
  res.json({
    message: 'EduKids API is running',
    status:  'ok',
    version: '1.0.0',
  })
})

// ── Routes ────────────────────────────────────────────────────────────────────
const sessionRoutes = require("./routes/sessionRoutes");
const eventRoutes   = require("./routes/eventRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require('./routes/studentRoutes');
const parentRoutes = require('./routes/parentRoutes');
const jobRoutes = require('./routes/jobRoutes');
const authRoutes = require('./routes/authRoutes');
const parentChildRoutes = require('./routes/parentChildRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const classRoutes = require('./routes/classRoutes');
const materialRoutes = require('./routes/materialRoutes');
const liveRoutes = require('./routes/liveRoutes');


app.use('/api/live',      liveRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/parent/children', parentChildRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/students', studentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/events",   eventRoutes);
app.use("/api/teacher",  teacherRoutes);
app.use('/uploads', express.static('uploads'))
// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "EduKids API opérationnelle" });
});

// ── 404 handler ───────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` })
})

// ── Global error handler ──────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

module.exports = app