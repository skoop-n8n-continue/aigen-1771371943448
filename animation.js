const CONFIG = {
  cycleDuration: 5, // Seconds to hold the products
  stagger: 0.2,     // Stagger delay
  maxProducts: 3    // Number of slots
};

let products = [];
let currentBatchIndex = 0;

// Positions for the 3 slots
const SLOTS = [
  { x: 380, y: 540 },
  { x: 960, y: 540 },
  { x: 1540, y: 540 }
];

function createProductCard(product) {
  const el = document.createElement("div");
  el.className = "product-card";
  
  // Safe data access
  const images = product.images || [];
  const imageSrc = images.length > 0 ? images[0] : "";
  const name = product.name || "Product";
  const parts = name.split("<br>");
  const brandLine = parts[0];
  const nameLine = parts[1] || "";
  const price = product.price || "";
  const offer = product.offer_qty || "";
  const badge = product.badge || "";

  el.innerHTML = `
    ${badge ? `<div class="badge">${badge}</div>` : ""}
    <div class="image-wrapper">
      <img src="${imageSrc}" class="product-image">
    </div>
    <div class="product-info">
      <div class="product-brand">${brandLine}</div>
      <div class="product-name">${nameLine}</div>
      <div class="price-container">
        <div class="offer-qty">${offer}</div>
        <div class="price">${price}</div>
      </div>
    </div>
  `;
  
  return el;
}

function getNextBatch(startIndex) {
  if (!products.length) return [];
  const batch = [];
  for (let i = 0; i < CONFIG.maxProducts; i++) {
    const p = products[(startIndex + i) % products.length];
    batch.push(p);
  }
  return batch;
}

function animateBatch(startIndex) {
  const container = document.getElementById("products-container");
  const batch = getNextBatch(startIndex);
  const elements = [];

  // Create and append elements
  batch.forEach((p, i) => {
    if (i >= SLOTS.length) return;
    const el = createProductCard(p);
    container.appendChild(el);
    elements.push(el);

    // Initial Set
    gsap.set(el, {
      x: SLOTS[i].x,
      y: 1200, // Start below screen
      opacity: 0,
      scale: 0.8,
      rotation: Math.random() * 4 - 2 // Slight random rotation
    });
  });

  const tl = gsap.timeline({
    onComplete: () => {
      // Clean up DOM
      elements.forEach(el => el.remove());
      // Loop
      const nextIndex = (startIndex + CONFIG.maxProducts) % Math.max(products.length, 1);
      animateBatch(nextIndex);
    }
  });

  // 1. Entrance
  tl.to(elements, {
    duration: 2,
    y: (i) => SLOTS[i].y,
    opacity: 1,
    scale: 1,
    rotation: 0,
    stagger: 0.2,
    ease: "power3.out"
  });

  // 2. Idle (Floating) - using separate tweens for continuous effect
  elements.forEach((el) => {
    // Bobbing
    gsap.to(el, {
      y: "-=15",
      duration: 2 + Math.random(),
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  });

  // 3. Hold
  tl.to({}, { duration: CONFIG.cycleDuration });

  // 4. Exit
  tl.to(elements, {
    duration: 1.5,
    y: -200, // Float up and away
    opacity: 0,
    scale: 0.9,
    stagger: 0.1,
    ease: "power2.in"
  });
}

async function init() {
  try {
    const res = await fetch("products.json");
    const data = await res.json();
    products = data.products || [];

    if (products.length > 0) {
      animateBatch(0);
      initBackgroundEffects();
    }
  } catch (err) {
    console.error("Init failed:", err);
  }
}

function initBackgroundEffects() {
  // Simple particle drift
  const particles = document.querySelectorAll(".particle");
  particles.forEach(p => {
    gsap.to(p, {
      y: "random(-50, 50)",
      x: "random(-50, 50)",
      duration: "random(5, 10)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });
  
  // Ripples
  const ripples = document.querySelectorAll(".ripple");
  gsap.to(ripples, {
    scale: 1.5,
    opacity: 0,
    duration: 4,
    stagger: 2,
    repeat: -1,
    ease: "power1.out"
  });
}

init();
