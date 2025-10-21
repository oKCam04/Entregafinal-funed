const express = require('express');
const router = express.Router();
const CertificadoController = require('../controller/certificadoController');
const aunthmiddleware = require('../middlewares/auth.middleware');

router.get("/certificado", CertificadoController.GetAll);

router.post("/certificado", aunthmiddleware, CertificadoController.Create);

router.get("/certificado/:id", aunthmiddleware, CertificadoController.GetForId);

router.patch("/certificado/:id", CertificadoController.Update);

router.delete("/certificado/:id", CertificadoController.Delete);

module.exports = router;
