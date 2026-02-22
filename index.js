import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const app = express();
app.use(express.json({ limit: "256kb" })); 

/**
 * =========================================================
 *  SofolPay RealTime Server
 * ---------------------------------------------------------
 *  Developer Contact:
 *  SofolPay
 *  Md Kaisarul Islam
 *  WhatsApp: +8801302100068
 *  https://softappbd.com
 * ---------------------------------------------------------
 *  © All Rights Reserved
 * =========================================================
 */

const PORT = process.env.PORT || 3001;
const GATEWAY_URL = (process.env.SOFOLPAY_GATEWAY_URL || "").replace(
  /\/+$/,
  "",
);
const ORIGIN_LOCK = (process.env.SOFOLPAY_ALLOWED_ORIGIN || "").trim();

let CONFIG = {
  issuer: null,
  kid: null,
  public_key_pem: null,
  allowed_origins: [],
  last_refresh_at: null,
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeHost(host) {
  return String(host || "")
    .trim()
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/:\d+$/, "");
}

function hostnameFromOrigin(origin) {
  try {
    const u = new URL(origin);
    return normalizeHost(u.hostname);
  } catch {
    return normalizeHost(origin);
  }
}

function parseAllowedList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(normalizeHost).filter(Boolean);
  return String(val)
    .split(",")
    .map((s) => normalizeHost(s))
    .filter(Boolean);
}

function matchHost(host, rule) {
  if (!rule) return false;
  if (rule === "*") return true;
  if (rule.startsWith("*.")) {
    const base = rule.slice(2);
    if (!base) return false;
    return host !== base && host.endsWith("." + base);
  }
  return host === rule;
}

function isHostAllowed(host) {
  const rules = ORIGIN_LOCK
    ? parseAllowedList(ORIGIN_LOCK)
    : parseAllowedList(CONFIG.allowed_origins);
  if (!rules.length) return false;
  for (const r of rules) {
    if (matchHost(host, r)) return true;
  }
  return false;
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  const host = hostnameFromOrigin(origin);
  return isHostAllowed(host);
}

async function fetchConfig() {
  if (!GATEWAY_URL) {
    console.warn("[config] SOFOLPAY_GATEWAY_URL not set; cannot fetch config");
    return;
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/api/internal/realtime-config`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn("[config] gateway responded", res.status);
      return;
    }

    const json = await res.json();
    const data = json?.data || {};

    CONFIG.issuer = data.issuer || CONFIG.issuer || GATEWAY_URL;
    CONFIG.kid = data.kid || CONFIG.kid || null;
    CONFIG.public_key_pem =
      data.public_key_pem || CONFIG.public_key_pem || null;
    CONFIG.allowed_origins =
      data.allowed_origins || CONFIG.allowed_origins || [];
    CONFIG.last_refresh_at = nowIso();

    console.log("[config] refreshed", {
      issuer: CONFIG.issuer,
      kid: CONFIG.kid,
      origins: Array.isArray(CONFIG.allowed_origins)
        ? CONFIG.allowed_origins.length
        : 0,
      origin_lock: !!ORIGIN_LOCK,
    });
  } catch (e) {
    console.warn("[config] fetch failed:", e?.message || e);
  }
}

/**
 * =========================================================
 *  SofolPay RealTime Server
 * ---------------------------------------------------------
 *  Developer Contact:
 *  SofolPay
 *  Md Kaisarul Islam
 *  WhatsApp: +8801302100068
 *  https://softappbd.com
 * ---------------------------------------------------------
 *  © All Rights Reserved
 * =========================================================
 */

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>SofolPay RealTime Server Is Running</title>
      <link rel="icon" type="image/png" href="https://sofolpay.netlify.app/images/sofolpay.png" sizes="32x32">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body,
        html {
          height: 100%;
          width: 100%;
          font-family: 'JetBrains Mono', monospace;
          background-color: #014401;
          color: #0a6102;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .bg-glow {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            radial-gradient(circle at 10% 20%, rgba(83, 255, 3, 0.425) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(43, 255, 0, 0.425) 0%, transparent 40%);
          z-index: -1;
        }
        .main-content {
          text-align: center;
          width: 100%;
          max-width: auto;
          padding: 40px;
          animation: fadeIn 1.5s ease-out;
        }
        h1 {
          font-size: clamp(2rem, 8vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 1.1;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.4) 100%);
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 30px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 600px) {
          h1 {
            font-size: 2.2rem;
          }

          .main-content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="bg-glow"></div>
      <div class="main-content">
        <h1>SofolPay RealTime Server Is Running</h1>
      </div>
    </body>
    </html>
  `);
});

/**
 * =========================================================
 *  SofolPay RealTime Server
 * ---------------------------------------------------------
 *  Developer Contact:
 *  SofolPay
 *  Md Kaisarul Islam
 *  WhatsApp: +8801302100068
 *  https://softappbd.com
 * ---------------------------------------------------------
 *  © All Rights Reserved
 * =========================================================
 */

app.use(
  cors({
    origin(origin, cb) {
      cb(null, isOriginAllowed(origin));
    },
    credentials: true,
  }),
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin(origin, cb) {
      cb(null, isOriginAllowed(origin));
    },
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));

    if (!CONFIG.public_key_pem)
      return next(new Error("Realtime config not loaded"));

    const payload = jwt.verify(token, CONFIG.public_key_pem, {
      algorithms: ["RS256"],
      issuer: CONFIG.issuer || undefined,
      audience: "sofolpay-realtime",
    });

    if (!payload?.user_id) return next(new Error("Invalid token payload"));

    socket.data.user_id = String(payload.user_id);
    socket.data.payment_id = payload.payment_id || null;

    next();
  } catch (e) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.user_id;

  socket.join(`u:${userId}`);

  if (socket.data.payment_id) {
    socket.join(`u:${userId}:p:${socket.data.payment_id}`);
  }

  socket.emit("connected", { ok: true });
});

function sha256Hex(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function verifyBroadcastJwt(req) {
  const auth = req.header("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return { ok: false, error: "Missing bearer token" };

  if (!CONFIG.public_key_pem)
    return { ok: false, error: "Realtime config not loaded" };

  try {
    const payload = jwt.verify(m[1], CONFIG.public_key_pem, {
      algorithms: ["RS256"],
      issuer: CONFIG.issuer || undefined,
      audience: "sofolpay-realtime-broadcast",
    });

    if (payload?.path && payload.path !== req.path) {
      return { ok: false, error: "Path mismatch" };
    }

    if (payload?.body_sha256) {
      const bodyJson = JSON.stringify(req.body || {});
      const h = sha256Hex(bodyJson);
      if (h !== String(payload.body_sha256)) {
        return { ok: false, error: "Body hash mismatch" };
      }
    }

    return { ok: true, payload };
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
}

app.post("/broadcast/payment", (req, res) => {
  const v = verifyBroadcastJwt(req);
  if (!v.ok) return res.status(401).json({ ok: false, message: v.error });

  const { user_id, payment_id, trx_id, redirect } = req.body || {};
  if (!user_id || !payment_id) {
    return res.status(422).json({ ok: false, message: "Invalid payload" });
  }

  const room = `u:${user_id}:p:${payment_id}`;

  io.to(room).emit("payment_completed", {
    paid: true,
    trx_id: trx_id || "",
    redirect: redirect || null,
  });

  return res.json({ ok: true, room });
});

app.post("/broadcast/qr", (req, res) => {
  const v = verifyBroadcastJwt(req);
  if (!v.ok) return res.status(401).json({ ok: false, message: v.error });

  const { user_id, device_id } = req.body || {};
  if (!user_id) {
    return res.status(422).json({ ok: false, message: "Invalid payload" });
  }

  io.to(`u:${user_id}`).emit("qr_consumed", {
    ok: true,
    device_id: device_id || "",
  });

  return res.json({ ok: true });
});

app.get("/health", (req, res) => {
  const rooms = io.sockets.adapter.rooms.size;
  const clients = io.engine.clientsCount;

  res.json({
    ok: true,
    server_time: nowIso(),
    clients,
    rooms,
    config_loaded: !!CONFIG.public_key_pem,
    issuer: CONFIG.issuer,
    kid: CONFIG.kid,
    allowed_origins_count: parseAllowedList(
      ORIGIN_LOCK || CONFIG.allowed_origins,
    ).length,
    origin_lock: !!ORIGIN_LOCK,
    last_refresh_at: CONFIG.last_refresh_at,
  });
});

(async () => {
  await fetchConfig();
  setInterval(fetchConfig, 60 * 1000);

  server.listen(PORT, () => {
    console.log(`SofolPay Realtime Server listening on port: ${PORT}`);
  });
})();

/**
 * =========================================================
 *  SofolPay RealTime Server
 * ---------------------------------------------------------
 *  Developer Contact:
 *  SofolPay
 *  Md Kaisarul Islam
 *  WhatsApp: +8801302100068
 *  https://softappbd.com
 * ---------------------------------------------------------
 *  © All Rights Reserved
 * =========================================================
 */
