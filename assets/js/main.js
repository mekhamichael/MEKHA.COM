(function () {
  "use strict";

  /* ===== Shared Utils ===== */
  /* --- Idle Scheduler --- */
  function deferUntilIdle(callback, timeout) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: timeout || 1200 });
    } else {
      setTimeout(callback, 250);
    }
  }

  /* --- Header Scroll State --- */
  function toggleScrolled() {
    const body = document.body;
    const header = document.querySelector("#header");
    if (!header) return;
    if (
      !header.classList.contains("scroll-up-sticky") &&
      !header.classList.contains("sticky-top") &&
      !header.classList.contains("fixed-top")
    ) {
      return;
    }
    window.scrollY > 100 ? body.classList.add("scrolled") : body.classList.remove("scrolled");
  }

  /* ===== Header/Nav ===== */
  /* --- Mobile Nav Toggle --- */
  function mobileNavToogle() {
    const btn = document.querySelector(".mobile-nav-toggle");
    if (!btn) return;
    document.body.classList.toggle("mobile-nav-active");
    btn.classList.toggle("bi-list");
    btn.classList.toggle("bi-x");
  }

  /* --- Scroll Top Visibility --- */
  function toggleScrollTop() {
    const scrollTop = document.querySelector(".scroll-top");
    if (!scrollTop) return;
    window.scrollY > 100 ? scrollTop.classList.add("active") : scrollTop.classList.remove("active");
  }

  /* --- AOS Init --- */
  function aosInit() {
    if (typeof AOS === "undefined") return;
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  }

  /* --- Swiper Init --- */
  function initSwiper() {
    if (typeof Swiper === "undefined") return;
    document.querySelectorAll(".init-swiper").forEach((swiperElement) => {
      const speed = parseInt(swiperElement.dataset.swiperSpeed || "400", 10);
      const delay = parseInt(swiperElement.dataset.swiperDelay || "5000", 10);

      const config = {
        loop: true,
        speed: Number.isFinite(speed) ? speed : 400,
        autoplay: {
          delay: Number.isFinite(delay) ? delay : 5000
        },
        slidesPerView: "auto",
        pagination: {
          el: ".swiper-pagination",
          type: "bullets",
          clickable: true
        }
      };

      const swiperInstance = new Swiper(swiperElement, config);
      swiperElement._swiperInstance = swiperInstance;
    });
  }

  /* --- Navigation Links / ScrollSpy --- */
  function initNavLinks() {
    const navLinks = document.querySelectorAll('.navmenu a[href^="#"]');

    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        const header = document.getElementById("header");

        if (targetElement && header) {
          // Ensure target section is visible when section visibility mode is enabled.
          if (document.body.classList.contains("section-visibility-enabled")) {
            targetElement.classList.add("section-in-view");
          }

          const targetPosition = targetElement.offsetTop - header.offsetHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
          });

          if (targetId === "portfolio" || targetId === "contact") {
            setTimeout(refreshPortfolioLayout, 250);
            setTimeout(refreshPortfolioLayout, 700);
          }

          navLinks.forEach((navLink) => navLink.classList.remove("active"));
          this.classList.add("active");

          if (document.querySelector(".mobile-nav-active")) {
            mobileNavToogle();
          }
        }
      });
    });

    window.addEventListener("scroll", function () {
      const sections = document.querySelectorAll("section[id]");
      const scrollPosition = window.scrollY + 100;
      let currentSection = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = sectionId || "";
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSection}`) {
          link.classList.add("active");
        }
      });
    });
  }

  /* --- Portfolio + Contact Layout Refresh --- */
  function refreshPortfolioLayout() {
    const portfolio = document.getElementById("portfolio");
    if (portfolio) {
      portfolio.querySelectorAll("[data-aos]").forEach((el) => {
        el.classList.add("aos-animate");
      });
    }
    const contact = document.getElementById("contact");
    if (contact) {
      contact.querySelectorAll("[data-aos]").forEach((el) => {
        el.classList.add("aos-animate");
      });
    }

    document.querySelectorAll(".isotope-layout").forEach((isotopeItem) => {
      const instance = isotopeItem._isotopeInstance;
      if (!instance) return;

      const active = isotopeItem.querySelector(".isotope-filters .filter-active");
      const activeFilter = active ? active.getAttribute("data-filter") : "*";
      instance.arrange({ filter: activeFilter });
      instance.layout();
    });

    document.querySelectorAll(".portfolio-details-slider").forEach((slider) => {
      const swiperInstance = slider._swiperInstance;
      if (swiperInstance && typeof swiperInstance.update === "function") {
        swiperInstance.update();
      }
    });
  }

  /* ===== Resume Section ===== */
  /* --- Resume PDF Toggle --- */
  function initResumePdfToggle() {
    const toggleBtn = document.getElementById("toggleBtn");
    const pdfViewer = document.getElementById("pdf-viewer");
    if (!toggleBtn || !pdfViewer) return;

    toggleBtn.addEventListener("click", () => {
      const isOpen = pdfViewer.classList.toggle("is-open");
      pdfViewer.classList.remove("pdf-animate");
      if (isOpen) {
        // Restart the entry animation each time it opens.
        void pdfViewer.offsetWidth;
        pdfViewer.classList.add("pdf-animate");
      }
      toggleBtn.textContent = isOpen ? "CANCEL" : "SHOW CV";
    });
  }

  /* ===== Portfolio Media ===== */
  /* --- Video Attribute Optimizations --- */
  function optimizeVideos() {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.setAttribute("preload", "none");
      video.removeAttribute("autoplay");
      video.setAttribute("playsinline", "");
    });
  }

  /* --- Section Visibility Controller --- */
  function initSectionVisibilityControl() {
    const main = document.querySelector(".main");
    if (!main) return;
    if (typeof IntersectionObserver === "undefined") return;

    const sections = main.querySelectorAll(":scope > section:not(#portfolio):not(#contact)");
    if (!sections.length) return;

    document.body.classList.add("section-visibility-enabled");
    const portfolioSection = document.getElementById("portfolio");
    if (portfolioSection) {
      portfolioSection.classList.add("section-in-view");
    }
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.classList.add("section-in-view");
    }
    const hideTimers = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target;
          const existingTimer = hideTimers.get(section);

          if (entry.isIntersecting) {
            if (existingTimer) {
              clearTimeout(existingTimer);
              hideTimers.delete(section);
            }
            section.classList.add("section-in-view");
          } else {
            if (existingTimer) clearTimeout(existingTimer);
            const timer = setTimeout(() => {
              section.classList.remove("section-in-view");
              hideTimers.delete(section);
            }, 1000);
            hideTimers.set(section, timer);
          }
        });
      },
      {
        root: null,
        // Use a low threshold so very tall sections (like portfolio) still count as visible.
        threshold: 0.01
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ===== Portfolio Device Switcher ===== */
  /* --- Desktop/Mobile Media Switcher --- */
  function initPortfolioVideoSwitchers() {
    const sliders = document.querySelectorAll(".portfolio-details-slider");
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll(".swiper-wrapper > .swiper-slide"));
      if (!slides.length) return;

      slider.classList.add("portfolio-device-switcher");
      const swiperInstance = slider._swiperInstance;

      slides.forEach((slide, index) => {
        const isMobile = slide.classList.contains("mob");
        slide.dataset.device = isMobile ? "mobile" : index === 0 ? "desktop" : "mobile";

        if (!slide.querySelector(".portfolio-device-frame")) {
          const frame = document.createElement("div");
          frame.className = "portfolio-device-frame";
          while (slide.firstChild) frame.appendChild(slide.firstChild);
          slide.appendChild(frame);
        }

        slide.querySelectorAll("video").forEach((video) => {
          const poster = (video.getAttribute("poster") || "").trim();
          if (!poster || poster.endsWith("/")) {
            video.setAttribute("poster", "assets/img/logo.png");
          }
          video.setAttribute("preload", "none");
          video.setAttribute("playsinline", "");
        });
      });

      const desktopIndex = slides.findIndex((slide) => slide.dataset.device === "desktop");
      let mobileIndex = slides.findIndex((slide) => slide.dataset.device === "mobile");
      if (mobileIndex === -1 && slides.length > 1) mobileIndex = 1;

      if (!slider.dataset.switcherId) {
        slider.dataset.switcherId = `switcher-${Math.random().toString(36).slice(2, 10)}`;
      }
      const switcherId = slider.dataset.switcherId;

      const existingControls = slider.parentElement
        ? slider.parentElement.querySelector(`.device-switch-controls[data-switch-for="${switcherId}"]`)
        : null;
      const controls = existingControls || document.createElement("div");
      if (!existingControls) {
        controls.className = "device-switch-controls";
        controls.setAttribute("data-switch-for", switcherId);
        controls.innerHTML = `
          <button type="button" class="device-switch-btn active" data-device-btn="desktop" aria-label="Desktop view">
            <i class="bi bi-display"></i><span>Desktop</span>
          </button>
          <button type="button" class="device-switch-btn" data-device-btn="mobile" aria-label="Mobile view">
            <i class="bi bi-phone"></i><span>Mobile</span>
          </button>
        `;
        slider.insertAdjacentElement("afterend", controls);
      }

      const pagination = slider.querySelector(".swiper-pagination");
      if (pagination) pagination.style.display = "none";

      const desktopBtn = controls.querySelector('[data-device-btn="desktop"]');
      const mobileBtn = controls.querySelector('[data-device-btn="mobile"]');
      if (!desktopBtn || !mobileBtn) return;

      const setActiveButton = (device) => {
        desktopBtn.classList.toggle("active", device === "desktop");
        mobileBtn.classList.toggle("active", device === "mobile");
        desktopBtn.setAttribute("aria-pressed", device === "desktop" ? "true" : "false");
        mobileBtn.setAttribute("aria-pressed", device === "mobile" ? "true" : "false");
        slider.classList.toggle("device-mobile", device === "mobile");
        slider.classList.toggle("device-desktop", device !== "mobile");
      };

      const getPreferredDeviceForViewport = () => {
        const mobileViewport = window.matchMedia("(max-width: 767px)").matches;
        if (mobileViewport) return mobileIndex >= 0 ? "mobile" : "desktop";
        return desktopIndex >= 0 ? "desktop" : "mobile";
      };

      const restartSelectedVideo = (targetIndex) => {
        slider.querySelectorAll("video").forEach((video) => {
          try {
            video.pause();
            video.currentTime = 0;
          } catch (error) {
            // Ignore media reset errors on blocked states.
          }
        });

        const selectedSlide = slides[targetIndex];
        if (!selectedSlide) return;
        const targetVideo = selectedSlide.querySelector("video");
        if (!targetVideo) return;

        setTimeout(() => {
          try {
            targetVideo.currentTime = 0;
            const playPromise = targetVideo.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(() => {});
            }
          } catch (error) {
            // Playback can be blocked by browser policy.
          }
        }, 320);
      };

      const showDeviceSlide = (device, autoplayOnSwitch) => {
        const targetIndex = device === "mobile" ? mobileIndex : desktopIndex;
        if (targetIndex < 0) return;

        setActiveButton(device);

        if (swiperInstance) {
          slides.forEach((slide) => {
            slide.style.display = "";
          });
          if (typeof swiperInstance.slideToLoop === "function") {
            swiperInstance.slideToLoop(targetIndex, 300);
          } else {
            swiperInstance.slideTo(targetIndex, 300);
          }
        } else {
          slides.forEach((slide, index) => {
            slide.style.display = index === targetIndex ? "" : "none";
          });
        }

        if (autoplayOnSwitch) {
          restartSelectedVideo(targetIndex);
        }
      };

      desktopBtn.disabled = desktopIndex < 0;
      mobileBtn.disabled = mobileIndex < 0;

      if (!desktopBtn.dataset.boundClick) {
        desktopBtn.addEventListener("click", () => showDeviceSlide("desktop", true));
        desktopBtn.dataset.boundClick = "true";
      }
      if (!mobileBtn.dataset.boundClick) {
        mobileBtn.addEventListener("click", () => showDeviceSlide("mobile", true));
        mobileBtn.dataset.boundClick = "true";
      }

      showDeviceSlide(getPreferredDeviceForViewport(), false);

      if (!slider.dataset.boundViewportSync) {
        let viewportTimer = null;
        window.addEventListener("resize", () => {
          clearTimeout(viewportTimer);
          viewportTimer = setTimeout(() => {
            showDeviceSlide(getPreferredDeviceForViewport(), false);
          }, 120);
        });
        slider.dataset.boundViewportSync = "true";
      }
    });
  }

  /* ===== Portfolio Filters ===== */
  /* --- Mobile Filter Slider Controls --- */
  function initPortfolioFilterSlider() {
    const filterLists = document.querySelectorAll(".portfolio .portfolio-filters.isotope-filters");
    if (!filterLists.length) return;

    filterLists.forEach((list) => {
      if (list.closest(".portfolio-filters-slider")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "portfolio-filters-slider";

      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "portfolio-filter-nav prev";
      prevBtn.setAttribute("aria-label", "Previous filters");
      prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "portfolio-filter-nav next";
      nextBtn.setAttribute("aria-label", "Next filters");
      nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';

      list.parentNode.insertBefore(wrapper, list);
      wrapper.appendChild(prevBtn);
      wrapper.appendChild(list);
      wrapper.appendChild(nextBtn);

      const getItems = () => Array.from(list.querySelectorAll("li"));

      const centerItemInSlider = (item) => {
        if (!item) return;
        if (!window.matchMedia("(max-width: 767px)").matches) return;
        const targetLeft = item.offsetLeft - (list.clientWidth / 2) + (item.clientWidth / 2);
        const maxLeft = Math.max(0, list.scrollWidth - list.clientWidth);
        const nextLeft = Math.min(maxLeft, Math.max(0, targetLeft));
        list.scrollTo({ left: nextLeft, behavior: "smooth" });
      };

      const getActiveIndex = () => {
        const items = getItems();
        return items.findIndex((item) => item.classList.contains("filter-active"));
      };

      const updateButtonsState = () => {
        const items = getItems();
        if (!items.length) {
          prevBtn.disabled = true;
          nextBtn.disabled = true;
          return;
        }
        const activeIndex = getActiveIndex();
        prevBtn.disabled = activeIndex <= 0;
        nextBtn.disabled = activeIndex === -1 || activeIndex >= items.length - 1;
      };

      const moveActive = (direction) => {
        const items = getItems();
        if (!items.length) return;

        const activeIndex = getActiveIndex();
        const baseIndex = activeIndex === -1 ? 0 : activeIndex;
        const nextIndex = Math.min(items.length - 1, Math.max(0, baseIndex + direction));
        if (nextIndex === activeIndex) return;

        items[nextIndex].click();
        centerItemInSlider(items[nextIndex]);
        updateButtonsState();
      };

      prevBtn.addEventListener("click", () => moveActive(-1));
      nextBtn.addEventListener("click", () => moveActive(1));

      list.addEventListener("click", (event) => {
        const target = event.target.closest("li");
        if (!target) return;
        setTimeout(() => {
          centerItemInSlider(target);
          updateButtonsState();
        }, 0);
      });

      list.addEventListener("scroll", updateButtonsState, { passive: true });
      window.addEventListener("resize", () => {
        const items = getItems();
        const activeIndex = getActiveIndex();
        if (activeIndex >= 0) centerItemInSlider(items[activeIndex]);
        updateButtonsState();
      });

      setTimeout(() => {
        const items = getItems();
        const activeIndex = getActiveIndex();
        if (activeIndex >= 0) centerItemInSlider(items[activeIndex]);
        updateButtonsState();
      }, 0);
    });
  }

  /* ===== DOMContentLoaded Boot ===== */
  document.addEventListener("DOMContentLoaded", function () {
    toggleScrolled();
    initSectionVisibilityControl();
    initResumePdfToggle();

    /* --- Mobile Nav Events --- */
    const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");
    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.addEventListener("click", mobileNavToogle);
    }

    document.querySelectorAll("#navmenu a").forEach((navmenu) => {
      navmenu.addEventListener("click", () => {
        if (document.querySelector(".mobile-nav-active")) {
          mobileNavToogle();
        }
      });
    });

    document.querySelectorAll(".navmenu .toggle-dropdown").forEach((navmenu) => {
      navmenu.addEventListener("click", function (e) {
        e.preventDefault();
        this.parentNode.classList.toggle("active");
        this.parentNode.nextElementSibling.classList.toggle("dropdown-active");
        e.stopImmediatePropagation();
      });
    });

    /* --- Scroll Top Event --- */
    const scrollTop = document.querySelector(".scroll-top");
    if (scrollTop) {
      scrollTop.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }

    /* --- Image Loading Optimization --- */
    document.querySelectorAll("img").forEach((img) => {
      if (!img.closest("#hero") && !img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      if (!img.hasAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }
    });

    /* --- External Link Hardening --- */
    document.querySelectorAll('a[href]').forEach((link) => {
      if (!link.href.startsWith(window.location.origin) && !link.href.startsWith("#")) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    /* --- Immediate Portfolio Initializers --- */
    optimizeVideos();
    initPortfolioVideoSwitchers();
    initPortfolioFilterSlider();

    /* --- Deferred Non-Critical Initializers --- */
    deferUntilIdle(() => {
      if (typeof Typed !== "undefined") {
        const selectTyped = document.querySelector(".typed");
        if (selectTyped) {
          let typedStrings = selectTyped.getAttribute("data-typed-items") || "";
          typedStrings = typedStrings.split(",").map((s) => s.trim()).filter(Boolean);
          if (typedStrings.length) {
            new Typed(".typed", {
              strings: typedStrings,
              loop: true,
              typeSpeed: 100,
              backSpeed: 50,
              backDelay: 2000
            });
          }
        }
      }

      if (typeof Waypoint !== "undefined") {
        document.querySelectorAll(".skills-animation").forEach((item) => {
          new Waypoint({
            element: item,
            offset: "80%",
            handler: function () {
              item.querySelectorAll(".progress .progress-bar").forEach((el) => {
                el.style.width = `${el.getAttribute("aria-valuenow")}%`;
              });
            }
          });
        });
      }

      if (typeof PureCounter !== "undefined") {
        new PureCounter();
      }

      if (typeof GLightbox !== "undefined") {
        GLightbox({ selector: ".glightbox" });
      }

      /* --- Isotope Init + Filter Events --- */
      document.querySelectorAll(".isotope-layout").forEach((isotopeItem) => {
        if (typeof imagesLoaded === "undefined" || typeof Isotope === "undefined") return;
        const layout = isotopeItem.getAttribute("data-layout") || "masonry";
        const filter = isotopeItem.getAttribute("data-default-filter") || "*";
        const sort = isotopeItem.getAttribute("data-sort") || "original-order";

        let initIsotope;
        const container = isotopeItem.querySelector(".isotope-container");
        if (!container) return;

        imagesLoaded(container, function () {
          initIsotope = new Isotope(container, {
            itemSelector: ".isotope-item",
            layoutMode: layout,
            filter: filter,
            sortBy: sort
          });
          isotopeItem._isotopeInstance = initIsotope;
          setTimeout(refreshPortfolioLayout, 150);
        });

        isotopeItem.querySelectorAll(".isotope-filters li").forEach((filters) => {
          filters.addEventListener("click", function () {
            const active = isotopeItem.querySelector(".isotope-filters .filter-active");
            if (active) active.classList.remove("filter-active");
            this.classList.add("filter-active");
            if (initIsotope) {
              initIsotope.arrange({ filter: this.getAttribute("data-filter") });
            }
            aosInit();
            setTimeout(refreshPortfolioLayout, 80);
          });
        });
      });

      /* --- FAQ Toggle Events --- */
      document.querySelectorAll(".faq-item h3, .faq-item .faq-toggle").forEach((faqItem) => {
        faqItem.addEventListener("click", () => {
          faqItem.parentNode.classList.toggle("faq-active");
        });
      });
    }, 1600);
  });

  /* ===== Window Load Boot ===== */
  window.addEventListener("load", function () {
    toggleScrollTop();
    initNavLinks();
    /* --- Deferred Visual Initializers --- */
    deferUntilIdle(() => {
      aosInit();
      initSwiper();
      initPortfolioVideoSwitchers();
      initPortfolioFilterSlider();
      refreshPortfolioLayout();
    }, 1800);

    /* --- Hash Deep-Link Scroll Fix --- */
    if (window.location.hash) {
      const section = document.querySelector(window.location.hash);
      if (section) {
        setTimeout(() => {
          const scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop, 10),
            behavior: "smooth"
          });
        }, 100);
      }
    }
  });

  /* ===== Global Runtime Events ===== */
  document.addEventListener("scroll", toggleScrolled);
  document.addEventListener("scroll", toggleScrollTop);
  window.addEventListener("resize", () => {
    setTimeout(refreshPortfolioLayout, 120);
  });
})();
