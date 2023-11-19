// src/routes/soapCall.js

const express = require('express');
const soap = require('soap');
const fs = require('fs/promises');
const formidable = require('formidable');
const router = express.Router();

// Map to store loaded SOAP templates (request and response)
const soapRequestTemplates = new Map();
const soapResponseTemplates = new Map();

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
