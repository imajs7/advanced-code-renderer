/**
 * Advanced Code Renderer Gutenberg Block
 */
(function () {
  "use strict";

  const { blocks, element, editor, components, i18n } = wp;
  const { registerBlockType } = blocks;
  const { createElement: el, Component, Fragment } = element;
  const { InspectorControls, PlainText } = editor;
  const { PanelBody, SelectControl, TextControl, ToggleControl, RangeControl } =
    components;
  const { __ } = i18n;

  // Language options for the dropdown
  const LANGUAGE_OPTIONS = [
    { label: __("Plain Text", "advanced-code-renderer"), value: "text" },
    { label: __("HTML", "advanced-code-renderer"), value: "html" },
    { label: __("CSS", "advanced-code-renderer"), value: "css" },
    { label: __("JavaScript", "advanced-code-renderer"), value: "javascript" },
    { label: __("PHP", "advanced-code-renderer"), value: "php" },
    { label: __("Python", "advanced-code-renderer"), value: "python" },
    { label: __("Java", "advanced-code-renderer"), value: "java" },
    { label: __("C++", "advanced-code-renderer"), value: "cpp" },
    { label: __("C#", "advanced-code-renderer"), value: "csharp" },
    { label: __("Ruby", "advanced-code-renderer"), value: "ruby" },
    { label: __("Go", "advanced-code-renderer"), value: "go" },
    { label: __("Rust", "advanced-code-renderer"), value: "rust" },
    { label: __("SQL", "advanced-code-renderer"), value: "sql" },
    { label: __("JSON", "advanced-code-renderer"), value: "json" },
    { label: __("XML", "advanced-code-renderer"), value: "xml" },
    { label: __("YAML", "advanced-code-renderer"), value: "yaml" },
    { label: __("Markdown", "advanced-code-renderer"), value: "markdown" },
    { label: __("Shell/Bash", "advanced-code-renderer"), value: "bash" },
    { label: __("PowerShell", "advanced-code-renderer"), value: "powershell" },
    { label: __("TypeScript", "advanced-code-renderer"), value: "typescript" },
    { label: __("Swift", "advanced-code-renderer"), value: "swift" },
    { label: __("Kotlin", "advanced-code-renderer"), value: "kotlin" },
    { label: __("Dart", "advanced-code-renderer"), value: "dart" },
    { label: __("Docker", "advanced-code-renderer"), value: "docker" },
    { label: __("NGINX", "advanced-code-renderer"), value: "nginx" },
  ];

  /**
   * Advanced Code Renderer Block Component
   */
  class ACRBlock extends Component {
    constructor(props) {
      super(props);
      this.state = {
        isPreviewMode: false,
      };
    }

    render() {
      const { attributes, setAttributes, isSelected } = this.props;
      const {
        content = "",
        language = "text",
        title = "",
        lineNumbers = false,
        copyButton = true,
        wordWrap = false,
        fileName = "",
        highlightLines = "",
      } = attributes;

      // Update attributes helper
      const updateAttribute = (key, value) => {
        setAttributes({ [key]: value });
      };

      // Inspector Controls (Sidebar)
      const inspectorControls = el(
        InspectorControls,
        {},
        el(
          PanelBody,
          {
            title: __("Code Settings", "advanced-code-renderer"),
            initialOpen: true,
          },
          el(SelectControl, {
            label: __("Language", "advanced-code-renderer"),
            value: language,
            options: LANGUAGE_OPTIONS,
            onChange: (value) => updateAttribute("language", value),
          }),
          el(TextControl, {
            label: __("Title", "advanced-code-renderer"),
            value: title,
            onChange: (value) => updateAttribute("title", value),
            placeholder: __(
              "Optional code block title",
              "advanced-code-renderer"
            ),
          }),
          el(TextControl, {
            label: __("File Name", "advanced-code-renderer"),
            value: fileName,
            onChange: (value) => updateAttribute("fileName", value),
            placeholder: __("e.g., script.js", "advanced-code-renderer"),
          })
        ),
        el(
          PanelBody,
          {
            title: __("Display Options", "advanced-code-renderer"),
            initialOpen: false,
          },
          el(ToggleControl, {
            label: __("Show Line Numbers", "advanced-code-renderer"),
            checked: lineNumbers,
            onChange: (value) => updateAttribute("lineNumbers", value),
          }),
          el(ToggleControl, {
            label: __("Show Copy Button", "advanced-code-renderer"),
            checked: copyButton,
            onChange: (value) => updateAttribute("copyButton", value),
          }),
          el(ToggleControl, {
            label: __("Enable Word Wrap", "advanced-code-renderer"),
            checked: wordWrap,
            onChange: (value) => updateAttribute("wordWrap", value),
          }),
          el(TextControl, {
            label: __("Highlight Lines", "advanced-code-renderer"),
            value: highlightLines,
            onChange: (value) => updateAttribute("highlightLines", value),
            placeholder: __("e.g., 1,3-5,7", "advanced-code-renderer"),
            help: __(
              "Specify line numbers to highlight (comma-separated, ranges with dashes)",
              "advanced-code-renderer"
            ),
          })
        )
      );

      // Editor view
      const editorView = el(
        "div",
        {
          className: "acr-block-editor",
        },
        el(
          "div",
          {
            className: "acr-block-header",
          },
          el(
            "div",
            {
              className: "acr-block-language-indicator",
            },
            language.toUpperCase()
          ),
          title &&
            el(
              "div",
              {
                className: "acr-block-title",
              },
              title
            ),
          el(
            "div",
            {
              className: "acr-block-controls",
            },
            el(
              "button",
              {
                className: "acr-preview-toggle",
                onClick: () =>
                  this.setState({ isPreviewMode: !this.state.isPreviewMode }),
              },
              this.state.isPreviewMode
                ? __("Edit", "advanced-code-renderer")
                : __("Preview", "advanced-code-renderer")
            )
          )
        ),
        this.state.isPreviewMode ? this.renderPreview() : this.renderEditor()
      );

      return el(Fragment, {}, inspectorControls, editorView);
    }

    renderEditor() {
      const { attributes, setAttributes } = this.props;
      const { content = "" } = attributes;

      return el(
        "div",
        {
          className: "acr-code-editor-wrapper",
        },
        el(PlainText, {
          value: content,
          onChange: (value) => setAttributes({ content: value }),
          placeholder: __("Enter your code here...", "advanced-code-renderer"),
          className: "acr-code-editor",
        })
      );
    }

    renderPreview() {
      const { attributes } = this.props;
      const {
        content = "",
        language = "text",
        title = "",
        lineNumbers = false,
        fileName = "",
        highlightLines = "",
      } = attributes;

      // Build shortcode attributes
      let shortcodeAtts = `lang="${language}"`;
      if (title) shortcodeAtts += ` title="${title}"`;
      if (fileName) shortcodeAtts += ` file="${fileName}"`;
      if (lineNumbers) shortcodeAtts += ' line_numbers="true"';
      if (highlightLines) shortcodeAtts += ` highlight="${highlightLines}"`;

      return el(
        "div",
        {
          className: "acr-preview-wrapper",
          dangerouslySetInnerHTML: {
            __html: `<div class="acr-code-block">
                            ${
                              title
                                ? `<div class="acr-code-title">${title}</div>`
                                : ""
                            }
                            ${
                              fileName
                                ? `<div class="acr-file-name">${fileName}</div>`
                                : ""
                            }
                            <pre class="language-${language}${
              lineNumbers ? " line-numbers" : ""
            }"><code>${this.escapeHtml(content)}</code></pre>
                        </div>`,
          },
        },
        el(
          "div",
          {
            className: "acr-preview-note",
          },
          __(
            "This is a preview. Syntax highlighting will be applied on the frontend.",
            "advanced-code-renderer"
          )
        )
      );
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  /**
   * Register the block
   */
  registerBlockType("acr/code-block", {
    title: __("Advanced Code Block", "advanced-code-renderer"),
    description: __(
      "Display code with syntax highlighting, line numbers, and copy functionality.",
      "advanced-code-renderer"
    ),
    icon: "editor-code",
    category: "formatting",
    keywords: [
      __("code", "advanced-code-renderer"),
      __("syntax", "advanced-code-renderer"),
      __("programming", "advanced-code-renderer"),
    ],
    attributes: {
      content: {
        type: "string",
        default: "",
      },
      language: {
        type: "string",
        default: "text",
      },
      title: {
        type: "string",
        default: "",
      },
      lineNumbers: {
        type: "boolean",
        default: false,
      },
      copyButton: {
        type: "boolean",
        default: true,
      },
      wordWrap: {
        type: "boolean",
        default: false,
      },
      fileName: {
        type: "string",
        default: "",
      },
      highlightLines: {
        type: "string",
        default: "",
      },
    },
    supports: {
      align: ["wide", "full"],
      anchor: true,
      customClassName: true,
    },
    edit: ACRBlock,
    save: function (props) {
      // Return null to use PHP render_callback
      return null;
    },
    transforms: {
      from: [
        {
          type: "block",
          blocks: ["core/code"],
          transform: function (attributes) {
            return wp.blocks.createBlock("acr/code-block", {
              content: attributes.content,
              language: "text",
            });
          },
        },
        {
          type: "block",
          blocks: ["core/preformatted"],
          transform: function (attributes) {
            return wp.blocks.createBlock("acr/code-block", {
              content: attributes.content,
              language: "text",
            });
          },
        },
      ],
      to: [
        {
          type: "block",
          blocks: ["core/code"],
          transform: function (attributes) {
            return wp.blocks.createBlock("core/code", {
              content: attributes.content,
            });
          },
        },
      ],
    },
    example: {
      attributes: {
        content:
          'function helloWorld() {\n    console.log("Hello, World!");\n    return true;\n}',
        language: "javascript",
        title: "Hello World Example",
        lineNumbers: true,
      },
    },
  });

  // Add custom styles for the block editor
  const blockEditorStyles = `
        .acr-block-editor {
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
        }

        .acr-block-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            font-size: 13px;
        }

        .acr-block-language-indicator {
            background: #007cba;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
        }

        .acr-block-title {
            font-weight: 600;
            color: #333;
        }

        .acr-preview-toggle {
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 3px;
            padding: 4px 8px;
            font-size: 12px;
            cursor: pointer;
        }

        .acr-preview-toggle:hover {
            background: #e0e0e0;
        }

        .acr-code-editor-wrapper {
            position: relative;
        }

        .acr-code-editor {
            width: 100% !important;
            min-height: 150px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            padding: 16px !important;
            border: none !important;
            outline: none !important;
            background: #fafafa !important;
            resize: vertical;
        }

        .acr-preview-wrapper {
            min-height: 150px;
            padding: 16px;
            background: #fafafa;
        }

        .acr-preview-note {
            margin-top: 10px;
            padding: 8px;
            background: #e7f3ff;
            border-left: 4px solid #007cba;
            font-size: 12px;
            color: #555;
        }

        .acr-code-block .acr-code-title {
            background: #f1f3f4;
            padding: 8px 12px;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid #e8eaed;
        }

        .acr-code-block .acr-file-name {
            background: #e8f0fe;
            padding: 6px 12px;
            font-size: 12px;
            color: #1967d2;
            font-family: monospace;
        }

        .acr-code-block pre {
            margin: 0;
            padding: 16px;
            background: #f8f9fa;
            overflow-x: auto;
        }

        .acr-code-block code {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
        }
    `;

  // Inject styles into the editor
  if (typeof window !== "undefined" && window.document) {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = blockEditorStyles;
    document.head.appendChild(styleSheet);
  }
})();
