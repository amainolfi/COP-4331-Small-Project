document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (!form) {
        return;
    }

    const status = document.getElementById("loginStatus");
    const submitButton = form.querySelector("button[type='submit']");
    const api = window.ContactHubAPI;

    function setStatus(message, type) {
        status.textContent = message;
        status.className = "status-message" + (type ? " " + type : "");
    }

    if (!api) {
        setStatus("Login is temporarily unavailable because the API script did not load.", "error");
        submitButton.disabled = true;
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const loginName = document.getElementById("loginName").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!loginName || !password) {
            setStatus("Enter both username and password.", "error");
            return;
        }

        submitButton.disabled = true;
        setStatus("Signing in...", "");

        try {
            const user = await api.login(loginName, password);

            if (!Number(user.id)) {
                throw new Error("Login failed.");
            }

            api.saveUser({ ...user, login: loginName });
            window.location.href = "logged.html";
        } catch (error) {
            setStatus(error.message === "No Records Found" ? "Invalid username or password." : error.message, "error");
        } finally {
            submitButton.disabled = false;
        }
    });
});
