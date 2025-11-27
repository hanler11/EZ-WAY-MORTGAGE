/**
 * =============================================================
 *  EZ Way Mortgage Server (Express)
 * =============================================================
 *  Compliance / Legal Notice (English)
 *  -------------------------------------------------------------
 *  EZ Way Mortgage Corporation | Company NMLS #2679112 | Loan Originator NMLS #226951.
 *  All loans are subject to credit approval, underwriting guidelines, program availability and property conditions.
 *  This server code does NOT constitute a commitment to lend. Programs, rates, terms and conditions may change without notice.
 *  Equal Housing Opportunity. Internal operational use only. Remove debug logs & test routes before production deployment.
 *
 *  Aviso Legal (Español)
 *  -------------------------------------------------------------
 *  EZ Way Mortgage Corporation | NMLS de la empresa #2679112 | NMLS del originador #226951.
 *  Todos los préstamos están sujetos a aprobación de crédito, criterios de underwriting, disponibilidad de programas y condición de la propiedad.
 *  Este código del servidor NO constituye un compromiso de préstamo. Programas, tasas, términos y condiciones pueden cambiar sin previo aviso.
 *  Oportunidad de Vivienda Igualitaria. Uso operativo interno únicamente. Eliminar logs de depuración y rutas de prueba antes de producción.
 *
 *  Environment Variables (Required in Production)
 *  -------------------------------------------------------------
 *  DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT
 *  SESSION_SECRET
 *  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *  APP_BASE_URL (opcional para enlaces absolutos de reset)
 *
 *  Security TODOs:
 *  - Implement password hashing (bcrypt) instead of plain text.
 *  - Add rate limiting & helmet for basic hardening.
 *  - Enforce HTTPS behind proxy / load balancer.
 *  - Validate and sanitize user input (e.g., express-validator).
 * =============================================================
 */
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const session = require("express-session");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Conexión a MySQL
// TODO: Configurar variables de entorno reales para DB antes de producción.
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "ezwmortgage",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 8889,
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a MySQL:", err);
  } else {
    console.log("Conexión a MySQL exitosa");
  }
});

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_this_secret_in_prod",
    resave: false,
    saveUninitialized: true,
  })
);

// Ruta de login (solo usuarios existentes)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.json({ success: false, message: "DB error" });
      if (results.length > 0) {
        // Usuario existe, verifica contraseña
        if (results[0].password === password) {
          req.session.user = username;
          return res.json({ success: true });
        } else {
          return res.json({
            success: false,
            message: "Credenciales incorrectas",
          });
        }
      } else {
        return res.json({ success: false, message: "Usuario no existe" });
      }
    }
  );
});

// Ruta de logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Ruta para enviar email de recuperación
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.json({ success: false, message: "DB error" });
    if (results.length === 0)
      return res.json({ success: false, message: "Email no registrado" });

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 1000 * 60 * 60; // 1 hora

    db.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [token, expires, email],
      (err2) => {
        if (err2) return res.json({ success: false, message: "DB error" });

        // Configura tu transportador de correo
        // TODO: Reemplazar con credenciales seguras (variables de entorno / provider) antes de producción.
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
          secure: true,
          auth: {
            user: process.env.SMTP_USER || "placeholder@example.com",
            pass: process.env.SMTP_PASS || "app_password_here",
          },
        });

        const resetUrl = `http://${
          req.headers.host
        }/reset-password.html?token=${token}&email=${encodeURIComponent(
          email
        )}`;

        const mailOptions = {
          from: `EZ Way Mortgage <${
            process.env.SMTP_FROM ||
            process.env.SMTP_USER ||
            "noreply@ezwaymortgage.com"
          }>`,
          to: email,
          subject: "Restablece tu contraseña / Reset Your Password",
          html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña (válido 1 hora):</p>
                 <a href="${resetUrl}">${resetUrl}</a>
                 <hr/>
                 <p>Click the link above to reset your password (valid 1 hour).</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.json({
              success: false,
              message: "No se pudo enviar el correo",
            });
          }
          res.json({ success: true });
        });
      }
    );
  });
});

// Ruta para cambiar la contraseña usando el token
app.post("/reset-password", (req, res) => {
  const { email, token, new_password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_expires > ?",
    [email, token, Date.now()],
    (err, results) => {
      if (err) return res.json({ success: false, message: "DB error" });
      if (results.length === 0)
        return res.json({
          success: false,
          message: "Token inválido o expirado",
        });

      db.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE email = ?",
        [new_password, email],
        (err2) => {
          if (err2) return res.json({ success: false, message: "DB error" });
          res.json({ success: true });
        }
      );
    }
  );
});

// Ruta para saber si está autenticado
app.get("/auth", (req, res) => {
  res.json({ authenticated: !!req.session.user, user: req.session.user });
});

// Integrar sesión con Socket.io
io.use((socket, next) => {
  let req = socket.request;
  let res = {};
  session({
    secret: process.env.SESSION_SECRET || "change_this_secret_in_prod",
    resave: false,
    saveUninitialized: true,
  })(req, res, next);
});

io.on("connection", (socket) => {
  const req = socket.request;
  if (!req.session.user) {
    socket.emit("unauthorized");
    return;
  }

  // Enviar mensajes guardados al conectar
  db.query(
    "SELECT user, text, date FROM messages ORDER BY date ASC",
    [],
    (err, results) => {
      socket.emit("chat history", results || []);
    }
  );

  socket.on("chat message", (msg) => {
    const user = req.session.user;
    db.query(
      "INSERT INTO messages (user, text) VALUES (?, ?)",
      [user, msg],
      (err) => {
        if (err) {
          console.log("Error al guardar mensaje:", err);
          return;
        }
        db.query(
          "SELECT user, text, date FROM messages ORDER BY id DESC LIMIT 1",
          [],
          (err, results) => {
            if (results && results.length > 0) {
              io.emit("chat message", results[0]);
            }
          }
        );
      }
    );
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
