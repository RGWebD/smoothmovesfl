(function () {
  document.documentElement.classList.add("js");
  const nav = document.getElementById("nav");
  const menuBtn = document.querySelector(".menu-btn");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  const form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      form.classList.add("sent");
      const success = form.querySelector(".form-success");
      if (success) success.setAttribute("tabindex", "-1"), success.focus();
    });
  }

  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const img = lightbox.querySelector("img");
    const cap = lightbox.querySelector(".cap");
    const closeBtn = lightbox.querySelector("button");
    function close() {
      lightbox.classList.remove("open");
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }
    function open(src, alt) {
      img.src = src;
      img.alt = alt || "";
      cap.textContent = alt || "";
      lightbox.hidden = false;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }
    document.querySelectorAll(".gallery-grid a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        open(a.getAttribute("data-full") || a.getAttribute("href"), a.getAttribute("data-alt") || "");
      });
    });
    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("open")) close();
    });
  }

  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }
})();
