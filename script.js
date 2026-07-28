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

  /* ---------- Motion gate: fully skip 3D-tilt / parallax when reduced motion is requested ---------- */
  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = reduceMotionQuery.matches;

  /* ---------- 3D tilt on menu cards ---------- */
  if (!reduceMotion) {
    var tiltCards = document.querySelectorAll(".menu-card");

    tiltCards.forEach(function (card) {
      var rafId = null;
      var lastEvent = null;

      function applyTilt() {
        rafId = null;
        if (!lastEvent) return;
        var rect = card.getBoundingClientRect();
        var px = (lastEvent.clientX - rect.left) / rect.width;   // 0..1
        var py = (lastEvent.clientY - rect.top) / rect.height;   // 0..1
        px = Math.min(1, Math.max(0, px));
        py = Math.min(1, Math.max(0, py));

        var rotY = (px - 0.5) * 16;   // ±8deg left/right
        var rotX = (0.5 - py) * 14;   // ±7deg up/down

        card.style.setProperty("--tilt-x", rotX.toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", rotY.toFixed(2) + "deg");
        card.style.setProperty("--tilt-z", "14px");
        card.style.setProperty("--glare-x", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--glare-y", (py * 100).toFixed(1) + "%");
        card.style.setProperty("--glare-o", "1");

        // Shadow follows the tilt direction and grows slightly — still hard-edged, no blur.
        var shadowX = (-rotY * 0.9).toFixed(1);
        var shadowY = (6 - rotX * 0.9).toFixed(1);
        card.style.setProperty("--tilt-shadow", shadowX + "px " + shadowY + "px 0 var(--color-ink)");
      }

      card.addEventListener("mouseenter", function () {
        card.classList.add("is-tilting");
      });

      card.addEventListener("mousemove", function (event) {
        lastEvent = event;
        if (rafId === null) {
          rafId = window.requestAnimationFrame(applyTilt);
        }
      });

      card.addEventListener("mouseleave", function () {
        card.classList.remove("is-tilting");
        lastEvent = null;
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
        card.style.removeProperty("--tilt-z");
        card.style.removeProperty("--glare-o");
        card.style.removeProperty("--tilt-shadow");
      });
    });
  }

  /* ---------- Scroll parallax: hero background depth + rolling tread strip ---------- */
  if (!reduceMotion) {
    var parallaxBg = document.querySelector('[data-parallax="bg"]');
    var parallaxTread = document.querySelector('[data-parallax="tread"]');

    if (parallaxBg || parallaxTread) {
      var ticking = false;

      var updateParallax = function () {
        var scrollY = window.scrollY || window.pageYOffset || 0;

        if (parallaxBg) {
          // Background drifts slower than the page for a depth effect (no background-attachment:fixed).
          var bgOffset = scrollY * 0.22;
          parallaxBg.style.transform = "translate3d(0, " + bgOffset.toFixed(1) + "px, 0)";
        }

        if (parallaxTread) {
          // Tread pattern rolls sideways as the page scrolls, echoing a tyre in motion.
          var tileSize = 44; // matches --tread pattern background-size
          var shift = (scrollY * 0.5) % tileSize;
          parallaxTread.style.backgroundPosition = shift.toFixed(1) + "px 0";
        }

        ticking = false;
      };

      var onScroll = function () {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      updateParallax();
    }
  }

  /* ---------- Reviews tachometer: needle sweeps to the real 4.9 rating on scroll ---------- */
  var reviewsGauge = document.getElementById("reviewsGauge");
  if (reviewsGauge) {
    if (reduceMotion || typeof IntersectionObserver !== "function") {
      // No motion (or no observer support): jump straight to the correct reading.
      reviewsGauge.classList.add("is-active");
    } else {
      var gaugeObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              reviewsGauge.classList.add("is-active");
              gaugeObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      gaugeObserver.observe(reviewsGauge);
    }
  }

  /* ---------- If the user's motion preference changes at runtime, drop any inline tilt/parallax state ---------- */
  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", function (event) {
      if (!event.matches) return;
      document.querySelectorAll(".menu-card").forEach(function (card) {
        card.classList.remove("is-tilting");
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
        card.style.removeProperty("--tilt-z");
        card.style.removeProperty("--glare-o");
        card.style.removeProperty("--tilt-shadow");
      });
      var bg = document.querySelector('[data-parallax="bg"]');
      var tread = document.querySelector('[data-parallax="tread"]');
      if (bg) bg.style.transform = "";
      if (tread) tread.style.backgroundPosition = "";
    });
  }
})();
