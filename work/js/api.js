window.ContactHubAPI = (() => {
    const API_BASE = "LAMPAPI/";
    const SESSION_KEY = "contactHubUser";

    async function request(endpoint, payload) {
        const response = await fetch(API_BASE + endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        let data = {};

        if (rawText) {
            try {
                data = JSON.parse(rawText);
            } catch (error) {
                throw new Error("The server returned an unexpected response.");
            }
        }

        if (!response.ok) {
            throw new Error(data.error || "The request failed.");
        }

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    }

    function login(loginName, password) {
        return request("Login.php", {
            login: loginName,
            password: password
        });
    }

    function register(firstName, lastName, loginName, password) {
        return request("Register.php", {
            firstName: firstName,
            lastName: lastName,
            login: loginName,
            password: password
        });
    }

    function searchContacts(searchTerm, userId) {
        return request("Search.php", {
            Search: searchTerm,
            UserID: Number(userId)
        });
    }

    function createContact(contact, userId) {
        return request("Create.php", {
            FirstName: contact.firstName,
            LastName: contact.lastName,
            Email: contact.email,
            Phone: contact.phone,
            UserID: Number(userId)
        });
    }

    function deleteContact(contactId, userId) {
        return request("Delete.php", {
            ID: Number(contactId),
            UserID: Number(userId)
        });
    }

    function updateContact(contact, userId) {
        return request("Update.php", {
            ID: Number(contact.id),
            UserID: Number(userId),
            FirstName: contact.firstName,
            LastName: contact.lastName,
            Email: contact.email,
            Phone: contact.phone
        });
    }

    function saveUser(user) {
        const sessionUser = {
            id: Number(user.id),
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            login: user.login || ""
        };

        clearUser();
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    }

    function readStoredUser() {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (!stored) {
            return null;
        }

        try {
            const user = JSON.parse(stored);
            return Number(user.id) > 0 ? user : null;
        } catch (error) {
            clearUser();
            return null;
        }
    }

    function getUser() {
        return readStoredUser();
    }

    function clearUser() {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
    }

    return {
        login,
        register,
        searchContacts,
        createContact,
        deleteContact,
        updateContact,
        saveUser,
        getUser,
        clearUser
    };
})();
