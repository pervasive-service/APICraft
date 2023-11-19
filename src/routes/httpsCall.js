// src/routes/httpsCall.js

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    const requestOptions = {
      method: method || 'GET',
      headers: headers || {},
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
      requestOptions.headers['Content-Type'] = 'application/json';
    }

    const httpsResponse = await fetch(url, requestOptions);
    const responseData = await httpsResponse.json();

    res.json({
      success: true,
      message: 'HTTPS call successful',
      data: responseData,
    });
  } catch (error) {
    console.error('Error making HTTPS call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

module.exports = router;
