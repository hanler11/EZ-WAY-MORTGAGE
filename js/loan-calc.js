// ============================================
// LOAN CALCULATOR - EMBED (MortgageCalculator.org)
// ============================================

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    try {
      // Auto-load embedded calculator on page
      initEmbeddedCalculator();

      // Modal embed initialization flag
      let modalCalculatorInitialized = false;

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

        // Initialize calculator iframe if not already done
        if (!modalCalculatorInitialized && lhpContent) {
          modalCalculatorInitialized = true;
          renderMortgageIframe(lhpContent, {}, { loading: "lazy" });
        }
      };

      function renderMortgageIframe(container, defaults = {}, options = {}) {
        const loadingAttr = options.loading || "lazy";
        // Remove any previous loading indicator
        const loading = container.querySelector(".calculator-loading");
        if (loading) loading.remove();

        const params = new URLSearchParams({
          homevalue: String(defaults.homevalue || 400000),
          downpayment: String(defaults.downpayment || 80000),
          loanamount: String(defaults.loanamount || 320000),
          interestrate: String(defaults.interestrate || 6.5),
          loanterm: String(defaults.loanterm || 30),
          propertytax: String(defaults.propertytax || 3000),
          pmi: String(defaults.pmi || 0.5),
          homeinsurance: String(defaults.homeinsurance || 1500),
          monthlyhoa: String(defaults.monthlyhoa || 0),
        });

        const src = `https://www.mortgagecalculator.org/webmasters/?${params.toString()}`;

        container.innerHTML = `
          <div class="calculator-frame-wrapper" style="width:100%;max-width:100%;">
            <iframe src="${src}" title="Mortgage Calculator"
              style="width:100%;border:0;display:block;" loading="${loadingAttr}" referrerpolicy="no-referrer-when-downgrade"></iframe>
            <div style="font-family: Arial; height: 36px; padding: 0 8px; box-sizing: border-box; text-align: right; background: #f6f9f9; border: 1px solid #ccc; color: #868686; line-height: 34px; font-size: 12px;">
              <a style="color:#868686;" href="https://www.mortgagecalculator.org/free-tools/javascript-mortgage-calculator.php" target="_blank" rel="noopener noreferrer">Javascript Mortgage Calculator</a> by MortgageCalculator.org
            </div>
          </div>
        `;
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

        // Skeleton mientras espera intersección
        embeddedContainer.innerHTML = `
          <div class="calculator-loading">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mb-4"></div>
            <p>Loading calculator...</p>
          </div>`;

        if ("IntersectionObserver" in window) {
          const io = new IntersectionObserver(
            (entries, obs) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  renderMortgageIframe(
                    embeddedContainer,
                    {},
                    { loading: "eager" }
                  );
                  obs.disconnect();
                }
              });
            },
            { root: null, rootMargin: "200px 0px", threshold: 0.01 }
          );
          io.observe(embeddedContainer);
        } else {
          // Fallback sin IO
          renderMortgageIframe(embeddedContainer, {}, { loading: "eager" });
        }
      }
    } catch (e) {
      console.debug("loan calc init error", e);
    }
  });
})();
