/**
 * ParcelToken SDK - JavaScript Library
 * Versão: 1.0.0
 * 
 * Biblioteca para integração de ParcelToken em sites de merchants
 * Permite checkout embarcado e gerenciamento de transações
 */

class ParcelTokenSDK {
  constructor(config = {}) {
    this.apiKey = config.apiKey || null;
    this.merchantId = config.merchantId || null;
    this.environment = config.environment || 'production';
    this.baseURL = config.baseURL || 'https://api.parceltoken.com';
    this.callbackURL = config.callbackURL || null;
    this.onSuccess = config.onSuccess || null;
    this.onError = config.onError || null;
    this.onPaymentStatusChange = config.onPaymentStatusChange || null;

    if (!this.apiKey || !this.merchantId) {
      console.warn('ParcelToken SDK: apiKey e merchantId são obrigatórios');
    }

    this.validateConfig();
  }

  /**
   * Valida configuração do SDK
   */
  validateConfig() {
    if (!this.apiKey) {
      throw new Error('ParcelToken SDK: apiKey é obrigatório');
    }
    if (!this.merchantId) {
      throw new Error('ParcelToken SDK: merchantId é obrigatório');
    }
  }

  /**
   * Cria uma transação de pagamento
   * @param {Object} transaction - Dados da transação
   * @returns {Promise}
   */
  async createTransaction(transaction) {
    try {
      const payload = {
        merchantId: this.merchantId,
        amount: transaction.amount,
        description: transaction.description,
        orderId: transaction.orderId,
        customerEmail: transaction.customerEmail,
        customerPhone: transaction.customerPhone,
        installments: transaction.installments || 1,
        paymentMethod: transaction.paymentMethod || 'parceltoken',
        metadata: transaction.metadata || {}
      };

      const response = await this.request('POST', '/transactions', payload);

      if (this.onSuccess) {
        this.onSuccess(response);
      }

      return response;
    } catch (error) {
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Obtém status de uma transação
   * @param {string} transactionId - ID da transação
   * @returns {Promise}
   */
  async getTransactionStatus(transactionId) {
    try {
      const response = await this.request('GET', `/transactions/${transactionId}`);
      
      if (this.onPaymentStatusChange) {
        this.onPaymentStatusChange(response);
      }

      return response;
    } catch (error) {
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Gera um ParcelToken para o usuário
   * @param {Object} tokenData - Dados do token
   * @returns {Promise}
   */
  async generateParcelToken(tokenData) {
    try {
      const payload = {
        customerEmail: tokenData.customerEmail,
        maxAmount: tokenData.maxAmount,
        expiresIn: tokenData.expiresIn || 30, // dias
        metadata: tokenData.metadata || {}
      };

      const response = await this.request('POST', '/tokens/generate', payload);
      return response;
    } catch (error) {
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Valida um ParcelToken
   * @param {string} tokenId - ID do token
   * @returns {Promise}
   */
  async validateParcelToken(tokenId) {
    try {
      const response = await this.request('GET', `/tokens/${tokenId}/validate`);
      return response;
    } catch (error) {
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Gera um SmartQR para pagamento
   * @param {Object} qrData - Dados do QR
   * @returns {Promise}
   */
  async generateSmartQR(qrData) {
    try {
      const payload = {
        amount: qrData.amount,
        description: qrData.description,
        orderId: qrData.orderId,
        expiresIn: qrData.expiresIn || 3600, // segundos
        metadata: qrData.metadata || {}
      };

      const response = await this.request('POST', '/qr/generate', payload);
      return response;
    } catch (error) {
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Cria um checkout embarcado
   * @param {string} containerId - ID do elemento HTML
   * @param {Object} options - Opções do checkout
   */
  createEmbeddedCheckout(containerId, options = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
      throw new Error(`Elemento com ID "${containerId}" não encontrado`);
    }

    const checkoutHTML = `
      <div class="parceltoken-checkout" style="max-width: 500px; margin: 0 auto;">
        <div class="checkout-header" style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">Checkout ParcelToken</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Parcele sem cartão de crédito</p>
        </div>
        
        <div class="checkout-body" style="padding: 20px; background: white; border: 1px solid #e0e0e0;">
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Valor da Compra</label>
            <input type="number" id="pt-amount" placeholder="R$ 0,00" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
          </div>

          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Número de Parcelas</label>
            <select id="pt-installments" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
              <option value="1">1x sem juros</option>
              <option value="2">2x sem juros</option>
              <option value="3">3x sem juros</option>
              <option value="4">4x sem juros</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Email</label>
            <input type="email" id="pt-email" placeholder="seu@email.com" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
          </div>

          <div class="form-group" style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Telefone</label>
            <input type="tel" id="pt-phone" placeholder="(11) 99999-9999" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
          </div>

          <button id="pt-submit-btn" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: 600; cursor: pointer;">
            Processar Pagamento
          </button>
        </div>

        <div id="pt-message" style="padding: 10px; margin-top: 10px; border-radius: 4px; display: none;"></div>
      </div>
    `;

    container.innerHTML = checkoutHTML;

    // Adicionar event listener ao botão
    document.getElementById('pt-submit-btn').addEventListener('click', async () => {
      const amount = parseFloat(document.getElementById('pt-amount').value);
      const installments = parseInt(document.getElementById('pt-installments').value);
      const email = document.getElementById('pt-email').value;
      const phone = document.getElementById('pt-phone').value;

      if (!amount || !email || !phone) {
        this.showMessage('Por favor, preencha todos os campos', 'error');
        return;
      }

      try {
        await this.createTransaction({
          amount,
          installments,
          customerEmail: email,
          customerPhone: phone,
          description: options.description || 'Compra ParcelToken',
          orderId: options.orderId || `order-${Date.now()}`
        });

        this.showMessage('Pagamento processado com sucesso!', 'success');
      } catch (error) {
        this.showMessage(`Erro ao processar pagamento: ${error.message}`, 'error');
      }
    });
  }

  /**
   * Exibe mensagem no checkout
   * @private
   */
  showMessage(message, type) {
    const messageEl = document.getElementById('pt-message');
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    messageEl.style.backgroundColor = type === 'error' ? '#fee' : '#efe';
    messageEl.style.color = type === 'error' ? '#c33' : '#3c3';
    messageEl.style.borderLeft = `4px solid ${type === 'error' ? '#c33' : '#3c3'}`;
  }

  /**
   * Realiza requisição HTTP
   * @private
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Merchant-ID': this.merchantId
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Obtém versão do SDK
   */
  static getVersion() {
    return '1.0.0';
  }

  /**
   * Obtém documentação
   */
  static getDocumentation() {
    return 'https://docs.parceltoken.com/sdk';
  }
}

// Exportar para uso em diferentes ambientes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParcelTokenSDK;
}

// Disponibilizar globalmente no navegador
if (typeof window !== 'undefined') {
  window.ParcelTokenSDK = ParcelTokenSDK;
}
