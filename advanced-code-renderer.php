<?php
/**
 * Plugin Name: Advanced Code Renderer
 * Plugin URI: https://github.com/imaj7/advanced-code-renderer
 * Description: A professional code rendering plugin with syntax highlighting, line numbers, copy functionality, and multiple themes for WordPress posts and pages.
 * Version: 1.0.0
 * Author: Anurag Jaisingh
 * Author URI: https://linkedin.com/imajs7
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: advanced-code-renderer
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.3
 * Requires PHP: 7.4
 * Network: false
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('ACR_VERSION', '1.0.0');
define('ACR_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ACR_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('ACR_PLUGIN_FILE', __FILE__);

/**
 * Main Advanced Code Renderer Class
 */
class AdvancedCodeRenderer {
    
    private static $instance = null;
    private $options;

    /**
     * Singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->options = get_option('acr_options', $this->getDefaultOptions());
        $this->init();
    }

    /**
     * Initialize plugin
     */
    private function init() {
        add_action('init', array($this, 'loadTextDomain'));
        add_action('wp_enqueue_scripts', array($this, 'enqueueAssets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueueAdminAssets'));
        add_shortcode('code_block', array($this, 'codeBlockShortcode'));
        add_shortcode('acr_code', array($this, 'codeBlockShortcode')); // Alternative shortcode
        
        // Simple content filtering for classic editor
        add_filter('the_content', array($this, 'fixShortcodeParagraphs'), 8);
        
        // Admin hooks
        if (is_admin()) {
            add_action('admin_menu', array($this, 'addAdminMenu'));
            add_action('admin_init', array($this, 'registerSettings'));
            add_filter('plugin_action_links_' . plugin_basename(ACR_PLUGIN_FILE), array($this, 'addPluginActionLinks'));
        }

        // Gutenberg block support
        add_action('init', array($this, 'registerGutenbergBlock'));
        
        // Classic Editor Support
        add_action('admin_init', array($this, 'addTinyMCEPlugin'));
        
        // Activation/Deactivation hooks
        register_activation_hook(ACR_PLUGIN_FILE, array($this, 'activate'));
        register_deactivation_hook(ACR_PLUGIN_FILE, array($this, 'deactivate'));
    }

    /**
     * Load text domain for translations
     */
    public function loadTextDomain() {
        load_plugin_textdomain('advanced-code-renderer', false, dirname(plugin_basename(ACR_PLUGIN_FILE)) . '/languages');
    }

    /**
     * Get default options
     */
    private function getDefaultOptions() {
        return array(
            'theme' => 'default',
            'line_numbers' => false,
            'copy_button' => true,
            'word_wrap' => false,
            'font_size' => '14',
            'tab_size' => '4',
            'show_language' => true,
            'toolbar' => true
        );
    }

    /**
     * Simple fix for paragraphs around shortcodes
     */
    public function fixShortcodeParagraphs($content) {
        // Remove p tags around our shortcodes
        $content = preg_replace('/<p>\s*(\[(?:code_block|acr_code)[^\]]*\][\s\S]*?\[\/(?:code_block|acr_code)\])\s*<\/p>/', '$1', $content);
        return $content;
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueueAssets() {
        // Prism.js CSS
        $theme = $this->options['theme'];
        $prism_theme = $theme === 'dark' ? 'prism-tomorrow' : 'prism';
        
        wp_enqueue_style(
            'prism-css',
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/{$prism_theme}.min.css",
            array(),
            ACR_VERSION
        );

        // Line numbers CSS
        if ($this->options['line_numbers']) {
            wp_enqueue_style(
                'prism-line-numbers-css',
                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css',
                array('prism-css'),
                ACR_VERSION
            );
        }

        // Toolbar CSS
        if ($this->options['toolbar']) {
            wp_enqueue_style(
                'prism-toolbar-css',
                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css',
                array('prism-css'),
                ACR_VERSION
            );
        }

        // Custom CSS
        $this->addInlineCSS();

        // Prism.js Core
        wp_enqueue_script(
            'prism-core',
            'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js',
            array(),
            ACR_VERSION,
            true
        );

        // Prism.js Autoloader
        wp_enqueue_script(
            'prism-autoloader',
            'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js',
            array('prism-core'),
            ACR_VERSION,
            true
        );

        // Line numbers script
        if ($this->options['line_numbers']) {
            wp_enqueue_script(
                'prism-line-numbers',
                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js',
                array('prism-core'),
                ACR_VERSION,
                true
            );
        }

        // Toolbar script
        if ($this->options['toolbar']) {
            wp_enqueue_script(
                'prism-toolbar',
                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js',
                array('prism-core'),
                ACR_VERSION,
                true
            );
        }

        // Copy to clipboard
        if ($this->options['copy_button']) {
            wp_enqueue_script(
                'prism-copy-clipboard',
                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
                array('prism-toolbar'),
                ACR_VERSION,
                true
            );
        }
    }

    /**
     * Add inline CSS
     */
    private function addInlineCSS() {
        $css = '
        .acr-code-block {
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e1e5e9;
            background: #f8f9fa;
            position: relative;
        }

        .acr-code-title {
            background: #f1f3f4;
            padding: 12px 16px;
            font-weight: 600;
            font-size: 14px;
            color: #202124;
            border-bottom: 1px solid #e8eaed;
        }

        .acr-file-name {
            background: #e8f0fe;
            padding: 8px 16px;
            font-size: 13px;
            color: #1967d2;
            font-family: monospace;
            border-bottom: 1px solid #dadce0;
        }

        .acr-language-label {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            z-index: 10;
        }

        .acr-code-block pre {
            margin: 0 !important;
            padding: 20px 16px !important;
            overflow-x: auto;
            background: #f8f9fa !important;
            line-height: 1.6;
        }

        .acr-code-block code {
            font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Consolas", "Courier New", monospace !important;
            font-size: ' . $this->options['font_size'] . 'px !important;
            background: none !important;
            padding: 0 !important;
        }

        .acr-word-wrap pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        @media (max-width: 768px) {
            .acr-code-block {
                margin: 15px -10px;
                border-radius: 0;
                border-left: none;
                border-right: none;
            }
            
            .acr-code-block pre {
                padding: 15px 10px !important;
            }
            
            .acr-code-block code {
                font-size: 13px !important;
            }
        }
        ';
        
        wp_add_inline_style('prism-css', $css);
    }

    /**
     * Enqueue admin assets
     */
    public function enqueueAdminAssets($hook) {
        // Always enqueue on post edit screens for TinyMCE
        if (in_array($hook, array('post.php', 'post-new.php', 'page.php', 'page-new.php'))) {
            // Add styles for admin
            wp_add_inline_style('wp-admin', '
                .mce-i-code:before {
                    content: "\f475";
                    font-family: dashicons;
                }
                .acr-code-button {
                    background-image: none !important;
                }
            ');
        }

        if ($hook !== 'settings_page_advanced-code-renderer') {
            return;
        }

        // Add admin styles inline
        wp_add_inline_style('wp-admin', '
            .acr-admin-wrap { max-width: 1200px; }
            .acr-admin-content { display: flex; gap: 30px; margin-top: 20px; }
            .acr-main-content { flex: 2; }
            .acr-sidebar { flex: 1; max-width: 300px; }
            .acr-sidebar-box { background: #fff; border: 1px solid #c3c4c7; border-radius: 4px; padding: 20px; margin-bottom: 20px; }
            .acr-sidebar-box h3 { margin-top: 0; margin-bottom: 15px; color: #23282d; font-size: 16px; }
            .acr-usage-examples code { display: block; background: #f6f7f7; padding: 10px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px; margin-bottom: 15px; word-wrap: break-word; }
        ');
    }

    /**
     * Code block shortcode handler
     */
    public function codeBlockShortcode($atts, $content = null) {
        if (empty($content)) {
            return '';
        }

        $atts = shortcode_atts(array(
            'lang' => 'text',
            'language' => '', // Alternative parameter
            'title' => '',
            'line_numbers' => $this->options['line_numbers'] ? 'true' : 'false',
            'copy' => $this->options['copy_button'] ? 'true' : 'false',
            'wrap' => $this->options['word_wrap'] ? 'true' : 'false',
            'height' => '',
            'file' => '',
            'highlight' => ''
        ), $atts, 'code_block');

        // Use language parameter if provided
        if (!empty($atts['language'])) {
            $atts['lang'] = $atts['language'];
        }

        // Clean content - only basic cleaning
        $content = trim($content);
        
        // Only clean if we detect HTML tags (from classic editor)
        if (preg_match('/<[^>]+>/', $content)) {
            $content = preg_replace('/<p\s*>/i', '', $content);
            $content = preg_replace('/<\/p>/i', "\n", $content);
            $content = preg_replace('/<br\s*\/?>/i', "\n", $content);
            $content = str_replace('&nbsp;', ' ', $content);
            $content = trim($content);
        }

        // Build CSS classes
        $classes = array('acr-code-block');
        $pre_classes = array("language-{$atts['lang']}");
        
        if ($atts['line_numbers'] === 'true') {
            $pre_classes[] = 'line-numbers';
        }
        
        if ($atts['wrap'] === 'true') {
            $classes[] = 'acr-word-wrap';
        }

        // Build data attributes
        $data_attrs = array();
        if (!empty($atts['highlight'])) {
            $data_attrs[] = 'data-line="' . esc_attr($atts['highlight']) . '"';
        }

        // Generate components
        $title_html = '';
        if (!empty($atts['title'])) {
            $title_html = '<div class="acr-code-title">' . esc_html($atts['title']) . '</div>';
        }

        $file_html = '';
        if (!empty($atts['file'])) {
            $file_html = '<div class="acr-file-name">' . esc_html($atts['file']) . '</div>';
        }

        $language_label = '';
        if ($this->options['show_language'] && $atts['lang'] !== 'text') {
            $language_label = '<span class="acr-language-label">' . esc_html(strtoupper($atts['lang'])) . '</span>';
        }

        // Custom height
        $style = '';
        if (!empty($atts['height'])) {
            $style = ' style="max-height: ' . esc_attr($atts['height']) . '; overflow-y: auto;"';
        }

        // Build HTML structure
        $html = sprintf(
            '<div class="%s">%s%s%s<pre class="%s"%s%s><code>%s</code></pre></div>',
            esc_attr(implode(' ', $classes)),
            $title_html,
            $file_html,
            $language_label,
            esc_attr(implode(' ', $pre_classes)),
            $style,
            !empty($data_attrs) ? ' ' . implode(' ', $data_attrs) : '',
            esc_html($content)
        );

        return $html;
    }

    /**
     * Add TinyMCE plugin for classic editor
     */
    public function addTinyMCEPlugin() {
        // Only add to post edit screens
        if (!current_user_can('edit_posts') && !current_user_can('edit_pages')) {
            return;
        }

        // Add only if the user can edit in rich mode
        if (get_user_option('rich_editing') === 'true') {
            add_filter('mce_external_plugins', array($this, 'addTinyMCEScript'));
            add_filter('mce_buttons', array($this, 'addTinyMCEButton'));
        }
    }

    /**
     * Add TinyMCE button to toolbar
     */
    public function addTinyMCEButton($buttons) {
        array_push($buttons, 'acr_code_block');
        return $buttons;
    }

    /**
     * Add TinyMCE script
     */
    public function addTinyMCEScript($plugins) {
        $plugins['acr_code_block'] = ACR_PLUGIN_URL . 'assets/js/acr-tinymce.js';
        return $plugins;
    }

    /**
     * Register Gutenberg block
     */
    public function registerGutenbergBlock() {
        if (!function_exists('register_block_type')) {
            return;
        }

        wp_register_script(
            'acr-block-editor',
            ACR_PLUGIN_URL . 'assets/js/acr-block.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
            ACR_VERSION
        );

        register_block_type('acr/code-block', array(
            'editor_script' => 'acr-block-editor',
            'render_callback' => array($this, 'renderGutenbergBlock')
        ));
    }

    /**
     * Render Gutenberg block
     */
    public function renderGutenbergBlock($attributes, $content) {
        $shortcode_atts = '';
        foreach ($attributes as $key => $value) {
            if ($key !== 'content') {
                $shortcode_atts .= ' ' . $key . '="' . esc_attr($value) . '"';
            }
        }

        $shortcode = '[code_block' . $shortcode_atts . ']' . $attributes['content'] . '[/code_block]';
        return do_shortcode($shortcode);
    }

    /**
     * Add admin menu
     */
    public function addAdminMenu() {
        add_options_page(
            __('Advanced Code Renderer', 'advanced-code-renderer'),
            __('Code Renderer', 'advanced-code-renderer'),
            'manage_options',
            'advanced-code-renderer',
            array($this, 'adminPage')
        );
    }

    /**
     * Register settings
     */
    public function registerSettings() {
        register_setting(
            'acr_settings_group',
            'acr_options',
            array($this, 'sanitizeOptions')
        );

        add_settings_section(
            'acr_general_section',
            __('General Settings', 'advanced-code-renderer'),
            array($this, 'generalSectionCallback'),
            'advanced-code-renderer'
        );

        // Theme setting
        add_settings_field(
            'theme',
            __('Color Theme', 'advanced-code-renderer'),
            array($this, 'themeFieldCallback'),
            'advanced-code-renderer',
            'acr_general_section'
        );

        // Line numbers setting
        add_settings_field(
            'line_numbers',
            __('Show Line Numbers', 'advanced-code-renderer'),
            array($this, 'checkboxFieldCallback'),
            'advanced-code-renderer',
            'acr_general_section',
            array('field' => 'line_numbers')
        );

        // Copy button setting
        add_settings_field(
            'copy_button',
            __('Show Copy Button', 'advanced-code-renderer'),
            array($this, 'checkboxFieldCallback'),
            'advanced-code-renderer',
            'acr_general_section',
            array('field' => 'copy_button')
        );

        // Word wrap setting
        add_settings_field(
            'word_wrap',
            __('Enable Word Wrap', 'advanced-code-renderer'),
            array($this, 'checkboxFieldCallback'),
            'advanced-code-renderer',
            'acr_general_section',
            array('field' => 'word_wrap')
        );

        // Font size setting
        add_settings_field(
            'font_size',
            __('Font Size (px)', 'advanced-code-renderer'),
            array($this, 'numberFieldCallback'),
            'advanced-code-renderer',
            'acr_general_section',
            array('field' => 'font_size', 'min' => 10, 'max' => 24)
        );

        // Show language setting
        add_settings_field(
            'show_language',
            __('Show Language Label', 'advanced-code-renderer'),
            array($this, 'checkboxFieldCallback'),
            'advanced-code-renderer',
            'acr_general_section',
            array('field' => 'show_language')
        );
    }

    /**
     * Sanitize options
     */
    public function sanitizeOptions($options) {
        $sanitized = array();
        
        $sanitized['theme'] = sanitize_text_field($options['theme']);
        $sanitized['line_numbers'] = isset($options['line_numbers']) ? true : false;
        $sanitized['copy_button'] = isset($options['copy_button']) ? true : false;
        $sanitized['word_wrap'] = isset($options['word_wrap']) ? true : false;
        $sanitized['font_size'] = absint($options['font_size']);
        $sanitized['show_language'] = isset($options['show_language']) ? true : false;
        $sanitized['toolbar'] = isset($options['toolbar']) ? true : false;

        return $sanitized;
    }

    /**
     * Admin page
     */
    public function adminPage() {
        ?>
        <div class="wrap acr-admin-wrap">
            <h1><?php _e('Advanced Code Renderer Settings', 'advanced-code-renderer'); ?></h1>
            
            <div class="acr-admin-content">
                <div class="acr-main-content">
                    <form method="post" action="options.php">
                        <?php
                        settings_fields('acr_settings_group');
                        do_settings_sections('advanced-code-renderer');
                        submit_button();
                        ?>
                    </form>
                </div>
                
                <div class="acr-sidebar">
                    <div class="acr-sidebar-box">
                        <h3><?php _e('Usage Examples', 'advanced-code-renderer'); ?></h3>
                        <div class="acr-usage-examples">
                            <h4><?php _e('Basic Usage:', 'advanced-code-renderer'); ?></h4>
                            <code>[code_block lang="php"]<?php echo 'Hello World'; ?>[/code_block]</code>
                            
                            <h4><?php _e('With Title:', 'advanced-code-renderer'); ?></h4>
                            <code>[code_block lang="javascript" title="My Function"]console.log('Hello');[/code_block]</code>
                            
                            <h4><?php _e('With Line Numbers:', 'advanced-code-renderer'); ?></h4>
                            <code>[code_block lang="css" line_numbers="true"].my-class { color: red; }[/code_block]</code>
                        </div>
                    </div>
                    
                    <div class="acr-sidebar-box">
                        <h3><?php _e('Supported Languages', 'advanced-code-renderer'); ?></h3>
                        <p><?php _e('HTML, CSS, JavaScript, PHP, Python, Java, C++, SQL, JSON, XML, and 150+ more languages supported by Prism.js', 'advanced-code-renderer'); ?></p>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * General section callback
     */
    public function generalSectionCallback() {
        echo '<p>' . __('Configure the default settings for code blocks.', 'advanced-code-renderer') . '</p>';
    }

    /**
     * Theme field callback
     */
    public function themeFieldCallback() {
        $value = $this->options['theme'];
        ?>
        <select name="acr_options[theme]">
            <option value="default" <?php selected($value, 'default'); ?>><?php _e('Default Light', 'advanced-code-renderer'); ?></option>
            <option value="dark" <?php selected($value, 'dark'); ?>><?php _e('Dark', 'advanced-code-renderer'); ?></option>
        </select>
        <?php
    }

    /**
     * Checkbox field callback
     */
    public function checkboxFieldCallback($args) {
        $field = $args['field'];
        $value = $this->options[$field];
        ?>
        <input type="checkbox" name="acr_options[<?php echo $field; ?>]" value="1" <?php checked($value, true); ?> />
        <?php
    }

    /**
     * Number field callback
     */
    public function numberFieldCallback($args) {
        $field = $args['field'];
        $value = $this->options[$field];
        $min = isset($args['min']) ? $args['min'] : 1;
        $max = isset($args['max']) ? $args['max'] : 100;
        ?>
        <input type="number" name="acr_options[<?php echo $field; ?>]" value="<?php echo esc_attr($value); ?>" min="<?php echo $min; ?>" max="<?php echo $max; ?>" />
        <?php
    }

    /**
     * Add plugin action links
     */
    public function addPluginActionLinks($links) {
        $settings_link = '<a href="' . admin_url('options-general.php?page=advanced-code-renderer') . '">' . __('Settings', 'advanced-code-renderer') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options
        if (!get_option('acr_options')) {
            update_option('acr_options', $this->getDefaultOptions());
        }
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clean up if needed
        flush_rewrite_rules();
    }
}

// Initialize the plugin
function acr_init() {
    return AdvancedCodeRenderer::getInstance();
}

// Start the plugin
add_action('plugins_loaded', 'acr_init');

// Additional helper functions for theme developers
if (!function_exists('acr_render_code')) {
    /**
     * Helper function to render code blocks programmatically
     */
    function acr_render_code($code, $language = 'text', $args = array()) {
        $default_args = array(
            'title' => '',
            'line_numbers' => 'false',
            'copy' => 'true'
        );
        
        $args = wp_parse_args($args, $default_args);
        $atts_string = '';
        
        foreach ($args as $key => $value) {
            $atts_string .= " {$key}=\"{$value}\"";
        }
        
        $shortcode = "[code_block lang=\"{$language}\"{$atts_string}]{$code}[/code_block]";
        return do_shortcode($shortcode);
    }
}

// Template tag for theme developers
if (!function_exists('the_code_block')) {
    /**
     * Template tag to display code blocks in themes
     */
    function the_code_block($code, $language = 'text', $args = array()) {
        echo acr_render_code($code, $language, $args);
    }
}
?>