const Subscriber = require("../models/subscriber");

exports.getAllSubscribers = async (req, res, next) => {
    try {
        const searchTerm = req.query.q?.trim();
        let query = {};
        
        if (searchTerm) {
            // Recherche textuelle sur le nom
            const nameRegex = new RegExp(searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
            const zipCode = parseInt(searchTerm);
            
            query = {
                $or: [
                    { name: nameRegex },
                    ...(!isNaN(zipCode) ? [{ zipCode }] : [])
                ]
            };
        }

        const subscribers = await Subscriber.find(query).sort({ name: 1 });
        
        res.render("subscribers/index", {
            pageTitle: searchTerm ? `Résultats pour "${searchTerm}"` : "Liste des Abonnés",
            subscribers,
            searchTerm: searchTerm || '',
            flash: req.flash()
        });
    } catch (error) {
        console.error(`Erreur: ${error.message}`);
        next(error);
    }
};

exports.getSubscriptionPage = (req, res) => {
    res.render("subscribers/new", {
        pageTitle: "S'abonner",
        formData: {},
        flash: req.flash()
    });
};

exports.saveSubscriber = async (req, res) => {
    try {
        // Nettoyage des données avant validation
        const subscriberData = {
            name: req.body.name?.trim(),
            email: req.body.email?.trim().toLowerCase(),
            zipCode: req.body.zipCode ? parseInt(req.body.zipCode) : null
        };

        // Validation manuelle supplémentaire
        const errors = [];
        
        if (!subscriberData.name || subscriberData.name.length < 2) {
            errors.push("Le nom doit contenir au moins 2 caractères");
        }

        if (!subscriberData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriberData.email)) {
            errors.push("Veuillez entrer un email valide");
        }

        if (!subscriberData.zipCode || isNaN(subscriberData.zipCode)) {
            errors.push("Le code postal doit être un nombre");
        } else if (subscriberData.zipCode < 10000 || subscriberData.zipCode > 99999) {
            errors.push("Le code postal doit comporter 5 chiffres");
        }

        if (errors.length > 0) {
            req.flash('error', errors);
            return res.render("subscribers/new", {
                pageTitle: "S'abonner",
                formData: req.body
            });
        }

        const newSubscriber = new Subscriber(subscriberData);
        await newSubscriber.save();
        
        req.flash("success", "Inscription réussie!");
        res.redirect("/subscribers");

    } catch (error) {
        if (error.name === "ValidationError") {
            const errorMessages = Object.values(error.errors).map(e => e.message);
            req.flash("error", errorMessages);
        } else if (error.code === 11000) {
            req.flash("error", "Cet email est déjà enregistré");
        } else {
            console.error("Erreur serveur:", error);
            req.flash("error", "Une erreur est survenue lors de l'inscription");
        }
        
        res.render("subscribers/new", {
            pageTitle: "S'abonner",
            formData: req.body
        });
    }
};

exports.show = async (req, res, next) => {
    try {
        const subscriber = await Subscriber.findById(req.params.id);
        if (!subscriber) {
            return next(new Error("Abonné non trouvé"));
        }
        res.render("subscribers/show", {
            pageTitle: "Profil Abonné",
            subscriber
        });
    } catch (error) {
        console.error(`Erreur: ${error.message}`);
        next(error);
    }
};

exports.deleteSubscriber = async (req, res, next) => {
    try {
        const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
        
        if (!subscriber) {
            req.flash('error', 'Abonné non trouvé');
            return res.redirect('/subscribers');
        }
        
        req.flash('success', 'Abonné supprimé avec succès');
        res.redirect('/subscribers');
    } catch (error) {
        console.error(`Erreur: ${error.message}`);
        req.flash('error', 'Erreur lors de la suppression');
        res.redirect('/subscribers');
    }
};

// Formulaire de modification
exports.getEditPage = async (req, res, next) => {
    try {
        const subscriber = await Subscriber.findById(req.params.id);
        if (!subscriber) {
            req.flash('error', 'Abonné non trouvé');
            return res.redirect('/subscribers');
        }
        res.render("subscribers/edit", {
            pageTitle: "Modifier Abonné",
            formData: subscriber
        });
    } catch (error) {
        console.error(`Erreur: ${error.message}`);
        next(error);
    }
};

// Traiter la modification
exports.updateSubscriber = async (req, res) => {
    try {
        const subscriber = await Subscriber.findById(req.params.id);
        if (!subscriber) {
            req.flash('error', 'Abonné non trouvé');
            return res.redirect('/subscribers');
        }

        // Vérifie si l'email est modifié et existe déjà
        if (req.body.email !== subscriber.email) {
            const existing = await Subscriber.findOne({ email: req.body.email });
            if (existing) {
                req.flash('error', 'Cet email est déjà enregistré');
                return res.render("subscribers/edit", {
                    pageTitle: "Modifier Abonné",
                    formData: req.body
                });
            }
        }

        const updatedSubscriber = await Subscriber.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        req.flash('success', 'Abonné modifié avec succès');
        res.redirect(`/subscribers/${updatedSubscriber._id}`);
    } catch (error) {
        if (error.name === "ValidationError") {
            req.flash('error', Object.values(error.errors).map(e => e.message));
        } else if (error.code === 11000) {
            req.flash('error', 'Cet email est déjà enregistré');
        } else {
            req.flash('error', 'Erreur lors de la modification');
        }
        
        res.render("subscribers/edit", {
            pageTitle: "Modifier Abonné",
            formData: req.body
        });
    }
};
