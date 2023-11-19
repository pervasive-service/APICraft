// tests/unit/api.test.js
const request = require('supertest');
const app = require('../../src/index');

describe('API Routes', () => {
  it('should respond with "API modified successfully" for /api/modify-api', async () => {
    const response = await request(app).post('/api/modify-api');
    expect(response.status).toBe(200);
    expect(response.text).toBe('API modified successfully');
  });

  it('should respond with "API simulated successfully" for /api/simulate-api', async () => {
    const response = await request(app).post('/api/simulate-api');
    expect(response.status).toBe(200);
    expect(response.text).toBe('API simulated successfully');
  });
});

// __tests__/test.js

const { validateSoapTemplate } = require('../src/routes/soapCall'); // Import the function to test

describe('Unit Tests', () => {
  it('should validate a valid SOAP template', () => {
    const validTemplate = '<Envelope><Body></Body></Envelope>';
    expect(() => validateSoapTemplate(validTemplate)).not.toThrow();
  });

  it('should throw an error for an invalid SOAP template', () => {
    const invalidTemplate = '<Invalid></Invalid>';
    expect(() => validateSoapTemplate(invalidTemplate)).toThrow();
  });
});
