const express = require("express");
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require("mongoose"); // Ajout de Mongoose
const layouts = require("express-ejs-layouts");
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const subscribersController = require("./controllers/subscribersController");

// Ajoutez les contrôleurs
const usersController = require("./controllers/usersController");
const coursesController = require("./controllers/coursesController");
// Ajouter le middleware method-override
const methodOverride = require("method-override");


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

// Initialisation de connect-flash (après session)
app.use(flash());

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

// Gestion des erreurs
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// Démarrer le serveur
app.listen(app.get("port"), () => {
console.log(`Le serveur a démarré et écoute sur le port: ${app.get("port")}`);
console.log(`Serveur accessible à l'adresse: http://localhost:${app.get("port")}`);
});

