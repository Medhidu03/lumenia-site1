const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
require("dotenv").config();

const app = express();

// ----- SESSION -----
app.use(session({
    secret: "secret_ultra_complexe",
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
    scope: ["identify"] // Plus besoin de "guilds"
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));

// ----- EXPRESS -----
app.set("view engine", "ejs");
app.use(express.static("public"));

// ----- ROUTES -----
app.get("/", (req, res) => {
    res.render("index", { 
        user: req.user, 
        serverName: "Lumenia",
        twitchLink: "https://www.twitch.tv/klyze_03",
        discordLink: "https://discord.gg/mzf7wrHjB5",
        date: new Date() // pour afficher la date sur la page d'accueil
    });
});

app.get("/login", passport.authenticate("discord"));

app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/profil");
});

app.get("/profil", checkAuth, (req, res) => {
    // Calculer la date de création du compte Discord
    const discordId = req.user.id;
    const discordEpoch = 1420070400000; // Epoch Discord (1er Janvier 2015)
    const timestamp = ((BigInt(discordId) >> 22n) + BigInt(discordEpoch));
    const creationDate = new Date(Number(timestamp));

    res.render("profil", { 
        user: req.user, 
        serverName: "Lumenia",
        discordLink: "https://discord.gg/mzf7wrHjB5",
        twitchLink: "https://www.twitch.tv/klyze_03",
        creationDate // Date de création du compte Discord
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

// ----- LANCEMENT SERVEUR -----
app.listen(3000, () => {
    console.log("Serveur lancé sur http://localhost:3000");
});
