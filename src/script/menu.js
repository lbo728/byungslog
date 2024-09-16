document.addEventListener("astro:page-load", () => {
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".nav-links").classList.toggle("expanded");
  });
});

document.addEventListener("astro:page-load", () => {
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".nav-links").classList.toggle("expanded");
  });
});
