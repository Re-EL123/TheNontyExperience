/*
 * Tiny client for the Nonty API. Include on the GitHub Pages site:
 *   <script>window.NONTY_API_URL = "https://YOUR-VERCEL-DOMAIN/api";</script>
 *   <script src="assets/js/nonty-api.js" defer></script>
 *
 * The public site keeps working without the API: if a request fails, the enquiry
 * form falls back to a pre-filled WhatsApp message, as the original design intended.
 */
(function () {
  var API = (window.NONTY_API_URL || "").replace(/\/$/, "");
  var WA = "27813864024";

  function request(path, options) {
    return fetch(API + path, options).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) { var e = new Error(data.error || "Request failed"); e.status = res.status; e.fields = data.fields; throw e; }
        return data;
      });
    });
  }

  function whatsappUrl(p) {
    var lines = [
      "Hi Nonty, I would like to enquire about a makeup booking.",
      p.service && "Service: " + p.service,
      p.preferredDate && "Preferred date: " + p.preferredDate,
      p.occasion && "Occasion: " + p.occasion,
      p.details && p.details,
      "Name: " + p.name,
    ].filter(Boolean);
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  window.NontyAPI = {
    services: function () { return request("/public/services"); },
    gallery: function (category) { return request("/public/gallery" + (category ? "?category=" + encodeURIComponent(category) : "")); },
    submitEnquiry: function (payload) {
      return request("/public/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },

    /**
     * Wire an existing <form>. Input `name` attributes must be:
     * name, phone, email, service, preferredDate, preferredTime, occasion, details
     * plus a hidden honeypot input named "website" (leave it empty and hide it with CSS).
     */
    bindEnquiryForm: function (form, ui) {
      ui = ui || {};
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        if (form.dataset.busy) return;
        var payload = {};
        new FormData(form).forEach(function (v, k) { payload[k] = typeof v === "string" ? v.trim() : v; });
        form.dataset.busy = "1";
        window.NontyAPI.submitEnquiry(payload)
          .then(function () { form.reset(); ui.onSuccess && ui.onSuccess(); })
          .catch(function (err) {
            // Validation problems are the visitor's to fix; anything else falls back to WhatsApp.
            if (err.status === 400) { ui.onInvalid && ui.onInvalid(err); return; }
            ui.onFallback && ui.onFallback(whatsappUrl(payload), err);
          })
          .finally(function () { delete form.dataset.busy; });
      });
    },
  };
})();
