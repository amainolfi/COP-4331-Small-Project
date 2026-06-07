(function () {
    const THEME_KEY = "theme";

    function applyTheme(theme) {
        const useDarkMode = theme !== "light";
        document.body.classList.toggle("dark-mode", useDarkMode);

        const toggleButton = document.getElementById("themeToggle");
        if (toggleButton) {
            toggleButton.textContent = useDarkMode ? "Light mode" : "Dark mode";
            toggleButton.setAttribute("aria-pressed", String(useDarkMode));
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        applyTheme(localStorage.getItem(THEME_KEY) || "dark");

        const toggleButton = document.getElementById("themeToggle");
        if (!toggleButton) {
            return;
        }

        toggleButton.addEventListener("click", () => {
            const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
            localStorage.setItem(THEME_KEY, nextTheme);
            applyTheme(nextTheme);
        });
    });
})();
