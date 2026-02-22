# 🔐 SofolPay RealTime Server

![License](https://img.shields.io/badge/License-Commercial-red)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Security](https://img.shields.io/badge/Auth-RS256-blue)
![Status](https://img.shields.io/badge/Distribution-Licensed_Only-important)

Secure, gateway-signed, JWT-verified **Realtime WebSocket Server**  
for the SofolPay Payment Gateway ecosystem.

⚠ **This software is proprietary and intended for licensed SofolPay customers only.**

---

# ⚠ Commercial License Required

This repository is publicly visible for transparency and distribution convenience.

However:

- This software is **NOT open-source**
- A valid **SofolPay Payment Gateway license is required**
- Unauthorized use, copying, redistribution, resale, or modification is strictly prohibited

For licensing inquiries:

📱 WhatsApp: +8801302100068  
🌐 https://softappbd.com  

---

# 🧠 Overview

SofolPay RealTime Server is a secure Socket.IO-based backend service that enables:

- Realtime payment confirmation
- QR consumption events
- Gateway-signed authentication
- Dynamic configuration from SofolPay Payment Gateway

This server works exclusively with the official SofolPay Payment Gateway system.

---

# 🏗 Architecture

```
                                Frontend → Socket.IO → Realtime Server
                                                ↑
                                                |
                                    SofolPay Payment Gateway
                                 (JWT + Config + Key Provider)
```

The Gateway controls:

- Public key distribution
- JWT issuer
- Allowed origins
- Key rotation (kid)
- Broadcast authorization

---

# 📦 Requirements

- Node.js >= 18 (Recommended: 20+)
- WebSocket support
- HTTPS in production
- Valid SofolPay Payment Gateway installation

---

# ⚙ Installation

```bash
git clone https://github.com/SoftAppBD/sofolpay-realtime.git
cd sofolpay-realtime
npm install
```

---

# 🔧 Environment Configuration

Create `.env` file:

```env
# ==============================
#  SofolPay RealTime Server
# ------------------------------
#  Licensed Commercial Software
#  SofolPay Ecosystem
# ------------------------------
#  © SofolPay. All Rights Reserved
# ==============================

# Your SofolPay Gateway Base URL
SOFOLPAY_GATEWAY_URL=https://paymentgateway.com

# Optional
PORT=3001
```

---

# 🔐 Security Model

### WebSocket Authentication
- JWT required in `socket.handshake.auth.token`
- RS256 verification
- Issuer validation
- Audience validation
- Public key fetched from SofolPay Payment Gateway

### Broadcast Endpoint Protection
- Bearer JWT required
- Path validation
- Optional SHA256 body validation
- Issuer + audience verification

---

# 🚀 Running the Server

```bash
npm start OR node index.js
```

Or production:

```bash
pm2 start index.js --name sofolpay-realtime
```

---

# 🌐 Deployment

## Option 1: cPanel (Node.js App)
- Select Node 18+
- Set startup file (`index.js`)
- Add `.env`
- Restart app

## Option 2: VPS + Reverse Proxy (Recommended)

Run internally:

```bash
PORT=3001 node index.js
```

Use Nginx or similar reverse proxy for:

- HTTPS
- No-port domain access
- WebSocket upgrade support

---

# 📡 Health Check

```
GET /health
```

Returns server status, connection count, and configuration state.

---

# 🛡 Production Security Recommendations

- Always use HTTPS
- Never expose internal port publicly
- Keep Gateway's private key secure
- Rotate keys via Gateway when required
- Restrict server firewall access
- Use process manager (PM2/Docker)

---

# 📜 License & Legal Notice

This software is part of the SofolPay Payment Gateway ecosystem.

Copyright © SofolPay.

All Rights Reserved.

This software may only be used by customers who have purchased a valid SofolPay Payment Gateway license.

Any unauthorized distribution, modification, reverse engineering, or commercial resale is strictly prohibited.

---

# 👨‍💻 Developer Contact

**SoftAppBD**  
Md Kaisarul Islam  
WhatsApp: +8801302100068  
Website: https://softappbd.com  

---

# ⚖ Legal Disclaimer

SofolPay is not responsible for:

- Misconfiguration by third parties
- Hosting limitations
- Unauthorized modifications
- Security breaches caused by improper deployment


Licensed users are responsible for maintaining secure hosting environments. *Thanks*.

