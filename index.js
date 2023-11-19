// index.js

const express = require('express');
const swaggerParser = require('swagger-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware to parse Swagger files
app.use(async (req, res, next) => {
  try {
    const apiDoc = await swaggerParser.parse('path/to/swagger-file.yaml');
    req.apiDoc = apiDoc;
    next();
  } catch (err) {
    console.error('Error parsing Swagger file:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Define your routes here

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
