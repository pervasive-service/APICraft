// src/routes/dynamicApi.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/:route', async (req, res) => {
  try {
    // Get API details from Swagger file
    const swaggerInfo = req.apiDoc.info;
    const swaggerBaseUrl = req.apiDoc.servers[0].url; // Assuming the first server is the base URL

    // Build dynamic API call
    const dynamicApiPath = `/${req.params.route}`;
    const dynamicApiUrl = `${swaggerBaseUrl}${dynamicApiPath}`;

    // Make the dynamic API call
    const apiResponse = await axios.post(dynamicApiUrl, req.body);

    // Return a comprehensive response
    res.json({
      success: true,
      message: 'Dynamic API call successful',
      data: apiResponse.data,
      apiDetails: {
        swaggerInfo,
        swaggerBaseUrl,
        dynamicApiPath,
        dynamicApiUrl,
      },
    });
  } catch (error) {
    console.error('Error making dynamic API call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

module.exports = router;
