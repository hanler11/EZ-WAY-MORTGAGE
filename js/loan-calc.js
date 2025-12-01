// ============================================
// LOAN CALCULATOR - LHP INTEGRATION
// ============================================

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    try {
      // Auto-load embedded calculator on page
      initEmbeddedCalculator();

      // LHP Calculator Integration for Modal
      let lhpCalculatorInitialized = false;

      window.openLHPCalculator = function () {
        const lhpModal = document.getElementById("lhp-calculator");
        const lhpContent = document.getElementById("lhp-calculator-content");
        const navbar = document.getElementById("navbar");

        if (!lhpModal) return;

        // Hide navbar on all screen sizes when calculator opens
        if (navbar) {
          navbar.classList.add("navbar-hidden");
        }

        // Show modal
        lhpModal.style.display = "block";

        // Add backdrop
        let bd = document.getElementById("loan-backdrop");
        if (!bd) {
          bd = document.createElement("div");
          bd.id = "loan-backdrop";
          bd.className = "loan-backdrop";
          document.body.appendChild(bd);
          bd.addEventListener("click", closeLHPCalculator);
        }
        bd.classList.add("active");

        // Prevent scroll
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        // Initialize LHP calculator if not already done
        if (!lhpCalculatorInitialized && lhpContent) {
          lhpCalculatorInitialized = true;

          // Load jQuery if not already loaded
          if (typeof jQuery === "undefined") {
            const jQueryScript = document.createElement("script");
            jQueryScript.src = "https://code.jquery.com/jquery-3.6.0.min.js";
            jQueryScript.onload = function () {
              loadLHPCalculator(lhpContent);
            };
            document.head.appendChild(jQueryScript);
          } else {
            loadLHPCalculator(lhpContent);
          }
        }
      };

      function loadLHPCalculator(container) {
        // Load LHP calculator script
        const lhpScript = document.createElement("script");
        lhpScript.src =
          "https://lhp-cdn.s3.us-east-2.amazonaws.com/calculator-js/index.js";
        lhpScript.onload = function () {
          try {
            window.lhpCalculator
              .mount("lhp-calculator-content", {
                page: "/",
                calculatorDefaults:
                  '[{"id":4,"user_id":813,"calculator":"conventional","config_json":{"description":"Calculate your Monthly Payment – Select your loan type, use sliders to input loan parameters.  Share results.","property_price":"350000","property_tax":"1.2","down_payment":"3","annual_insurance_rate":"0.5","mortgage_term":"30","interest_rate_30":"6.5","enabled":"1"}}]',
                cssVars: {
                  "--lhp-primary-color": "#b68c2f",
                  "--lhp-primary-hover": "#ffd166",
                  "--lhp-secondary-color": "#0b0b0b",
                  "--lhp-text-color": "#1a1a1a",
                  "--lhp-background":
                    "linear-gradient(135deg, #ffd166 0%, #b68c2f 100%)",
                  "--lhp-border-color": "#b68c2f",
                  "--lhp-shadow": "0 8px 32px rgba(182, 140, 47, 0.3)",
                },
                defaultOptions: {},
                defaultLimits: {},
              })
              .then((client) => {
                // Remove loading indicator
                const loading = container.querySelector(".calculator-loading");
                if (loading) loading.remove();

                // Handle events
                client.on("saved", (event) => {
                  console.log("LHP Calculator result saved:", event);
                });

                client.on("resized", (event) => {
                  if (event.eventData && event.eventData.height) {
                    const iframe = container.querySelector("iframe");
                    if (iframe) {
                      iframe.style.height = event.eventData.height + "px";
                    }
                  }
                });
              })
              .catch((error) => {
                console.error("Error loading LHP calculator:", error);
                container.innerHTML =
                  '<div style="text-align: center; padding: 40px; color: #e57373;"><h3>Error loading calculator</h3><p>Please try again later.</p></div>';
              });
          } catch (error) {
            console.error("Error initializing LHP calculator:", error);
            container.innerHTML =
              '<div style="text-align: center; padding: 40px; color: #e57373;"><h3>Error loading calculator</h3><p>Please try again later.</p></div>';
          }
        };
        lhpScript.onerror = function () {
          console.error("Failed to load LHP calculator script");
          container.innerHTML =
            '<div style="text-align: center; padding: 40px; color: #e57373;"><h3>Error loading calculator</h3><p>Please try again later.</p></div>';
        };
        document.head.appendChild(lhpScript);
      }

      window.closeLHPCalculator = function () {
        const lhpModal = document.getElementById("lhp-calculator");
        const navbar = document.getElementById("navbar");
        if (!lhpModal) return;

        lhpModal.style.display = "none";

        // Show navbar again
        if (navbar) {
          navbar.classList.remove("navbar-hidden");
        }

        // Remove backdrop
        const bd = document.getElementById("loan-backdrop");
        if (bd) {
          bd.classList.remove("active");
          setTimeout(() => {
            if (bd && !bd.classList.contains("active")) {
              bd.remove();
            }
          }, 300);
        }

        // Restore scroll
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      };

      // Initialize embedded calculator automatically
      function initEmbeddedCalculator() {
        const embeddedContainer = document.getElementById(
          "lhp-calculator-embedded"
        );
        if (!embeddedContainer) return;

        // Load jQuery if needed
        if (typeof jQuery === "undefined") {
          const jQueryScript = document.createElement("script");
          jQueryScript.src = "https://code.jquery.com/jquery-3.6.0.min.js";
          jQueryScript.onload = function () {
            loadEmbeddedLHPCalculator(embeddedContainer);
          };
          document.head.appendChild(jQueryScript);
        } else {
          loadEmbeddedLHPCalculator(embeddedContainer);
        }
      }

      function loadEmbeddedLHPCalculator(container) {
        const lhpScript = document.createElement("script");
        lhpScript.src =
          "https://lhp-cdn.s3.us-east-2.amazonaws.com/calculator-js/index.js";
        lhpScript.onload = function () {
          try {
            window.lhpCalculator
              .mount("lhp-calculator-embedded", {
                page: "/",
                calculatorDefaults:
                  '[{"id":4,"user_id":813,"calculator":"conventional","config_json":{"description":"Calculate your Monthly Payment – Select your loan type, use sliders to input loan parameters.  Share results.","property_price":"350000","property_tax":"1.2","down_payment":"3","annual_insurance_rate":"0.5","mortgage_term":"30","interest_rate_30":"6.5","enabled":"1"}}]',
                cssVars: {
                  "--lhp-primary-color": "#b68c2f",
                  "--lhp-primary-hover": "#ffd166",
                  "--lhp-secondary-color": "#0b0b0b",
                  "--lhp-text-color": "#1a1a1a",
                  "--lhp-background":
                    "linear-gradient(135deg, #ffd166 0%, #b68c2f 100%)",
                  "--lhp-border-color": "#b68c2f",
                  "--lhp-shadow": "0 8px 32px rgba(182, 140, 47, 0.3)",
                },
                defaultOptions: {},
                defaultLimits: {},
              })
              .then((client) => {
                // Remove loading indicator
                const loading = container.querySelector(".calculator-loading");
                if (loading) loading.remove();

                // Handle events
                client.on("saved", (event) => {
                  console.log("LHP Calculator result saved:", event);
                });

                client.on("resized", (event) => {
                  if (event.eventData && event.eventData.height) {
                    const iframe = container.querySelector("iframe");
                    if (iframe) {
                      iframe.style.height = event.eventData.height + "px";
                    }
                  }
                });
              })
              .catch((error) => {
                console.error("Error loading embedded LHP calculator:", error);
                container.innerHTML =
                  '<div style="text-align: center; padding: 40px; color: #e57373;"><h3>Error loading calculator</h3><p>Please try again later or contact us for assistance.</p></div>';
              });
          } catch (error) {
            console.error("Error initializing embedded LHP calculator:", error);
            container.innerHTML =
              '<div style="text-align: center; padding: 40px; color: #e57373;"><h3>Error loading calculator</h3><p>Please try again later or contact us for assistance.</p></div>';
          }
        };
        lhpScript.onerror = function () {
          console.error("Failed to load LHP calculator script");
          container.innerHTML =
            '<div style="text-align: center; padding: 40px; color: #e57373;"><h3>Error loading calculator</h3><p>Please try again later or contact us for assistance.</p></div>';
        };
        document.head.appendChild(lhpScript);
      }
    } catch (e) {
      console.debug("loan calc init error", e);
    }
  });
})();
