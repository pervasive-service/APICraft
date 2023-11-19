const express = require('express');
const fs = require('fs');
const https = require('https');
const dotenv = require('dotenv'); // Install dotenv with `npm install dotenv`
dotenv.config();

const apiRoutes = require('./routes/api-backup');
const parseSwaggerMiddleware = require('./middleware/swaggerParser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(parseSwaggerMiddleware);
app.use('/api', apiRoutes);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'APICraft API Documentation',
      version: '1.0.0',
      description: 'Documentation for APICraft API',
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// HTTPS configuration
// const httpsOptions = {
//   key: fs.readFileSync(process.env.PRIVATE_KEY_PATH),
//   cert: fs.readFileSync(process.env.CERTIFICATE_PATH),
// };httpsOptions,

// Create an HTTPS server
https.createServer( app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
