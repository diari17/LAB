const express = require("express");
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require("mongoose"); // Ajout de Mongoose
// Ajouter le middleware method-override
const methodOverride = require("method-override");
const passport = require("passport");
const cookieParser = require("cookie-parser");


const layouts = require("express-ejs-layouts");
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const subscribersController = require("./controllers/subscribersController");

// Ajoutez les contrôleurs
const usersController = require("./controllers/usersController");
const coursesController = require("./controllers/coursesController");

const authController = require("./controllers/authController");


// Configuration de la connexion à MongoDB
mongoose.connect(
  "mongodb://localhost:27017/ai_academy",
  { useNewUrlParser: true,
    useUnifiedTopology: true
   }
  );
  const db = mongoose.connection;
  db.once("open", () => {
    console.log("Connexion réussie à MongoDB en utilisant Mongoose!");
  });
  const app = express();

// Définir le port
app.set("port", process.env.PORT || 3000);
// Configuration d'EJS comme moteur de template
app.set("view engine", "ejs");
app.use(layouts);
// Middleware pour traiter les données des formulaires
app.use(
express.urlencoded({
extended: false
})
);

app.use(session({
    secret: 'votre_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// // Initialisation de connect-flash (après session)
// app.use(flash());
// const app = express();
// Configuration de l'application
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(layouts);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method", {
methods: ["POST", "GET"]
}));
// Configuration des cookies et des sessions
app.use(cookieParser("secret_passcode"));
app.use(session({
secret: "secret_passcode",
cookie: {
maxAge: 4000000
},
resave: false,
saveUninitialized: false
}));
// Configuration de flash messages
app.use(flash());
// Configuration de Passport
app.use(passport.initialize());
app.use(passport.session());
// Configuration du User model pour Passport
const User = require("./models/user");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Middleware pour rendre les variables locales disponibles dans toutes les vues
app.use((req, res, next) => {
res.locals.flashMessages = req.flash();
res.locals.loggedIn = req.isAuthenticated();
res.locals.currentUser = req.user;


next();
});

app.use(methodOverride("_method", {
  methods: ["POST", "GET"]
  
  }));

// Ce middleware doit être après app.use(flash())
app.use((req, res, next) => {
    res.locals.flash = req.flash(); // Transfère les messages flash aux vues
    next();
});

app.use((req, res, next) => {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
  });

app.use(express.json());

// app.use(methodOverride('_method'));

// Servir les fichiers statiques
app.use(express.static("public"));

// Middleware pour les variables globales
app.use((req, res, next) => {
  res.locals.pageTitle = 'AI Academy'; // Valeur par défaut
  res.locals.currentPath = req.path;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// Définir les routes
app.get("/", homeController.index);
app.get("/about", homeController.about);
// app.get("/courses", homeController.courses);
app.get("/contact", homeController.contact);
app.post("/contact", homeController.processContact);
app.get("/faq", homeController.faq);

// Routes pour les abonnés
app.get("/subscribers", subscribersController.getAllSubscribers);
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", subscribersController.saveSubscriber);
app.get("/subscribers/:id", subscribersController.show);
app.get("/subscribers/:id/edit", subscribersController.getEditPage); // EDit
app.put("/subscribers/:id", subscribersController.updateSubscriber); //Update
app.post("/subscribers/:id/delete", subscribersController.deleteSubscriber); //Supp abonnés

// Routes pour les utilisateurs
app.get("/users", usersController.index, usersController.indexView);
app.get("/users/new", usersController.new);
app.post("/users/create", usersController.create, usersController.redirectView);
app.get("/users/:id", usersController.show, usersController.showView);
app.get("/users/:id/edit", usersController.edit);
app.put("/users/:id/update", usersController.update, usersController.redirectView);
app.delete("/users/:id/delete", usersController.delete, usersController.redirectView);
// Routes pour les cours
app.get("/courses", coursesController.index, coursesController.indexView);
app.get("/courses/new", coursesController.new);
app.post("/courses/create", coursesController.create, coursesController.redirectView);
app.get("/courses/:id", coursesController.show, coursesController.showView);
app.get("/courses/:id/edit", coursesController.edit);
app.put("/courses/:id/update", coursesController.update, coursesController.redirectView);
app.delete("/courses/:id/delete", coursesController.delete, coursesController.redirectView);


// Authentification
app.get("/login", authController.login);
app.post("/login", authController.authenticate);
app.get("/logout", authController.logout, usersController.redirectView);
app.get("/signup", authController.signup);
app.post("/signup", authController.register, usersController.redirectView);

// Routes protégées
app.get("/users", authController.ensureLoggedIn, usersController.index, usersController.indexView);
app.get("/users/new", authController.ensureLoggedIn, usersController.new);
app.get("/users/:id/edit", authController.ensureLoggedIn, usersController.edit);

app.get("/courses/new", authController.ensureLoggedIn, coursesController.new);
app.get("/courses/:id/edit", authController.ensureLoggedIn, coursesController.edit);

// Gestion des erreurs
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// Démarrer le serveur
app.listen(app.get("port"), () => {
console.log(`Le serveur a démarré et écoute sur le port: ${app.get("port")}`);
console.log(`Serveur accessible à l'adresse: http://localhost:${app.get("port")}`);
});

