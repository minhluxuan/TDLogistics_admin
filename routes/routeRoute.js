const router = require("express").Router();
const auth = require("../lib/auth");
const routeController = require("../controllers/routesController");

router.post("/search", auth.isAuthenticated(), routeController.getRoutes);
router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER"]), auth.isActive(), routeController.createNewRoute);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER"]), auth.isActive(), routeController.updateRoute);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER"]), auth.isActive(), routeController.deleteRoute);

module.exports = router;