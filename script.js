(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  root.classList.add("js");
  if (!reduce) root.classList.add("rv");

  const preview = document.querySelector(".preview-bar");
  const setPreviewH = () => {
    if (preview) root.style.setProperty("--preview-h", preview.offsetHeight + "px");
  };
  setPreviewH();
  addEventListener("resize", setPreviewH);

  // Glass nav + scroll progress + parallax + process truck
  const nav = document.querySelector(".nav");
  const bar = document.querySelector(".progress span");
  const process = document.querySelector("[data-process]");
  const parallax = [...document.querySelectorAll("[data-parallax]")];
  let ticking = false;

  const onScroll = () => {
    const y = scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle("scrolled", y > 40);
    if (bar) bar.style.setProperty("--p", h > 0 ? (y / h).toFixed(4) : 0);

    if (!reduce) {
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        const py = Math.max(-36, Math.min(36, c * -40));
        el.style.setProperty("--py", py.toFixed(1) + "px");
      });
      if (process) {
        const r = process.getBoundingClientRect();
        const start = innerHeight * 0.7;
        const end = innerHeight * 0.25;
        let p = (start - r.top) / (r.height + start - end);
        p = Math.max(0, Math.min(1, p));
        process.style.setProperty("--p", p.toFixed(3));
      }
    } else if (process) {
      process.style.setProperty("--p", "1");
    }
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.querySelector(".menu-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", open);
      nav.classList.toggle("open", open);
      document.body.classList.toggle("menu-open", open);
    });
    document.querySelectorAll("#menu a").forEach((a) =>
      a.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("open");
        document.body.classList.remove("menu-open");
      })
    );
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        toggle.click();
        toggle.focus();
      }
    });
  }

  // Scroll reveals
  const items = [...document.querySelectorAll(".reveal")];
  if (!reduce && "IntersectionObserver" in window) {
    items.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty("--d", (i * 0.08).toFixed(2) + "s");
    });
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  // Stat counters
  const counters = [...document.querySelectorAll("[data-count]")];
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (reduce) {
      const n = decimals ? target.toFixed(decimals) : (el.dataset.sep === "0" ? String(Math.round(target)) : Math.round(target).toLocaleString());
      el.textContent = prefix + n + suffix;
      return;
    }
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = target * eased;
      const n = decimals ? val.toFixed(decimals) : Math.round(val);
      const formatted = decimals || el.dataset.sep === "0" ? n : Number(n).toLocaleString();
      el.textContent = prefix + formatted + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            runCounter(e.target);
            cio.unobserve(e.target);
          }
        }),
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  // Magnetic buttons + pointer-fine effects
  if (fine && !reduce) {
    document.querySelectorAll(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", () => {
        b.style.setProperty("--mx", "0px");
        b.style.setProperty("--my", "0px");
      });
    });
  }

  // Draggable auto-sliding rail (gallery + services)
  const bindRail = (rail) => {
    if (!rail) return;
    const track = rail.querySelector(".rail-track");
    if (!track) return;
    let paused = false;
    let drag = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const speed = parseFloat(rail.dataset.speed || "0.45");

    const auto = () => {
      if (!paused && !reduce && !drag) {
        const max = track.scrollWidth - track.clientWidth;
        if (max > 4) {
          if (track.scrollLeft >= max - 1) track.scrollLeft = 0;
          else track.scrollLeft += speed;
        }
      }
      requestAnimationFrame(auto);
    };
    if (!reduce) requestAnimationFrame(auto);

    rail.addEventListener("pointerenter", () => { paused = true; });
    rail.addEventListener("pointerleave", () => { if (!drag) paused = false; });
    rail.addEventListener("focusin", () => { paused = true; });
    rail.addEventListener("focusout", () => { if (!rail.contains(document.activeElement)) paused = false; });

    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = true;
      moved = false;
      paused = true;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.classList.add("dragging");
      try { track.setPointerCapture(e.pointerId); } catch (_) {}
    });
    track.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    const endDrag = (e) => {
      if (!drag) return;
      drag = false;
      track.classList.remove("dragging");
      if (e && e.target && e.target.closest && moved) {
        track.dataset.suppressClick = "1";
        setTimeout(() => delete track.dataset.suppressClick, 80);
      }
      paused = rail.matches(":hover");
    };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("click", (e) => {
      if (track.dataset.suppressClick) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  };
  document.querySelectorAll("[data-rail]").forEach(bindRail);

  // Review carousel
  const slider = document.querySelector("[data-reviews]");
  if (slider) {
    const slides = [...slider.querySelectorAll(".review")];
    const prev = slider.querySelector(".rev-prev");
    const next = slider.querySelector(".rev-next");
    const dots = slider.querySelector(".rev-dots");
    let i = 0;
    let timer;
    slides.forEach((_, n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show review " + (n + 1));
      b.addEventListener("click", () => go(n, true));
      dots.appendChild(b);
    });
    const go = (n, user) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("active", k === i));
      [...dots.children].forEach((d, k) => d.setAttribute("aria-current", k === i ? "true" : "false"));
      if (user) restart();
    };
    const restart = () => {
      clearInterval(timer);
      if (!reduce) timer = setInterval(() => go(i + 1), 7000);
    };
    prev.addEventListener("click", () => go(i - 1, true));
    next.addEventListener("click", () => go(i + 1, true));
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(i - 1, true);
      if (e.key === "ArrowRight") go(i + 1, true);
    });
    go(0);
    restart();
    slider.addEventListener("pointerenter", () => clearInterval(timer));
    slider.addEventListener("pointerleave", restart);
  }

  // Lightbox
  const dlg = document.querySelector(".lightbox");
  if (dlg && typeof dlg.showModal === "function") {
    const all = [...document.querySelectorAll("a.lb")];
    const img = dlg.querySelector("img");
    const cap = dlg.querySelector("figcaption");
    let idx = 0;
    let opener = null;
    const show = (n) => {
      idx = (n + all.length) % all.length;
      const a = all[idx];
      const t = a.querySelector("img");
      img.src = a.getAttribute("href");
      img.alt = t ? t.alt : "";
      cap.textContent = a.dataset.caption || (t ? t.alt : "");
    };
    all.forEach((a, n) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        opener = a;
        show(n);
        dlg.showModal();
      })
    );
    dlg.querySelector(".lb-close").addEventListener("click", () => dlg.close());
    dlg.querySelector(".lb-prev").addEventListener("click", () => show(idx - 1));
    dlg.querySelector(".lb-next").addEventListener("click", () => show(idx + 1));
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    dlg.addEventListener("close", () => {
      img.removeAttribute("src");
      opener && opener.focus();
    });
  }

  // Quote form — preview only, do not email the business
  const form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      form.classList.add("sent");
      const success = form.querySelector(".form-success");
      if (success) {
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }
})();
