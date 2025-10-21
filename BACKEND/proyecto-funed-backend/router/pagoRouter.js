const express = require('express');
const router = express.Router();
const PagoController = require('../controller/pagoController');
const aunthmiddleware = require('../middlewares/auth.middleware');

router.get("/pago", PagoController.GetAll);

router.post("/pago", PagoController.Create);

router.get("/pago/:id", PagoController.GetForId);

router.patch("/pago/:id", PagoController.Update);

router.delete("/pago/:id", PagoController.Delete);

module.exports = router;
