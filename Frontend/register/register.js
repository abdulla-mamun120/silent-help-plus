
document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("dark-mode-toggle");

    if (!toggle) return;

    // load saved theme
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        toggle.textContent = "☀️";
    }

    toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode"); 

        const isDark = document.body.classList.contains("dark-mode");

        if (isDark) {
            localStorage.setItem("darkMode", "enabled");
            toggle.textContent = "☀️";
        } else {
            localStorage.setItem("darkMode", "disabled");
            toggle.textContent = "🌙";
        }
    });

});