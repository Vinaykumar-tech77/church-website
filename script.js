
// ================= MOBILE MENU =================
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// Close menu when clicking a link (mobile UX)
document.querySelectorAll("#nav-menu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
  });
});


// ================= SMOOTH SCROLL =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
});


// ================= LANGUAGE TOGGLE =================
const languageToggle = document.getElementById("language-toggle");

if (languageToggle) {
  languageToggle.addEventListener("click", () => {

    // If currently English page
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
      window.location.href = "telugu.html";
    } else {
      window.location.href = "index.html";
    }

  });
}


// ================= SCROLL ANIMATIONS =================
const revealElements = document.querySelectorAll(".section, .card");

const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;

  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < triggerBottom) {
      el.classList.add("show");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();


// ================= STICKY HEADER SHADOW =================
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  } else {
    header.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
  }
});


// ================= OPTIONAL: SCROLL TO TOP =================
const scrollBtn = document.createElement("button");
scrollBtn.innerHTML = "↑";
scrollBtn.id = "scrollTopBtn";
document.body.appendChild(scrollBtn);

scrollBtn.style.position = "fixed";
scrollBtn.style.bottom = "20px";
scrollBtn.style.right = "20px";
scrollBtn.style.padding = "10px 15px";
scrollBtn.style.border = "none";
scrollBtn.style.borderRadius = "5px";
scrollBtn.style.background = "#2563eb";
scrollBtn.style.color = "#fff";
scrollBtn.style.cursor = "pointer";
scrollBtn.style.display = "none";

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


// ================= HERO SLIDER =================
const slides = document.querySelectorAll(".hero-slider .slide");
let currentSlide = 0;

function changeSlide() {
  slides[currentSlide].classList.remove("active");

  currentSlide = (currentSlide + 1) % slides.length;

  slides[currentSlide].classList.add("active");
}

// Auto change every 4 seconds
setInterval(changeSlide, 4000);


// ================= FAQ ADVANCED =================
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {
  item.addEventListener("click", () => {

    // Close all others
    faqItems.forEach(el => {
      if (el !== item) {
        el.classList.remove("active");
      }
    });

    // Toggle current
    item.classList.toggle("active");

  });
});


const menuClose = document.getElementById("menu-close");

menuClose.addEventListener("click", () => {
  navMenu.classList.remove("active");
});