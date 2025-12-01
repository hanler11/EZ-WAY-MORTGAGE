(function () {
  // Calculator logic moved to external file so it can be reused across pages
  const btn = document.getElementById("calc-btn");
  const panel = document.getElementById("calculator");
  const display = document.getElementById("calc-display");
  const closeBtn = panel && panel.querySelector(".calc-close");
  const btnImg = btn && btn.querySelector("img");

  let expr = "";

  function render() {
    if (!display) return;
    display.textContent = expr === "" ? "0" : expr;
  }

  function safeEval(s) {
    // allow digits, operators, parentheses and decimal
    const safe = s.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
    if (!/^[0-9+\-*/().\s]+$/.test(safe)) throw new Error("Invalid characters");
    // eslint-disable-next-line no-new-func
    return Function("return (" + safe + ")")();
  }

  function press(key) {
    if (!display) return;
    if (key === "C") {
      expr = "";
      render();
      return;
    }
    if (key === "←") {
      expr = expr.slice(0, -1);
      render();
      return;
    }
    if (key === "=") {
      try {
        const val = safeEval(expr);
        expr = String(Number.isFinite(val) ? +val : val);
      } catch (e) {
        expr = "Error";
      }
      render();
      return;
    }
    // map operator symbols
    if (key === "×" || key === "÷" || key === "−") {
      expr += key;
      render();
      return;
    }
    // numbers and dot and parentheses
    expr += key;
    render();
  }

  try {
    // If the provided image has a white circular background, attempt to
    // remove white pixels dynamically (client-side) so the button doesn't
    // show a white circle. This is a best-effort approach and works when
    // the image is same-origin (assets folder).
    function makeWhiteTransparent(imgEl) {
      try {
        if (!imgEl || !imgEl.complete) return;
        const w = imgEl.naturalWidth;
        const h = imgEl.naturalHeight;
        if (!w || !h) return;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        ctx.drawImage(imgEl, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        // Make near-white pixels transparent
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i],
            g = d[i + 1],
            b = d[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            d[i + 3] = 0; // alpha = 0
          }
        }
        ctx.putImageData(imgData, 0, 0);
        imgEl.src = c.toDataURL();
      } catch (err) {
        // silently continue if CORS or other issue
        console.debug("makeWhiteTransparent failed", err);
      }
    }
    if (btnImg) {
      if (btnImg.complete) makeWhiteTransparent(btnImg);
      else btnImg.addEventListener("load", () => makeWhiteTransparent(btnImg));
    }
    if (panel) {
      // delegate clicks
      panel.addEventListener("click", function (e) {
        const t = e.target.closest(".calc-key");
        if (!t) return;
        press(t.textContent.trim());
      });
    }

    if (btn && panel) {
      btn.addEventListener("click", function () {
        panel.style.display =
          panel.style.display === "block" ? "none" : "block";
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        panel.style.display = "none";
      });
    }

    // keyboard support when panel open
    window.addEventListener("keydown", function (e) {
      if (!panel || panel.style.display !== "block") return;
      const k = e.key;
      if (/^[0-9]$/.test(k) || k === "." || k === "(" || k === ")") {
        press(k);
      } else if (k === "Backspace") press("←");
      else if (k === "Escape") panel.style.display = "none";
      else if (k === "Enter") press("=");
      else if (k === "+" || k === "-" || k === "*" || k === "/") press(k);
    });
  } catch (err) {
    console.warn("Calculator script error", err);
  }
})();
