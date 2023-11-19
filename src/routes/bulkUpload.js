// src/routes/bulkUpload.js

const express = require('express');
const yaml = require('yamljs');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { swaggerFile, requests } = req.body;

    const swaggerData = yaml.load(swaggerFile);

    // Process each request
    const results = await Promise.all(requests.map(async (request) => {
      const { route, data } = request;

      // Build dynamic API call
      const dynamicApiPath = `/${route}`;
      const dynamicApiUrl = `${swaggerData.servers[0].url}${dynamicApiPath}`;

      // Make the dynamic API call
      const apiResponse = await axios.post(dynamicApiUrl, data);

      return {
        route,
        result: apiResponse.data,
      };
    }));

    res.json({
      success: true,
      message: 'Bulk upload successful',
      results,
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

module.exports = router;
