const express = require("express");
const ordersController = require("../controllers/ordersController");

const router = express.Router();

router.get("/check", ordersController.checkExistOrder);
// router.post("/search", ordersController.getOrder);
router.post("/create", ordersController.createNewOrder);
router.patch("/update", ordersController.updateOrder);
router.delete("/cancel", ordersController.cancelOrder);
router.post("/", (req, res) => {
    res.render("order");
});

module.exports = router;