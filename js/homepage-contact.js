(() => {
  const form = document.getElementById("homepage-contact-form");
  const status = document.getElementById("homepage-contact-status");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    if (!navigator.onLine) {
      event.preventDefault();
      status.textContent = "You are offline. Reconnect and try again, or call 732-277-4547.";
      return;
    }

    // Keep the native POST: the service displays its own result. An opaque
    // no-cors fetch response cannot confirm acceptance or email delivery.
    status.textContent = "Sending your message. Please wait for the result on the next page.";
  });

  // Clear stale pending feedback when returning from the submission service.
  window.addEventListener("pageshow", () => {
    status.textContent = "";
  });
})();
