(function () {
  "use strict";

  /* ---------- Mobile navigation toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close mobile menu after choosing a link
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Booking form -> WhatsApp ---------- */
  var WHATSAPP_NUMBER = "79686361542"; // +7 968 636-15-42

  var form = document.getElementById("bookingForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var date = form.date.value;
      var time = form.time.value;
      var guests = form.guests.value.trim();
      var comment = form.comment.value.trim();

      if (!name || !phone) {
        form.reportValidity();
        return;
      }

      var lines = [
        "Заявка с сайта St.Riders Coffee",
        "Имя: " + name,
        "Телефон: " + phone
      ];
      if (date) lines.push("Дата: " + date);
      if (time) lines.push("Время: " + time);
      if (guests) lines.push("Кол-во человек: " + guests);
      if (comment) lines.push("Комментарий: " + comment);

      var message = lines.join("\n");
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);

      window.open(url, "_blank", "noopener,noreferrer");
    });
  }
})();
