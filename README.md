# Advanced Code Renderer WordPress Plugin

A professional-grade WordPress plugin for rendering code blocks with syntax highlighting, line numbers, copy functionality, and multiple themes. Perfect for technical blogs, documentation sites, and solutions architecture content.

## Features

### 🚀 Core Features

- **Syntax Highlighting** - Support for 150+ programming languages via Prism.js
- **Multiple Themes** - Light and dark themes with customizable options
- **Line Numbers** - Optional line numbering for better code readability
- **Copy to Clipboard** - One-click code copying with visual feedback
- **Responsive Design** - Mobile-friendly code blocks with proper overflow handling
- **Word Wrap** - Optional word wrapping for long code lines

### 🎨 Customization

- **Custom Titles** - Add descriptive titles to code blocks
- **File Names** - Display file names for better context
- **Language Labels** - Show programming language indicators
- **Highlight Lines** - Emphasize specific lines of code
- **Font Size Control** - Adjustable font sizes (10-24px)
- **Height Limits** - Set maximum heights with scrolling

## Key Benefits for Classic Editor Users

### 🎯 **No Mode Switching Required**

- Works perfectly in Visual mode
- No need to switch to Text/HTML mode
- Paste code directly without formatting issues

### 🛡️ **Auto-Formatting Protection**

- Prevents WordPress from wrapping code in `<p>` tags
- Preserves original code formatting and indentation
- Handles line breaks correctly

### 🎨 **Visual Editor Integration**

- Dedicated toolbar button for easy insertion
- User-friendly dialog with all options
- Real-time preview in the editor

### 📝 **Smart Content Processing**

- Automatically cleans pasted content
- Removes unwanted HTML tags from code
- Preserves special characters and symbols
- **Shortcode Support** - Easy-to-use shortcodes with multiple parameters
- **Gutenberg Block** - Native WordPress block editor integration
- **Template Tags** - PHP functions for theme developers
- **Hooks & Filters** - Extensible architecture for custom modifications
- **Import/Export** - Backup and restore plugin settings

## Installation

### Method 1: WordPress Admin (Recommended)

1. Download the plugin ZIP file
2. Go to **WordPress Admin** → **Plugins** → **Add New**
3. Click **Upload Plugin** and select the ZIP file
4. Click **Install Now** and then **Activate**

### Method 2: Manual Installation

1. Extract the plugin files to `/wp-content/plugins/advanced-code-renderer/`
2. Go to **WordPress Admin** → **Plugins**
3. Find "Advanced Code Renderer" and click **Activate**

### Method 3: WP-CLI

```bash
wp plugin install advanced-code-renderer.zip --activate
```

## File Structure

```
wp-content/plugins/advanced-code-renderer/
├── advanced-code-renderer.php          # Main plugin file
├── assets/
│   ├── css/
│   │   ├── acr-styles.css              # Frontend styles (auto-generated)
│   │   └── acr-admin.css               # Admin interface styles
│   └── js/
│       ├── acr-scripts.js              # Frontend JavaScript
│       ├── acr-admin.js                # Admin JavaScript
│       └── acr-block.js                # Gutenberg block
├── languages/                          # Translation files
└── README.md                           # Documentation
```

## Quick Start

### Using Classic Editor (Visual Mode)

**The plugin works perfectly in Visual mode - no need to switch to Text mode!**

1. **Using the Code Block Button:**

   - Click the **Code Block** button in the editor toolbar (📝 icon)
   - Fill in your code and settings in the dialog
   - Click "OK" to insert

2. **Using Shortcodes Directly:**

   - Type or paste your shortcode directly in Visual mode
   - The plugin automatically handles formatting issues
   - No need to worry about paragraph tags wrapping your code

3. **Pasting Code:**
   - Paste code directly into the shortcode in Visual mode
   - The plugin automatically cleans up WordPress auto-formatting
   - Line breaks and indentation are preserved

### Using Gutenberg Block Editor

1. In the WordPress editor, click the **+** button
2. Search for "Advanced Code Block"
3. Add your code and configure options in the sidebar
4. Use the Preview/Edit toggle to see the rendered output

### Using Shortcodes

#### Basic Usage

```
[code_block lang="php"]
<?php
function hello_world() {
    echo "Hello, World!";
}
?>
[/code_block]
```

#### Advanced Usage

```
[code_block lang="javascript" title="React Component" line_numbers="true" file="MyComponent.js"]
import React, { useState } from 'react';

const MyComponent = () => {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
};

export default MyComponent;
[/code_block]
```

### Using Gutenberg Block

1. In the WordPress editor, click the **+** button
2. Search for "Advanced Code Block"
3. Add your code and configure options in the sidebar
4. Use the Preview/Edit toggle to see the rendered output

### Using Template Tags (Theme Developers)

```php
<?php
// Display a code block in your theme
the_code_block('console.log("Hello World");', 'javascript', array(
    'title' => 'JavaScript Example',
    'line_numbers' => 'true'
));

// Or get the HTML without echoing
$code_html = acr_render_code($code_content, 'python', array(
    'title' => 'Python Script',
    'file' => 'script.py'
));
?>
```

## Shortcode Parameters

| Parameter      | Type    | Default | Description                                  |
| -------------- | ------- | ------- | -------------------------------------------- |
| `lang`         | string  | `text`  | Programming language for syntax highlighting |
| `language`     | string  | -       | Alternative to `lang` parameter              |
| `title`        | string  | -       | Optional title displayed above code block    |
| `file`         | string  | -       | File name displayed below title              |
| `line_numbers` | boolean | `false` | Show line numbers                            |
| `copy`         | boolean | `true`  | Show copy button                             |
| `wrap`         | boolean | `false` | Enable word wrapping                         |
| `height`       | string  | -       | Maximum height (e.g., "300px")               |
| `highlight`    | string  | -       | Line numbers to highlight (e.g., "1,3-5,7")  |

## Supported Languages

The plugin supports 150+ programming languages including:

**Popular Languages:**

- HTML, CSS, JavaScript, TypeScript
- PHP, Python, Ruby, Java, C++, C#
- Go, Rust, Swift, Kotlin, Dart
- SQL, JSON, XML, YAML, Markdown

**Frameworks & Tools:**

- React JSX, Vue, Angular
- Docker, NGINX, Apache
- Shell/Bash, PowerShell
- Git, SVN

**And many more via Prism.js autoloader!**

## Configuration

### Plugin Settings

Navigate to **WordPress Admin** → **Settings** → **Code Renderer**

#### General Settings

- **Color Theme**: Choose between light and dark themes
- **Show Line Numbers**: Default line number display
- **Show Copy Button**: Default copy button visibility
- **Enable Word Wrap**: Default word wrapping behavior
- **Font Size**: Code font size in pixels (10-24px)
- **Show Language Label**: Display language indicators

### Import/Export Settings

The plugin includes settings backup functionality:

1. **Export**: Download current settings as JSON
2. **Import**: Upload previously exported settings
3. **Reset**: Restore default plugin settings

## Customization

### CSS Customization

Override plugin styles in your theme's CSS:

```css
/* Customize code block appearance */
.acr-code-block {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Custom title styling */
.acr-code-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .acr-code-block code {
    font-size: 12px !important;
  }
}
```

### Hook Examples

```php
// Modify code block HTML structure
add_filter('acr_code_block_html', function($html, $attributes, $content) {
    // Add custom wrapper
    return '<div class="my-custom-wrapper">' . $html . '</div>';
}, 10, 3);

// Add custom language support
add_filter('acr_language_options', function($languages) {
    $languages['custom'] = 'My Custom Language';
    return $languages;
});

// Customize Prism.js configuration
add_action('acr_before_prism_init', function() {
    echo '<script>window.Prism = window.Prism || {}; Prism.manual = true;</script>';
});
```

## Performance Optimization

### Best Practices

1. **Use CDN**: The plugin uses Prism.js from cdnjs for optimal loading
2. **Lazy Loading**: Large code blocks are highlighted on scroll
3. **Minimal Assets**: Only loads required CSS/JS based on settings
4. **Caching**: Works with all major caching plugins

### Performance Settings

```php
// Disable autoloader for custom language loading
add_filter('acr_use_autoloader', '__return_false');

// Custom language loading
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_script('prism-php',
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-php.min.js',
        array('prism-core')
    );
});
```

## Troubleshooting

### Common Issues

#### Syntax Highlighting Not Working

1. Check browser console for JavaScript errors
2. Verify language name is correct (use lowercase)
3. Ensure Prism.js files are loading properly

#### Copy Button Not Appearing

1. Check if "Show Copy Button" is enabled in settings
2. Verify toolbar plugin is loading
3. Test with default theme to rule out conflicts

#### Styling Issues

1. Check for theme CSS conflicts
2. Verify plugin CSS files are loading
3. Use browser developer tools to inspect elements

### Debug Mode

Enable WordPress debug mode to troubleshoot:

```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

## Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile**: iOS 12+, Android 7+

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Issues**: Report bugs and feature requests via GitHub issues
2. **Pull Requests**: Fork the repository and submit PRs for review
3. **Coding Standards**: Follow WordPress coding standards
4. **Testing**: Test across multiple browsers and WordPress versions

### Development Setup

```bash
# Clone repository
git clone https://github.com/imajs7/advanced-code-renderer.git

# Install dependencies
npm install

# Build assets
npm run build

# Development watch
npm run watch
```

## Changelog

### Version 1.0.0

- Initial release
- Shortcode support with 10+ parameters
- Gutenberg block integration
- Settings page with import/export
- 150+ language support via Prism.js
- Responsive design with mobile optimization
- Copy to clipboard functionality
- Line numbers and syntax highlighting
- Multiple themes (light/dark)

## Support

- **Documentation**: Full documentation available in plugin admin
- **Community**: WordPress.org support forums
- **Premium Support**: Available for custom implementations

## License

This plugin is licensed under the GPL v2 or later.

```
Copyright (C) 2024 Advanced Code Renderer

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
```

---

**Advanced Code Renderer** - Professional code rendering for WordPress
Version 1.0.0 | Tested up to WordPress 6.3 | Requires PHP 7.4+
