const express = require("express");
const router = express.Router();
const subscribersController = require("./controllers/subscribersController");

app.get("/subscribers", subscribersController.getAllSubscribers);
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", subscribersController.saveSubscriber);
app.get("/subscribers/:id", subscribersController.show);
app.get("/subscribers/:id/edit", subscribersController.getEditPage); // EDit
app.put("/subscribers/:id", subscribersController.updateSubscriber); //Update
app.post("/subscribers/:id/delete", subscribersController.deleteSubscriber); //Supp abonnés

module.exports = router;