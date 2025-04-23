document.addEventListener("DOMContentLoaded", () => {
  const createSpaceBtn = document.querySelector(".cta");

  if (createSpaceBtn) {
    createSpaceBtn.addEventListener("click", () => {
      
      window.location.href = "/signup.html";
    });
  }
});
