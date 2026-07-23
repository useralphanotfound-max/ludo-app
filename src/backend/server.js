import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import requestIp from 'request-ip';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS & JSON Body Parser
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request IP extraction middleware
app.use(requestIp.mw());

// API Routes Mounted under /api/
app.use('/api', apiRoutes);

// Serve static frontend build assets if available
const clientBuildPath = path.join(__dirname, '../../dist');
app.use(express.static(clientBuildPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: true,
    message: 'Royal Ludo Backend API & Superadmin Server is operational',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// SPA Fallback for Superadmin Panel routes (/superadmin/login, /superadmin/dashboard, etc.)
app.get(['/superadmin', '/superadmin/*', '/'], (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Royal Ludo Superadmin</title>
          <style>
            body { font-family: sans-serif; background: #0f172a; color: #f8fafc; display: flex; height: 100vh; align-items: center; justify-content: center; }
            .card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; text-align: center; }
            h1 { color: #f59e0b; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>👑 Royal Ludo Superadmin Server</h1>
            <p>Server running on port 3000</p>
            <p>Mobile API Endpoint: <code>http://localhost:3000/api/</code></p>
            <p>Superadmin Login: <code>http://localhost:3000/superadmin/login</code></p>
            <p><em>(Please run <code>npm run build:client</code> to serve full UI)</em></p>
          </div>
        </body>
        </html>
      `);
    }
  });
});

// Start Express Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(`🚀 Royal Ludo Backend API & Superadmin Server is active!`);
    console.log(`🌐 Server Base URL:  http://localhost:${PORT}`);
    console.log(`📱 Mobile App APIs:  http://localhost:${PORT}/api/`);
    console.log(`👑 Superadmin Login: http://localhost:${PORT}/superadmin/login`);
    console.log(`=============================================================`);
  });
});
