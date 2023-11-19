// src/middleware/swaggerParser.js
const swaggerParser = require('swagger-parser');

// Middleware to parse Swagger files
const parseSwaggerMiddleware = async (req, res, next) => {
  try {
    const apiDoc = await swaggerParser.parse('../../config/swagger-file.yaml');
    req.apiDoc = apiDoc;
    next();
  } catch (err) {
    console.error('Error parsing Swagger file:', err);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = parseSwaggerMiddleware;
