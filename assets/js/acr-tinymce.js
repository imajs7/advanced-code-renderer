/**
 * Advanced Code Renderer TinyMCE Plugin
 * Handles code block insertion and formatting in WordPress Classic Editor
 */
(function () {
  "use strict";

  // Language options for the dropdown
  var LANGUAGE_OPTIONS = [
    { text: "Plain Text", value: "text" },
    { text: "HTML", value: "html" },
    { text: "CSS", value: "css" },
    { text: "JavaScript", value: "javascript" },
    { text: "PHP", value: "php" },
    { text: "Python", value: "python" },
    { text: "Java", value: "java" },
    { text: "C++", value: "cpp" },
    { text: "C#", value: "csharp" },
    { text: "Ruby", value: "ruby" },
    { text: "Go", value: "go" },
    { text: "Rust", value: "rust" },
    { text: "SQL", value: "sql" },
    { text: "JSON", value: "json" },
    { text: "XML", value: "xml" },
    { text: "YAML", value: "yaml" },
    { text: "Markdown", value: "markdown" },
    { text: "Shell/Bash", value: "bash" },
    { text: "PowerShell", value: "powershell" },
    { text: "TypeScript", value: "typescript" },
    { text: "Swift", value: "swift" },
    { text: "Kotlin", value: "kotlin" },
    { text: "Docker", value: "docker" },
  ];

  tinymce.create("tinymce.plugins.ACRCodeBlock", {
    /**
     * Initialize the plugin
     */
    init: function (ed, url) {
      var self = this;
      this.editor = ed;
      this.url = url;

      // Add the code block button
      ed.addButton("acr_code_block", {
        title: "Insert Code Block",
        cmd: "acr_insert_code_block",
        icon: "code",
        classes: "widget btn acr-code-button",
      });

      // Add command for inserting code block
      ed.addCommand("acr_insert_code_block", function () {
        self.showCodeBlockDialog();
      });

      // Handle content processing
      ed.onBeforeSetContent.add(function (ed, o) {
        o.content = self.protectCodeBlocks(o.content);
      });

      ed.onPostProcess.add(function (ed, o) {
        if (o.get) {
          o.content = self.restoreCodeBlocks(o.content);
        }
      });

      // Prevent auto-formatting inside code blocks
      ed.onBeforeExecCommand.add(function (ed, cmd, ui, val) {
        if (cmd === "mceInsertContent" && self.isInsideCodeBlock()) {
          // Handle paste events inside code blocks
          return self.handleCodeBlockPaste(val);
        }
      });

      // Handle paste events
      ed.onPaste.add(function (ed, e) {
        setTimeout(function () {
          self.cleanPastedContent();
        }, 100);
      });
    },

    /**
     * Show the code block dialog
     */
    showCodeBlockDialog: function () {
      var self = this;
      var selectedContent = this.editor.selection.getContent();

      // Create dialog
      this.editor.windowManager.open({
        title: "Insert Code Block",
        width: 600,
        height: 500,
        inline: 1,
        body: [
          {
            type: "listbox",
            name: "language",
            label: "Language:",
            values: LANGUAGE_OPTIONS,
            value: "text",
          },
          {
            type: "textbox",
            name: "title",
            label: "Title (optional):",
            value: "",
          },
          {
            type: "textbox",
            name: "filename",
            label: "File Name (optional):",
            value: "",
          },
          {
            type: "checkbox",
            name: "line_numbers",
            label: "Show line numbers",
            checked: false,
          },
          {
            type: "checkbox",
            name: "copy_button",
            label: "Show copy button",
            checked: true,
          },
          {
            type: "checkbox",
            name: "word_wrap",
            label: "Enable word wrap",
            checked: false,
          },
          {
            type: "textbox",
            name: "highlight",
            label: "Highlight lines (e.g., 1,3-5,7):",
            value: "",
          },
          {
            type: "textbox",
            name: "height",
            label: "Max height (e.g., 300px):",
            value: "",
          },
          {
            type: "textbox",
            name: "code",
            label: "Code:",
            multiline: true,
            minWidth: 500,
            minHeight: 200,
            value: selectedContent || "",
          },
        ],
        onsubmit: function (e) {
          self.insertCodeBlock(e.data);
        },
      });
    },

    /**
     * Insert code block shortcode
     */
    insertCodeBlock: function (data) {
      var shortcode = "[code_block";

      // Add attributes
      if (data.language && data.language !== "text") {
        shortcode += ' lang="' + data.language + '"';
      }

      if (data.title) {
        shortcode += ' title="' + this.escapeAttribute(data.title) + '"';
      }

      if (data.filename) {
        shortcode += ' file="' + this.escapeAttribute(data.filename) + '"';
      }

      if (data.line_numbers) {
        shortcode += ' line_numbers="true"';
      }

      if (!data.copy_button) {
        shortcode += ' copy="false"';
      }

      if (data.word_wrap) {
        shortcode += ' wrap="true"';
      }

      if (data.highlight) {
        shortcode +=
          ' highlight="' + this.escapeAttribute(data.highlight) + '"';
      }

      if (data.height) {
        shortcode += ' height="' + this.escapeAttribute(data.height) + '"';
      }

      shortcode += "]";

      // Add code content
      var code = data.code || "";
      code = this.preserveCodeFormatting(code);

      shortcode += code + "[/code_block]";

      // Insert into editor
      this.editor.execCommand("mceInsertContent", false, shortcode);
    },

    /**
     * Preserve code formatting when inserting
     */
    preserveCodeFormatting: function (code) {
      // Remove any HTML that might have been pasted
      code = code.replace(/<[^>]*>/g, "");

      // Preserve line breaks and spaces
      code = code.replace(/\r\n/g, "\n");
      code = code.replace(/\r/g, "\n");

      return code;
    },

    /**
     * Escape attribute values
     */
    escapeAttribute: function (value) {
      return value.replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    },

    /**
     * Protect code blocks from TinyMCE formatting
     */
    protectCodeBlocks: function (content) {
      var self = this;

      return content.replace(
        /\[code_block([^\]]*)\]([\s\S]*?)\[\/code_block\]/g,
        function (match, attrs, code) {
          // Create a protected placeholder
          var placeholder =
            '<div class="acr-code-placeholder" data-attrs="' +
            self.escapeAttribute(attrs) +
            '" data-code="' +
            self.escapeAttribute(code) +
            '">Code Block</div>';

          return placeholder;
        }
      );
    },

    /**
     * Restore code blocks from placeholders
     */
    restoreCodeBlocks: function (content) {
      return content.replace(
        /<div class="acr-code-placeholder"[^>]*data-attrs="([^"]*)"[^>]*data-code="([^"]*)"[^>]*>Code Block<\/div>/g,
        function (match, attrs, code) {
          // Restore the shortcode
          attrs = attrs.replace(/&quot;/g, '"').replace(/&#039;/g, "'");
          code = code.replace(/&quot;/g, '"').replace(/&#039;/g, "'");

          return "[code_block" + attrs + "]" + code + "[/code_block]";
        }
      );
    },

    /**
     * Check if cursor is inside a code block
     */
    isInsideCodeBlock: function () {
      var node = this.editor.selection.getNode();
      return this.editor.dom.getParent(node, ".acr-code-placeholder") !== null;
    },

    /**
     * Handle paste inside code blocks
     */
    handleCodeBlockPaste: function (content) {
      // Strip HTML and preserve only text content
      var temp = document.createElement("div");
      temp.innerHTML = content;
      return temp.textContent || temp.innerText || "";
    },

    /**
     * Clean pasted content to prevent auto-formatting
     */
    cleanPastedContent: function () {
      var self = this;
      var content = this.editor.getContent();

      // Look for code blocks that might have been auto-formatted during paste
      content = content.replace(/(<p[^>]*>)(\s*\[code_block[^\]]*\])/gi, "$2");
      content = content.replace(/(\[\/code_block\])(\s*<\/p>)/gi, "$1");

      // Clean up code block content that got wrapped in paragraphs
      content = content.replace(
        /(\[code_block[^\]]*\])([\s\S]*?)(\[\/code_block\])/gi,
        function (match, start, code, end) {
          // Remove paragraph tags from inside code blocks
          code = code.replace(/<p[^>]*>/gi, "");
          code = code.replace(/<\/p>/gi, "\n");
          code = code.replace(/<br[^>]*>/gi, "\n");
          code = code.replace(/&nbsp;/gi, " ");

          // Clean up multiple line breaks
          code = code.replace(/\n\s*\n\s*\n/g, "\n\n");
          code = code.trim();

          return start + code + end;
        }
      );

      this.editor.setContent(content);
    },

    /**
     * Plugin info
     */
    getInfo: function () {
      return {
        longname: "Advanced Code Renderer",
        author: "Solutions Architect",
        authorurl: "",
        infourl: "",
        version: "1.0.0",
      };
    },
  });

  // Register plugin
  tinymce.PluginManager.add("acr_code_block", tinymce.plugins.ACRCodeBlock);
})();
