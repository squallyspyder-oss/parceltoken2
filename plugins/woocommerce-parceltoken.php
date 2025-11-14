<?php
/**
 * Plugin Name: ParcelToken for WooCommerce
 * Plugin URI: https://parceltoken.com
 * Description: Integre ParcelToken como método de pagamento em sua loja WooCommerce
 * Version: 1.0.0
 * Author: ParcelToken
 * Author URI: https://parceltoken.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * WC requires at least: 3.0
 * WC tested up to: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define constants
define('PARCELTOKEN_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PARCELTOKEN_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PARCELTOKEN_VERSION', '1.0.0');

// Main plugin class
class ParcelToken_WooCommerce {
    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        // Check if WooCommerce is active
        if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
            return;
        }

        // Initialize plugin
        add_action('plugins_loaded', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    public function init() {
        // Register payment gateway
        add_filter('woocommerce_payment_gateways', array($this, 'add_payment_gateway'));
        
        // Register settings
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function add_payment_gateway($gateways) {
        $gateways[] = 'WC_ParcelToken_Gateway';
        return $gateways;
    }

    public function enqueue_scripts() {
        if (is_checkout()) {
            wp_enqueue_script(
                'parceltoken-sdk',
                PARCELTOKEN_PLUGIN_URL . 'assets/js/parceltoken-sdk.js',
                array('jquery'),
                PARCELTOKEN_VERSION,
                true
            );

            wp_enqueue_style(
                'parceltoken-checkout',
                PARCELTOKEN_PLUGIN_URL . 'assets/css/checkout.css',
                array(),
                PARCELTOKEN_VERSION
            );

            wp_localize_script('parceltoken-sdk', 'parceltoken_data', array(
                'api_key' => get_option('parceltoken_api_key'),
                'merchant_id' => get_option('parceltoken_merchant_id'),
                'environment' => get_option('parceltoken_environment', 'production')
            ));
        }
    }

    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'parceltoken') !== false) {
            wp_enqueue_style(
                'parceltoken-admin',
                PARCELTOKEN_PLUGIN_URL . 'assets/css/admin.css',
                array(),
                PARCELTOKEN_VERSION
            );
        }
    }

    public function add_admin_menu() {
        add_menu_page(
            'ParcelToken',
            'ParcelToken',
            'manage_options',
            'parceltoken',
            array($this, 'settings_page'),
            PARCELTOKEN_PLUGIN_URL . 'assets/images/icon.png',
            56
        );

        add_submenu_page(
            'parceltoken',
            'Configurações',
            'Configurações',
            'manage_options',
            'parceltoken',
            array($this, 'settings_page')
        );

        add_submenu_page(
            'parceltoken',
            'Transações',
            'Transações',
            'manage_options',
            'parceltoken-transactions',
            array($this, 'transactions_page')
        );
    }

    public function register_settings() {
        register_setting('parceltoken_settings', 'parceltoken_api_key');
        register_setting('parceltoken_settings', 'parceltoken_merchant_id');
        register_setting('parceltoken_settings', 'parceltoken_environment');
        register_setting('parceltoken_settings', 'parceltoken_min_installments');
        register_setting('parceltoken_settings', 'parceltoken_max_installments');
    }

    public function settings_page() {
        ?>
        <div class="wrap parceltoken-settings">
            <h1>Configurações ParcelToken</h1>
            
            <form method="post" action="options.php">
                <?php settings_fields('parceltoken_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="parceltoken_api_key">API Key</label>
                        </th>
                        <td>
                            <input 
                                type="password" 
                                id="parceltoken_api_key" 
                                name="parceltoken_api_key" 
                                value="<?php echo esc_attr(get_option('parceltoken_api_key')); ?>"
                                class="regular-text"
                            />
                            <p class="description">Sua chave de API do ParcelToken</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="parceltoken_merchant_id">Merchant ID</label>
                        </th>
                        <td>
                            <input 
                                type="text" 
                                id="parceltoken_merchant_id" 
                                name="parceltoken_merchant_id" 
                                value="<?php echo esc_attr(get_option('parceltoken_merchant_id')); ?>"
                                class="regular-text"
                            />
                            <p class="description">Seu ID de merchant no ParcelToken</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="parceltoken_environment">Ambiente</label>
                        </th>
                        <td>
                            <select id="parceltoken_environment" name="parceltoken_environment">
                                <option value="sandbox" <?php selected(get_option('parceltoken_environment'), 'sandbox'); ?>>
                                    Sandbox (Testes)
                                </option>
                                <option value="production" <?php selected(get_option('parceltoken_environment'), 'production'); ?>>
                                    Production (Ao Vivo)
                                </option>
                            </select>
                            <p class="description">Escolha o ambiente para processar transações</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="parceltoken_min_installments">Parcelas Mínimas</label>
                        </th>
                        <td>
                            <input 
                                type="number" 
                                id="parceltoken_min_installments" 
                                name="parceltoken_min_installments" 
                                value="<?php echo esc_attr(get_option('parceltoken_min_installments', 1)); ?>"
                                min="1"
                                max="12"
                            />
                            <p class="description">Número mínimo de parcelas permitidas</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="parceltoken_max_installments">Parcelas Máximas</label>
                        </th>
                        <td>
                            <input 
                                type="number" 
                                id="parceltoken_max_installments" 
                                name="parceltoken_max_installments" 
                                value="<?php echo esc_attr(get_option('parceltoken_max_installments', 4)); ?>"
                                min="1"
                                max="12"
                            />
                            <p class="description">Número máximo de parcelas permitidas</p>
                        </td>
                    </tr>
                </table>

                <?php submit_button('Salvar Configurações'); ?>
            </form>

            <div class="parceltoken-info">
                <h2>Informações de Integração</h2>
                <p>
                    Para obter suas credenciais de API, acesse seu painel ParcelToken em 
                    <a href="https://dashboard.parceltoken.com" target="_blank">https://dashboard.parceltoken.com</a>
                </p>
            </div>
        </div>
        <?php
    }

    public function transactions_page() {
        ?>
        <div class="wrap">
            <h1>Transações ParcelToken</h1>
            <p>Histórico de transações processadas através do ParcelToken.</p>
            
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>ID da Transação</th>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Parcelas</th>
                        <th>Status</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 20px;">
                            Nenhuma transação encontrada
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <?php
    }

    public function woocommerce_missing_notice() {
        ?>
        <div class="notice notice-error is-dismissible">
            <p>
                <strong>ParcelToken for WooCommerce</strong> requer que o WooCommerce esteja instalado e ativado.
            </p>
        </div>
        <?php
    }
}

// Payment Gateway Class
class WC_ParcelToken_Gateway extends WC_Payment_Gateway {
    public function __construct() {
        $this->id = 'parceltoken';
        $this->icon = PARCELTOKEN_PLUGIN_URL . 'assets/images/logo.png';
        $this->has_fields = true;
        $this->method_title = 'ParcelToken';
        $this->method_description = 'Permita que seus clientes paguem com ParcelToken';

        $this->init_form_fields();
        $this->init_settings();

        $this->title = $this->get_option('title');
        $this->description = $this->get_option('description');

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
        add_action('wp_enqueue_scripts', array($this, 'payment_scripts'));
    }

    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title' => 'Ativar/Desativar',
                'type' => 'checkbox',
                'label' => 'Ativar ParcelToken',
                'default' => 'yes'
            ),
            'title' => array(
                'title' => 'Título',
                'type' => 'text',
                'description' => 'Título que aparecerá no checkout',
                'default' => 'ParcelToken - Parcele sem cartão',
                'desc_tip' => true,
            ),
            'description' => array(
                'title' => 'Descrição',
                'type' => 'textarea',
                'description' => 'Descrição do método de pagamento',
                'default' => 'Parcele suas compras em até 4x sem cartão de crédito',
                'desc_tip' => true,
            )
        );
    }

    public function payment_scripts() {
        if (!is_checkout()) {
            return;
        }

        wp_enqueue_script(
            'parceltoken-checkout',
            PARCELTOKEN_PLUGIN_URL . 'assets/js/checkout.js',
            array('jquery'),
            PARCELTOKEN_VERSION,
            true
        );
    }

    public function payment_fields() {
        ?>
        <div id="parceltoken-payment-fields">
            <p><?php echo esc_html($this->description); ?></p>
            
            <div class="form-row form-row-wide">
                <label for="parceltoken-installments">Número de Parcelas:</label>
                <select id="parceltoken-installments" name="parceltoken_installments">
                    <option value="1">1x sem juros</option>
                    <option value="2">2x sem juros</option>
                    <option value="3">3x sem juros</option>
                    <option value="4">4x sem juros</option>
                </select>
            </div>

            <div id="parceltoken-installment-info" style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                <small id="installment-text"></small>
            </div>
        </div>
        <?php
    }

    public function process_payment($order_id) {
        $order = wc_get_order($order_id);
        $installments = isset($_POST['parceltoken_installments']) ? intval($_POST['parceltoken_installments']) : 1;

        // Aqui você processaria o pagamento com a API do ParcelToken
        // Por enquanto, vamos simular um pagamento bem-sucedido

        $order->payment_complete();
        $order->add_order_note(sprintf('Pagamento ParcelToken processado em %d parcelas', $installments));

        WC()->cart->empty_cart();

        return array(
            'result' => 'success',
            'redirect' => $this->get_return_url($order)
        );
    }
}

// Initialize plugin
add_action('plugins_loaded', function() {
    ParcelToken_WooCommerce::get_instance();
    add_action('woocommerce_payment_gateways', function($gateways) {
        $gateways[] = 'WC_ParcelToken_Gateway';
        return $gateways;
    });
});

// Activation hook
register_activation_hook(__FILE__, function() {
    // Create tables, set default options, etc.
});

// Deactivation hook
register_deactivation_hook(__FILE__, function() {
    // Clean up
});
?>
