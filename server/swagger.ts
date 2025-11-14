/**
 * Especificação OpenAPI 3.0 para ParcelToken Pay API
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ParcelToken Pay API',
    description: 'API para gerenciar ParcelToken, SmartQR e pagamentos com liquidação instantânea via PIX',
    version: '1.0.0',
    contact: {
      name: 'ParcelToken Pay',
      url: 'https://parceltoken.com',
      email: 'api@parceltoken.com'
    },
    license: {
      name: 'Proprietary',
      url: 'https://parceltoken.com/license'
    }
  },
  servers: [
    {
      url: 'https://api.parceltoken.com/api',
      description: 'Production'
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Operações de autenticação e sessão'
    },
    {
      name: 'User',
      description: 'Operações relacionadas a consumidores'
    },
    {
      name: 'Merchant',
      description: 'Operações relacionadas a merchants'
    },
    {
      name: 'Payment',
      description: 'Operações de pagamento e transações'
    },
    {
      name: 'Public',
      description: 'Endpoints públicos'
    }
  ],
  paths: {
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Obter dados do usuário autenticado',
        description: 'Retorna informações do usuário atualmente autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Usuário autenticado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    openId: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin', 'merchant'] }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Não autenticado'
          }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Fazer logout',
        description: 'Encerra a sessão do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logout realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/user/profile': {
      get: {
        tags: ['User'],
        summary: 'Obter perfil do consumidor',
        description: 'Retorna dados do perfil e estatísticas do consumidor',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Perfil do consumidor',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    stats: {
                      type: 'object',
                      properties: {
                        totalTransactions: { type: 'number' },
                        totalSpent: { type: 'number' },
                        totalSavings: { type: 'number' },
                        activeTokens: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/user/token': {
      get: {
        tags: ['User'],
        summary: 'Obter ParcelToken ativo',
        description: 'Retorna o ParcelToken ativo do consumidor',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'ParcelToken ativo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    creditLimit: { type: 'number' },
                    usedAmount: { type: 'number' },
                    status: { type: 'string', enum: ['active', 'expired', 'revoked'] },
                    expiresAt: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['User'],
        summary: 'Criar novo ParcelToken',
        description: 'Cria um novo ParcelToken para o consumidor',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requestedLimit', 'maxInstallments'],
                properties: {
                  requestedLimit: { type: 'number', description: 'Limite de crédito solicitado em centavos' },
                  maxInstallments: { type: 'number', description: 'Número máximo de parcelas' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'ParcelToken criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tokenId: { type: 'number' },
                    creditLimit: { type: 'number' },
                    maxInstallments: { type: 'number' },
                    status: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/merchant/profile': {
      get: {
        tags: ['Merchant'],
        summary: 'Obter perfil do merchant',
        description: 'Retorna dados do perfil e estatísticas do merchant',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Perfil do merchant',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    businessName: { type: 'string' },
                    cnpj: { type: 'string' },
                    status: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/merchant/smartqr/generate': {
      post: {
        tags: ['Merchant'],
        summary: 'Gerar SmartQR',
        description: 'Gera um novo SmartQR para receber pagamentos',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', description: 'Valor em centavos' },
                  description: { type: 'string' },
                  maxInstallments: { type: 'number', default: 3 },
                  cashbackPercentage: { type: 'number', default: 0 },
                  discountPercentage: { type: 'number', default: 0 }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'SmartQR gerado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    qrId: { type: 'number' },
                    qrData: { type: 'object' },
                    qrCode: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/merchant/transactions': {
      get: {
        tags: ['Merchant'],
        summary: 'Listar transações do merchant',
        description: 'Retorna lista de transações do merchant',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 50 }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de transações'
          }
        }
      }
    },
    '/merchant/analytics': {
      get: {
        tags: ['Merchant'],
        summary: 'Obter analytics do merchant',
        description: 'Retorna analytics e KPIs do merchant',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'period',
            in: 'query',
            schema: { type: 'string', enum: ['7days', '30days', '90days'], default: '30days' }
          }
        ],
        responses: {
          '200': {
            description: 'Analytics do merchant'
          }
        }
      }
    },
    '/payment/execute': {
      post: {
        tags: ['Payment'],
        summary: 'Executar pagamento',
        description: 'Processa um pagamento via ParcelToken, PIX ou Cartão',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['qrId', 'installments', 'paymentMethod'],
                properties: {
                  qrId: { type: 'number' },
                  installments: { type: 'number', minimum: 1, maximum: 12 },
                  paymentMethod: { type: 'string', enum: ['parceltoken', 'pix', 'card'] }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Pagamento processado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    transactionId: { type: 'number' },
                    status: { type: 'string' },
                    amount: { type: 'number' },
                    installments: { type: 'number' },
                    savings: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/public/stats': {
      get: {
        tags: ['Public'],
        summary: 'Obter estatísticas da plataforma',
        description: 'Retorna estatísticas públicas da plataforma',
        responses: {
          '200': {
            description: 'Estatísticas da plataforma',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalUsers: { type: 'number' },
                    totalMerchants: { type: 'number' },
                    totalTransactions: { type: 'number' },
                    totalVolume: { type: 'number' },
                    totalSavings: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
};
