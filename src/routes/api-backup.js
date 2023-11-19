// src/routes/api.js
/**
 * @swagger
 * tags:
 *   name: DynamicAPICall
 *   description: Endpoints for dynamically making API calls based on Swagger definition
 */

const express = require('express');
const router = express.Router();
const axios = require('axios'); // Install axios with `npm install axios`
const soap = require('soap');
const fs = require('fs/promises');
const formidable = require('formidable');
const https = require('https');
const yaml = require('yamljs');



/**
 * @swagger
 * path:
 *   /api/{route}:
 *     post:
 *       summary: Dynamically make API calls based on Swagger definition
 *       description: Endpoint for making dynamic API calls based on Swagger definition.
 *       tags: [DynamicAPICall]
 *       parameters:
 *         - in: path
 *           name: route
 *           required: true
 *           description: The dynamic route from the Swagger file.
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       responses:
 *         200:
 *           description: Successful API call
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     description: Indicates if the API call was successful.
 *                   message:
 *                     type: string
 *                     description: A message describing the result of the API call.
 *                   data:
 *                     type: object
 *                     description: Data retrieved from the dynamic API call.
 *                   apiDetails:
 *                     type: object
 *                     description: Additional information about the API call.
 */
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


router.post('/https-call', async (req, res) => {
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

  router.post('/bulk-upload', async (req, res) => {
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
  

// // Define a route for handling SOAP requests
// router.post('/soap-api-call', async (req, res) => {
//     try {
//       const soapUrl = process.env.SOAP_ENDPOINT_URL;
//       const soapClient = await soap.createClientAsync(soapUrl);
      
//       // Make the SOAP call
//       const result = await soapClient.YourSOAPFunctionAsync(req.body);
      
//       // Return the SOAP response
//       res.json({
//         success: true,
//         message: 'SOAP call successful',
//         data: result,
//       });
//     } catch (error) {
//       console.error('Error making SOAP call:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Internal Server Error',
//         error: error.message,
//       });
//     }
//   });

// Define a route for handling dynamic SOAP requests


// Map to store loaded SOAP templates (request and response)
const soapRequestTemplates = new Map();
const soapResponseTemplates = new Map();
// Define a route for adding dynamic SOAP routes, uploading request and response templates
router.post('/add-soap-call', async (req, res) => {
    try {
      const form = new formidable.IncomingForm();
  
      form.parse(req, async (err, fields, files) => {
        if (err) {
          throw new Error('Error parsing form data.');
        }
  
        const { soapRoute } = fields;
        const requestTemplateFile = files.requestTemplate;
        const responseTemplateFile = files.responseTemplate;
  
        // Verify if both SOAP templates are provided
        if (!requestTemplateFile || !responseTemplateFile) {
          throw new Error('Both request and response SOAP templates are required.');
        }
  
        // Read the SOAP request template file
        const requestTemplateContent = await fs.readFile(requestTemplateFile.path, 'utf-8');
        // Read the SOAP response template file
        const responseTemplateContent = await fs.readFile(responseTemplateFile.path, 'utf-8');
  
        // Verify if the templates are valid SOAP templates
        validateSoapTemplate(requestTemplateContent);
        validateSoapTemplate(responseTemplateContent);
  
        // Save the SOAP templates in the maps
        soapRequestTemplates.set(soapRoute, requestTemplateContent);
        soapResponseTemplates.set(soapRoute, responseTemplateContent);
  
        res.json({
          success: true,
          message: 'SOAP templates uploaded successfully.',
        });
      });
    } catch (error) {
      console.error('Error uploading SOAP templates:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  });
  
  // Define a route for handling dynamic SOAP requests
  router.post('/:soapRoute', async (req, res) => {
    try {
      const { soapRoute } = req.params;
  
      // Check if SOAP request template exists for the provided route
      const requestTemplateContent = soapRequestTemplates.get(soapRoute);
  
      if (!requestTemplateContent) {
        throw new Error('SOAP request template not found for the provided route.');
      }
  
      // Create a SOAP client with the request template
      const soapClient = await soap.createClientAsync(requestTemplateContent);
  
      // Make the SOAP request
      const soapRequestResult = await soapClient.YourSOAPFunctionAsync(req.body);
  
      // Check if SOAP response template exists for the provided route
      const responseTemplateContent = soapResponseTemplates.get(soapRoute);
  
      if (!responseTemplateContent) {
        throw new Error('SOAP response template not found for the provided route.');
      }
  
      // Create a SOAP client with the response template
      const responseSoapClient = await soap.createClientAsync(responseTemplateContent);
  
      // Make the SOAP response
      const soapResponseResult = await responseSoapClient.YourSOAPResponseFunctionAsync(soapRequestResult);
  
      // Return the SOAP response
      res.json({
        success: true,
        message: 'Dynamic SOAP call successful',
        data: soapResponseResult,
      });
    } catch (error) {
      console.error('Error making dynamic SOAP call:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  });
  
  // Function to validate SOAP template
  function validateSoapTemplate(templateContent) {
    // Implement your logic to validate if the provided content is a valid SOAP template
    // For simplicity, you can add basic validation logic here
    // Example: Check if the content contains necessary SOAP elements
    if (!templateContent.includes('<Envelope') || !templateContent.includes('<Body')) {
      throw new Error('Invalid SOAP template.');
    }
  }

module.exports = router;
