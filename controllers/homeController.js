// Données des cours (seront remplacées par une base de données plus tard)
const courses = [
{
    title: "Introduction à l'IA",
    description: "Découvrez les fondamentaux de l'intelligence artificielle.",
    price: 199,
    level: "Débutant"
},
{
    title: "Machine Learning Fondamental",
    description: "Apprenez les principes du machine learning et les algorithmes de base.",
    price: 299,
    level: "Intermédiaire"
},
{
    title: "Deep Learning Avancé",
    description: "Maîtrisez les réseaux de neurones profonds et leurs applications.",
    price: 399,
    level: "Avancé"
}
];
exports.index = (req, res) => {
    res.render("index", { pageTitle: "Accueil" });
};
    exports.about = (req, res) => {
    res.render("about", { pageTitle: "À propos" });
};
    exports.courses = (req, res) => {
    res.render("courses", {
    pageTitle: "Nos Cours",
    courses: courses
});
};

exports.faq = (req, res) => {
    res.render("faq", { pageTitle: "FAQ" });
};

exports.contact = (req, res) => {
    res.render("contact", { pageTitle: "Contact" });
};
exports.processContact = (req, res) => {
    const { name, email, message } = req.body;
    const errors = [];
  
    // Validation des champs
    if (!name || name.trim() === '') {
      errors.push('Le nom est requis');
    }
    if (!email || email.trim() === '') {
      errors.push('L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Veuillez entrer une adresse email valide');
    }
    if (message && message.length > 500) {
      errors.push('Le message ne doit pas dépasser 500 caractères');
    }
    // Si error affichage formulaire avec les erreurs
    if (errors.length > 0) {
        req.session.flash = {
          type: 'error',
          messages: errors,
          formData: req.body // Sauvegarde des données pour pré-remplir
        };
        return res.redirect('/contact');
      }
    // Si tout est valide, continuer
    console.log("Données du formulaire reçues:");
    console.log(req.body);
    
    req.session.flash = {
      type: 'success',
      message: 'Votre message a bien été envoyé!'
    };
    res.render("thanks", {
      pageTitle: "Merci",
      formData: req.body
    });
  };
  