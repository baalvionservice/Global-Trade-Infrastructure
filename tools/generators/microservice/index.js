/**
 * @file tools/generators/microservice/index.js
 * @description Plop.js generator for standardized sovereign microservices.
 */
module.exports = function (plop) {
  plop.setGenerator('microservice', {
    description: 'Provision a new NestJS Sovereign Microservice',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'Service Identity (e.g. risk-intelligence)'
    }],
    actions: [
      {
        type: 'addMany',
        destination: 'services/{{kebabCase name}}',
        templateFiles: 'tools/generators/microservice/templates/**/*'
      }
    ]
  });
};
