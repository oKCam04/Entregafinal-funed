const express = require('express');
const router = express.Router();
const DocumentoController = require('../controller/documentoController');
const aunthmiddleware = require('../middlewares/auth.middleware');

router.get("/documento", DocumentoController.GetAll);

router.post("/documento", DocumentoController.Create);

router.get("/documento/:id", DocumentoController.GetForId);

router.patch("/documento/:id", DocumentoController.Update);

router.delete("/documento/:id", DocumentoController.Delete);

module.exports = router;
