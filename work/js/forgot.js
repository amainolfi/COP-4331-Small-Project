document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgotForm");
    const status = document.getElementById("forgotStatus");

    function setStatus(message, type) {
        status.textContent = message;
        status.className = "status-message" + (type ? " " + type : "");
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const login = document.getElementById("resetLogin").value.trim();
        const password = document.getElementById("resetPassword").value;
        const confirmPassword = document.getElementById("resetConfirmPassword").value;

        if (!login || !password || !confirmPassword) {
            setStatus("Fill out every required field.", "error");
            return;
        }

        if (password !== confirmPassword) {
            setStatus("Passwords do not match.", "error");
            return;
        }

        // TODO: Connect this form when an implemented reset password endpoint is added to LAMPAPI.
        setStatus("Password reset is not available because no reset password API endpoint was found.", "error");
    });
});
