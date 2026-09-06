/* Borrow My Executive Functioning — small, optional enhancements.
   Everything on the site works without JavaScript; this only
   adds the mobile menu toggle and a little "Coming soon" feedback. */
(function () {
  "use strict";

  // Lets CSS know JS is running (mobile nav is only collapsible when it is).
  document.documentElement.classList.add("js");

  // ---- Mobile navigation toggle -----------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.querySelector(".nav-toggle-text").textContent = open ? "Close" : "Menu";
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    // Escape closes the menu and returns focus to the button.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // ---- "Coming soon" buttons ---------------------------------------------
  // Placeholder buttons have no destination yet. Instead of a dead click,
  // give immediate, polite feedback (design rule 6: feedback on actions).
  var live = document.createElement("div");
  live.className = "visually-hidden";
  live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);

  document.querySelectorAll('[data-coming-soon]').forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var msg = el.getAttribute("data-coming-soon") || "This is coming soon.";
      live.textContent = "";
      window.setTimeout(function () { live.textContent = msg; }, 50);

      var note = el.parentElement.querySelector(".coming-soon-note");
      if (!note) {
        note = document.createElement("p");
        note.className = "coming-soon-note";
        note.style.marginTop = "0.5rem";
        note.style.fontSize = "0.95rem";
        note.style.color = "#157572";
        el.insertAdjacentElement("afterend", note);
      }
      note.textContent = msg;
    });
  });

  // ---- Thank-you page ------------------------------------------------------
  // Forms redirect to thanks.html?form=<name>; swap in a message that matches.
  var thanks = document.getElementById("thanks-message");
  if (thanks) {
    var which = new URLSearchParams(window.location.search).get("form");
    var custom = which && thanks.getAttribute("data-" + which);
    if (custom) { thanks.textContent = custom; }
  }
})();
