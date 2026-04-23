document.addEventListener("DOMContentLoaded", function () {
    // Configuration - dynamic based on screen size
    let itemsPerSlide = window.innerWidth < 720 ? 1 : 3; // Responsive items per slide
    const totalItems = 5; // Total real items (without clones)
    let slideBy = window.innerWidth < 720 ? 1 : 1; // How many items to advance/retreat per click
  
    // DOM elements
    const carousel = document.getElementById("multiCarousel");
    const carouselInner = document.getElementById("carouselInner");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
  
    // Function to update configuration based on screen size
    function updateConfig() {
      const isMobile = window.innerWidth < 720;
      itemsPerSlide = isMobile ? 1 : 3;
      slideBy = isMobile ? 1 : 1;
    }
  
    // Dynamically add clone elements
    function initializeClones() {
      const originalItems = Array.from(
        document.querySelectorAll(".multi-carousel-item:not(.clone)")
      );
  
      // Clear existing clones
      document.querySelectorAll(".clone").forEach((clone) => clone.remove());
  
      // Prepend clones of last items
      const lastClones = originalItems
        .slice(-itemsPerSlide)
        .map((item) => {
          const clone = item.cloneNode(true);
          clone.classList.add("clone");
          return clone;
        })
        .reverse();
      lastClones.forEach((clone) => carouselInner.prepend(clone));
  
      // Append clones of first items
      const firstClones = originalItems.slice(0, itemsPerSlide).map((item) => {
        const clone = item.cloneNode(true);
        clone.classList.add("clone");
        return clone;
      });
      firstClones.forEach((clone) => carouselInner.append(clone));
    }
  
    // Calculate and set the height for carousel items (without heading dependency)
    function setCarouselHeight() {
      // Calculate available height without depending on heading element
      const windowHeight = window.innerHeight;
      const carouselContainer = carousel.closest(".container-fluid");
  
      // Get the carousel container's offset from top
      const containerRect = carouselContainer
        ? carouselContainer.getBoundingClientRect()
        : { top: 0 };
      const availableHeight = windowHeight - containerRect.top - 100; // 100px for padding/margins
  
      // Set a minimum height to ensure carousel is always visible
      const carouselHeight = Math.max(availableHeight, 300);
  
      document.documentElement.style.setProperty(
        "--carousel-height",
        `${carouselHeight}px`
      );
    }
  
    // Initial setup
    updateConfig();
    initializeClones();
    setCarouselHeight();
  
    // Start with the first real set of images
    let currentIndex = 0; // Index of current visible center image (0 to totalItems-1)
    let position = itemsPerSlide; // Real position considering clones
    let isAnimating = false;
  
    // Update carousel position
    function updateCarouselPosition(animate = true) {
      if (animate) {
        carouselInner.style.transition = "transform 0.5s ease";
      } else {
        carouselInner.style.transition = "none";
      }
  
      const translateX = (position * -100) / itemsPerSlide;
      carouselInner.style.transform = `translateX(${translateX}%)`;
    }
  
    // Initialize position
    updateCarouselPosition(false);
  
    // Handle transition end
    carouselInner.addEventListener("transitionend", function () {
      isAnimating = false;
  
      // Handle infinite loop logic
      if (position >= totalItems + itemsPerSlide) {
        position = itemsPerSlide + (position - (totalItems + itemsPerSlide));
        updateCarouselPosition(false);
      } else if (position < itemsPerSlide) {
        position = totalItems + position;
        updateCarouselPosition(false);
      }
  
      currentIndex = (position - itemsPerSlide) % totalItems;
    });
  
    // Navigation functions
    function next() {
      if (isAnimating) return;
      isAnimating = true;
      position += slideBy;
      updateCarouselPosition();
    }
  
    function prev() {
      if (isAnimating) return;
      isAnimating = true;
      position -= slideBy;
      updateCarouselPosition();
    }
  
    // Event listeners for buttons
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);
  
    // Mouse drag functionality
    let isDragging = false;
    let startX = 0;
    let startPosition = 0;
  
    // Prevent image drag
    const carouselImages = document.querySelectorAll("#carouselInner img");
    carouselImages.forEach((img) => {
      img.addEventListener("dragstart", (e) => {
        e.preventDefault();
      });
      img.style.pointerEvents = "none";
    });
  
    carousel.addEventListener("mousedown", startDrag);
    carousel.addEventListener("touchstart", startDrag, { passive: true });
  
    carousel.addEventListener("mousemove", drag);
    carousel.addEventListener("touchmove", drag, { passive: true });
  
    carousel.addEventListener("mouseup", endDrag);
    carousel.addEventListener("touchend", endDrag);
    carousel.addEventListener("mouseleave", endDrag);
  
    function startDrag(e) {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
      }
  
      if (isAnimating) return;
  
      isDragging = true;
      startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
      startPosition = position;
      carousel.classList.add("dragging");
      carouselInner.style.transition = "none";
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      registerUserActivity();
    }
  
    function drag(e) {
      if (!isDragging) return;
  
      const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
      const walk = ((x - startX) / carousel.offsetWidth) * itemsPerSlide;
      const newPosition = startPosition - walk;
      const translateX = (newPosition * -100) / itemsPerSlide;
      carouselInner.style.transform = `translateX(${translateX}%)`;
    }
  
    function endDrag(e) {
      if (!isDragging) return;
  
      isDragging = false;
      carousel.classList.remove("dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      carouselInner.style.transition = "transform 0.5s ease";
  
      const x = e.type?.includes("mouse")
        ? e.clientX
        : e.changedTouches
        ? e.changedTouches[0].clientX
        : startX;
      const walk = ((x - startX) / carousel.offsetWidth) * itemsPerSlide;
  
      if (walk > 0.2) {
        prev();
      } else if (walk < -0.2) {
        next();
      } else {
        updateCarouselPosition();
      }
  
      registerUserActivity();
    }
  
    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      if (
        carousel.offsetParent === null ||
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable
      ) {
        return;
      }
  
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prev();
          registerUserActivity();
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          registerUserActivity();
          break;
      }
    });
  
    // Auto-advance system
    let autoAdvanceInterval;
    let userActivityTimeout;
  
    function startAutoAdvance() {
      clearInterval(autoAdvanceInterval);
      autoAdvanceInterval = setInterval(next, 5000);
    }
  
    function resetAutoAdvanceTimer() {
      clearTimeout(userActivityTimeout);
      clearInterval(autoAdvanceInterval);
      userActivityTimeout = setTimeout(startAutoAdvance, 10000);
    }
  
    function registerUserActivity() {
      resetAutoAdvanceTimer();
    }
  
    startAutoAdvance();
  
    carousel.addEventListener("mouseenter", () => {
      clearInterval(autoAdvanceInterval);
    });
  
    carousel.addEventListener("mouseleave", () => {
      resetAutoAdvanceTimer();
    });
  
    carousel.addEventListener("click", registerUserActivity);
    carousel.addEventListener("wheel", registerUserActivity);
  
    // Handle window resize
    window.addEventListener("resize", function () {
      const wasMobile = itemsPerSlide === 1;
      updateConfig();
      setCarouselHeight();
  
      // Only reinitialize if mobile state changed
      if (
        (wasMobile && itemsPerSlide > 1) ||
        (!wasMobile && itemsPerSlide === 1)
      ) {
        initializeClones();
        position = itemsPerSlide; // Reset position
        updateCarouselPosition(false);
      }
    });
  });
  