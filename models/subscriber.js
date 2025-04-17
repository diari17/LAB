const mongoose = require("mongoose");

const subscriberSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Le nom est obligatoire"],
        trim: true,
        minlength: [2, "Le nom doit contenir au moins 2 caractères"],
        maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"]
    },
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} n'est pas un email valide!`
        }
    },
    zipCode: {
        type: Number,
        required: [true, "Le code postal est obligatoire"],
        min: [10000, "Le code postal doit comporter 5 chiffres"],
        max: [99999, "Le code postal doit comporter 5 chiffres"],
        validate: {
            validator: Number.isInteger,
            message: props => `${props.value} n'est pas un nombre entier valide!`
        }
    }
}, { timestamps: true });

// Déclarez l'index avant de créer le modèle
subscriberSchema.index({ name: 'text', zipCode: 1 });

subscriberSchema.methods.getInfo = function() {
    return `Nom: ${this.name} Email: ${this.email} Code Postal: ${this.zipCode}`;
};

subscriberSchema.methods.findLocalSubscribers = function() {
    return this.model("Subscriber")
    .find({ zipCode: this.zipCode })
    .exec();
};

module.exports = mongoose.model("Subscriber", subscriberSchema);