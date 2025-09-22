const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
require("dotenv").config();
const path = require("path");
const { Client } = require("pg"); // ✅ PostgreSQL

const app = express();

// ----- POSTGRESQL / RENDER -----
// Utilise la DATABASE_URL de Render ou une valeur de secours
const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://monsitediscord_user:zikXQa5TkPx41Jpdbjkd98DIvfcDeLnx@dpg-d38pgk3uibrs73a11f50-a/monsitediscord',
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => console.log("Connecté à PostgreSQL Render"))
    .catch(err => console.error("Erreur connexion DB:", err));

// ----- SESSION -----
app.use(session({
    secret: process.env.SESSION_SECRET || "secret_ultra_complexe",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ----- PASSPORT DISCORD -----
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ["identify"]
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));

// ----- EXPRESS -----
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 
app.use(express.static(path.join(__dirname, "public"))); 

// ----- ROUTES -----
app.get("/", (req, res) => {
    res.render("index", { 
        user: req.user, 
        serverName: "Lumenia",
        twitchLink: "https://www.twitch.tv/klyze_03",
        discordLink: "https://discord.gg/mzf7wrHjB5",
        date: new Date()
    });
});

app.get("/login", passport.authenticate("discord"));

app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/profil");
});

app.get("/profil", checkAuth, async (req, res) => {
    const discordId = req.user.id;
    const discordEpoch = 1420070400000;
    const timestamp = ((BigInt(discordId) >> 22n) + BigInt(discordEpoch));
    const creationDate = new Date(Number(timestamp));

    // Exemple : récupérer ou stocker des données en DB
    try {
        await client.query(
            "INSERT INTO users (discord_id, username) VALUES ($1, $2) ON CONFLICT (discord_id) DO NOTHING",
            [discordId, req.user.username]
        );
    } catch(err) {
        console.error("Erreur DB utilisateur:", err);
    }

    res.render("profil", { 
        user: req.user, 
        serverName: "Lumenia",
        discordLink: "https://discord.gg/mzf7wrHjB5",
        twitchLink: "https://www.twitch.tv/klyze_03",
        creationDate
    });
});

app.get("/logout", (req, res) => {
    req.logout(() => { res.redirect("/"); });
});

// ----- MIDDLEWARE -----
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}

// ----- FRONT-END SPA / pages statiques -----
app.use((req, res, next) => {
    const definedRoutes = ["/", "/profil", "/login", "/callback", "/logout"];
    if (definedRoutes.includes(req.path)) return next();
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ----- LANCEMENT SERVEUR -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
