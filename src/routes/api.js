// src/routes/api.js

const express = require('express');
const router = express.Router();
const dynamicApiRoute = require('./dynamicApi');
const httpsCallRoute = require('./httpsCall');
const bulkUploadRoute = require('./bulkUpload');
const soapCallRoute = require('./soapCall');

router.use('/dynamic-api', dynamicApiRoute);
router.use('/https-call', httpsCallRoute);
router.use('/bulk-upload', bulkUploadRoute);
router.use('/soap-call', soapCallRoute);

module.exports = router;
