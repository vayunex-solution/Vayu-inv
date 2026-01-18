/**
 * Swagger Configuration
 * API documentation setup with OpenAPI 3.0
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { config } = require('../core/config');

/**
 * Swagger definition
 */
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Vaynex Inventory API',
        version: '1.0.0',
        description: 'Enterprise-grade REST API Platform for Inventory Management',
        contact: {
            name: 'API Support',
            email: 'support@vaynex.com'
        },
        license: {
            name: 'ISC',
            url: 'https://opensource.org/licenses/ISC'
        }
    },
    servers: [
        {
            url: 'https://inv-api.vayunexsolution.com',
            description: 'Production server'
        },
        {
            url: `http://localhost:${config.server.port}`,
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token'
            }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false
                    },
                    error: {
                        type: 'object',
                        properties: {
                            code: {
                                type: 'string',
                                example: 'VALIDATION_ERROR'
                            },
                            message: {
                                type: 'string',
                                example: 'Validation failed'
                            },
                            details: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        field: { type: 'string' },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true
                    },
                    message: {
                        type: 'string',
                        example: 'Operation successful'
                    },
                    data: {
                        type: 'object'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            PaginatedResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true
                    },
                    message: {
                        type: 'string'
                    },
                    data: {
                        type: 'array',
                        items: {}
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 10 },
                            total: { type: 'integer', example: 100 },
                            totalPages: { type: 'integer', example: 10 },
                            hasNextPage: { type: 'boolean', example: true },
                            hasPrevPage: { type: 'boolean', example: false }
                        }
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'admin@yahoo.com'
                    },
                    password: {
                        type: 'string',
                        format: 'password',
                        example: 'admin@123'
                    }
                }
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true
                    },
                    message: {
                        type: 'string',
                        example: 'Login successful'
                    },
                    data: {
                        type: 'object',
                        properties: {
                            accessToken: {
                                type: 'string',
                                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                            },
                            refreshToken: {
                                type: 'string',
                                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                            },
                            expiresIn: {
                                type: 'string',
                                example: '24h'
                            },
                            tokenType: {
                                type: 'string',
                                example: 'Bearer'
                            }
                        }
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            }
        },
        responses: {
            UnauthorizedError: {
                description: 'Authentication token is missing or invalid',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            },
            ForbiddenError: {
                description: 'Access denied - insufficient permissions',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            },
            NotFoundError: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            },
            ValidationError: {
                description: 'Validation failed',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            }
        }
    },
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication endpoints'
        },
        {
            name: 'Items',
            description: 'Inventory item management'
        }
    ]
};

/**
 * Swagger options
 */
const options = {
    swaggerDefinition,
    // Path to the API specs
    apis: [
        './src/projects/**/routes/*.js',
        './src/projects/**/swagger/*.js'
    ]
};

// Generate swagger spec
const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI
 * @param {Express} app - Express application
 */
const setupSwagger = (app) => {
    // Swagger UI options
    const swaggerUiOptions = {
        explorer: true,
        customSiteTitle: 'Vaynex API Documentation',
        customCss: `
            .swagger-ui .topbar { display: none }
            .swagger-ui .info .title { color: #3b4151 }
        `,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            showExtensions: true
        }
    };

    // Serve swagger spec as JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // Serve Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
};

module.exports = { setupSwagger, swaggerSpec };
