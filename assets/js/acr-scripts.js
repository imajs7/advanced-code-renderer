/**
 * Advanced Code Renderer Frontend Scripts
 */
(function ($) {
  "use strict";

  // Initialize when DOM is ready
  $(document).ready(function () {
    ACR.init();
  });

  // Main ACR object
  window.ACR = {
    /**
     * Initialize the plugin
     */
    init: function () {
      this.setupCopyButtons();
      this.setupLineNumbers();
      this.setupWordWrap();
      this.setupLanguageLabels();
      this.setupResponsiveHandling();
      this.bindEvents();
    },

    /**
     * Setup copy to clipboard functionality
     */
    setupCopyButtons: function () {
      // Enhanced copy functionality
      if (window.Prism && Prism.plugins && Prism.plugins.toolbar) {
        Prism.plugins.toolbar.registerButton(
          "copy-to-clipboard",
          function (env) {
            var linkCopy = document.createElement("button");
            linkCopy.textContent = acrAjax.copyText || "Copy";
            linkCopy.className = "acr-copy-button";

            var linkCopySpan = document.createElement("span");
            linkCopySpan.textContent = acrAjax.copiedText || "Copied!";
            linkCopySpan.className = "acr-copy-success";
            linkCopySpan.style.display = "none";

            linkCopy.appendChild(linkCopySpan);

            linkCopy.addEventListener("click", function () {
              ACR.copyToClipboard(env.code, linkCopy, linkCopySpan);
            });

            return linkCopy;
          }
        );
      }
    },

    /**
     * Copy text to clipboard with fallback
     */
    copyToClipboard: function (text, button, successSpan) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Modern clipboard API
        navigator.clipboard
          .writeText(text)
          .then(function () {
            ACR.showCopySuccess(button, successSpan);
          })
          .catch(function () {
            ACR.fallbackCopyToClipboard(text, button, successSpan);
          });
      } else {
        // Fallback for older browsers
        ACR.fallbackCopyToClipboard(text, button, successSpan);
      }
    },

    /**
     * Fallback copy method for older browsers
     */
    fallbackCopyToClipboard: function (text, button, successSpan) {
      var textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        var result = document.execCommand("copy");
        if (result) {
          ACR.showCopySuccess(button, successSpan);
        }
      } catch (err) {
        console.warn("Copy to clipboard failed:", err);
      }

      document.body.removeChild(textArea);
    },

    /**
     * Show copy success feedback
     */
    showCopySuccess: function (button, successSpan) {
      var originalText = button.firstChild.textContent;
      button.firstChild.style.display = "none";
      successSpan.style.display = "inline";

      setTimeout(function () {
        button.firstChild.style.display = "inline";
        successSpan.style.display = "none";
      }, 2000);
    },

    /**
     * Setup line numbers functionality
     */
    setupLineNumbers: function () {
      $(".acr-code-block pre.line-numbers").each(function () {
        if (window.Prism && Prism.plugins && Prism.plugins.lineNumbers) {
          Prism.plugins.lineNumbers.resize(this);
        }
      });
    },

    /**
     * Setup word wrap functionality
     */
    setupWordWrap: function () {
      $(".acr-word-wrap pre").css({
        "white-space": "pre-wrap",
        "word-wrap": "break-word",
      });
    },

    /**
     * Setup language labels
     */
    setupLanguageLabels: function () {
      $(".acr-language-label").each(function () {
        var $label = $(this);
        var $codeBlock = $label.closest(".acr-code-block");

        // Position the label correctly
        $codeBlock.css("position", "relative");
        $label.css({
          position: "absolute",
          top: "8px",
          right: "8px",
          "z-index": "10",
        });
      });
    },

    /**
     * Setup responsive handling
     */
    setupResponsiveHandling: function () {
      $(window).on(
        "resize",
        this.debounce(function () {
          ACR.handleResponsiveChanges();
        }, 250)
      );

      // Initial call
      this.handleResponsiveChanges();
    },

    /**
     * Handle responsive changes
     */
    handleResponsiveChanges: function () {
      var windowWidth = $(window).width();

      $(".acr-code-block").each(function () {
        var $block = $(this);

        if (windowWidth < 768) {
          $block.addClass("acr-mobile");
        } else {
          $block.removeClass("acr-mobile");
        }
      });
    },

    /**
     * Bind additional events
     */
    bindEvents: function () {
      // Handle code block focus for accessibility
      $(".acr-code-block pre")
        .attr("tabindex", "0")
        .on("focus", function () {
          $(this).addClass("acr-focused");
        })
        .on("blur", function () {
          $(this).removeClass("acr-focused");
        });

      // Handle keyboard navigation
      $(document).on("keydown", ".acr-code-block pre", function (e) {
        if (e.key === "Tab") {
          e.preventDefault();
          // Move to next focusable element
          var $next = $(this)
            .closest(".acr-code-block")
            .nextAll(":focusable")
            .first();
          if ($next.length) {
            $next.focus();
          }
        }
      });

      // Double-click to select all code
      $(".acr-code-block code").on("dblclick", function () {
        ACR.selectAllCode(this);
      });
    },

    /**
     * Select all code in a block
     */
    selectAllCode: function (codeElement) {
      var range = document.createRange();
      range.selectNodeContents(codeElement);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    },

    /**
     * Debounce function for performance
     */
    debounce: function (func, wait) {
      var timeout;
      return function executedFunction() {
        var context = this;
        var args = arguments;
        var later = function () {
          timeout = null;
          func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Utility function to get language from class
     */
    getLanguageFromClass: function (className) {
      var matches = className.match(/language-(\w+)/);
      return matches ? matches[1] : "text";
    },

    /**
     * Check if element is in viewport
     */
    isInViewport: function (element) {
      var rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    /**
     * Lazy load code highlighting for performance
     */
    lazyHighlight: function () {
      $(".acr-code-block pre:not(.acr-highlighted)").each(function () {
        var element = this;
        if (ACR.isInViewport(element)) {
          if (window.Prism) {
            Prism.highlightElement(element.querySelector("code"));
            $(element).addClass("acr-highlighted");
          }
        }
      });
    },
  };

  // Initialize lazy highlighting on scroll
  $(window).on("scroll", ACR.debounce(ACR.lazyHighlight, 100));

  // Prism.js hook for custom enhancements
  if (window.Prism) {
    Prism.hooks.add("complete", function (env) {
      var $pre = $(env.element).closest("pre");
      var $codeBlock = $pre.closest(".acr-code-block");

      // Add custom classes based on language
      var language = ACR.getLanguageFromClass(env.element.className);
      $codeBlock.addClass("acr-lang-" + language);

      // Trigger custom event
      $codeBlock.trigger("acr:highlighted", {
        language: language,
        element: env.element,
      });
    });
  }

  // Custom event for theme developers
  $(document).on("acr:highlighted", ".acr-code-block", function (e, data) {
    // Custom highlighting complete event
    // Theme developers can listen to this event
    console.log("Code block highlighted:", data.language);
  });

  // Export for external use
  window.AdvancedCodeRenderer = ACR;
})(jQuery);
