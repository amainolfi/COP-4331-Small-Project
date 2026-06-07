document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    const status = document.getElementById("signupStatus");
    const api = window.ContactHubAPI;

    function setStatus(message, type) {
        status.textContent = message;
        status.className = "status-message" + (type ? " " + type : "");
    }

    if (!api) {
        setStatus("Sign up is temporarily unavailable because the API script did not load.", "error");
        form.querySelector("button[type='submit']").disabled = true;
        return;
    }

    // 1. ADDED 'async' HERE SO 'await' CAN LEGALLY RUN
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const firstName = document.getElementById("signupFirstName").value.trim();
        const lastName = document.getElementById("signupLastName").value.trim();
        const login = document.getElementById("signupLogin").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("signupConfirmPassword").value;

        if (!firstName || !lastName || !login || !password) {
            setStatus("Fill out every required field.", "error");
            return;
        }

        if (password !== confirmPassword) {
            setStatus("Passwords do not match.", "error");
            return;
        }

        setStatus("Creating account...", "");

        try {
            // Send data through our newly integrated API module method
            const user = await api.register(firstName, lastName, login, password);

            // 2. CHECK FOR RAW PHP DATABASE RETURNING AN ERROR STRING
            if (user.error) {
                throw new Error(user.error);
            }

            if (!Number(user.id)) {
                throw new Error("Registration failed.");
            }

            // Auto-login the user into their session locally and redirect to dashboard
            api.saveUser({ ...user, login: login });
            window.location.href = "logged.html";
            
        } catch (error) {
            setStatus(error.message, "error");
        }
    });
});
