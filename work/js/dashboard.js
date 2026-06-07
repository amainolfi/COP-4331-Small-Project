document.addEventListener("DOMContentLoaded", () => {
    const api = window.ContactHubAPI;
    const welcomeUser = document.getElementById("welcomeUser");
    const logoutButton = document.getElementById("logoutButton");
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const dashboardStatus = document.getElementById("dashboardStatus");
    const contactsGrid = document.getElementById("contactsGrid");
    const emptyState = document.getElementById("emptyState");
    const modal = document.getElementById("contactModal");
    const openModalButton = document.getElementById("openContactModal");
    const closeModalButton = document.getElementById("closeContactModal");
    const cancelContactButton = document.getElementById("cancelContactForm");
    const contactForm = document.getElementById("contactForm");
    const contactFormStatus = document.getElementById("contactFormStatus");

    let searchTimer = null;
    let editingContactId = null;

    if (!api) {
        setStatus(dashboardStatus, "Dashboard is temporarily unavailable because the API script did not load.", "error");
        return;
    }

    const user = api.getUser();
    if (!user) {
        window.location.replace("index.html");
        return;
    }

    welcomeUser.textContent = `Hi, ${user.firstName || user.login || "there"}`;

    function setStatus(element, message, type) {
        element.textContent = message;
        element.className = "status-message" + (element === dashboardStatus ? " dashboard-status" : "") + (type ? " " + type : "");
    }

    function normalizeContact(contact) {
        return {
            id: contact.id || contact.ID,
            firstName: contact.firstName || contact.FirstName || "",
            lastName: contact.lastName || contact.LastName || "",
            email: contact.email || contact.Email || "",
            phone: contact.phone || contact.Phone || "",
            dateCreated: contact.dateCreated || contact.DateCreated || contact.createdAt || contact.CreatedAt || contact.created_at || ""
        };
    }

    function formatDateCreated(value) {
        if (!value) {
            return "Not available";
        }

        const normalizedValue = typeof value === "string" ? value.replace(" ", "T") : value;
        const parsedDate = new Date(normalizedValue);

        if (Number.isNaN(parsedDate.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(parsedDate);
    }

    function renderContacts(contacts) {
        contactsGrid.replaceChildren();
        emptyState.hidden = contacts.length > 0;

        contacts.forEach((contact) => {
            const card = document.createElement("article");
            card.className = "contact-card";

            const header = document.createElement("div");
            header.className = "contact-card-header";

            const titleGroup = document.createElement("div");
            const name = document.createElement("h2");
            name.className = "contact-name";
            name.textContent = `${contact.firstName} ${contact.lastName}`.trim() || "Unnamed Contact";

            const meta = document.createElement("p");
            meta.className = "contact-meta";

            const dateLabel = document.createElement("span");
            dateLabel.className = "contact-date-label";
            dateLabel.textContent = "Date created:";

            const dateValue = document.createElement("span");
            dateValue.className = "contact-date-value";
            dateValue.textContent = formatDateCreated(contact.dateCreated);

            meta.append(dateLabel, dateValue);

            const phoneField = document.createElement("p");
            phoneField.className = "contact-meta";
            phoneField.textContent = contact.phone ? `Phone: ${contact.phone}` : "Phone: Not provided";

            const emailField = document.createElement("p");
            emailField.className = "contact-meta";
            emailField.textContent = contact.email ? `Email: ${contact.email}` : "Email: Not provided";

            const updateButton = document.createElement("button");
            updateButton.className = "update-card-btn"; // Styles match your CSS
            updateButton.type = "button";
            updateButton.textContent = "Update";
            //updateButton.style.marginRight = "8px"; // Quick spacing separation
            updateButton.addEventListener("click", () => openEditModal(contact));
            
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-card-btn";
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteContact(contact));
            

            titleGroup.append(name, meta);
            header.append(titleGroup, updateButton, deleteButton); 
            //header.append(titleGroup, updateButton, deleteButton);
            card.append(header, phoneField, emailField);
            contactsGrid.append(card);
        });
    }

    async function loadContacts() {
        const term = searchInput.value.trim();
        setStatus(dashboardStatus, "Loading contacts...", "");

        try {
            const data = await api.searchContacts(term, user.id);
            const contacts = Array.isArray(data.results) ? data.results.map(normalizeContact) : [];
            renderContacts(contacts);
            setStatus(dashboardStatus, "", "");
        } catch (error) {
            renderContacts([]);
            setStatus(dashboardStatus, error.message, "error");
        }
    }

    function openModal() {
        contactForm.reset();
        modal.querySelector("h2").textContent = "Add Contact"; // Reset title
        contactForm.querySelector("button[type='submit']").textContent = "Save Contact"; // Reset button
        setStatus(contactFormStatus, "", "");
        editingContactId = null; // Clear ID so it stays in "Create" mode
        modal.hidden = false;
        document.getElementById("contactFirstName").focus();
    }

    function openEditModal(contact) {
        // Pre-fill the form inputs with current data
        document.getElementById("contactFirstName").value = contact.firstName;
        document.getElementById("contactLastName").value = contact.lastName;
        document.getElementById("contactEmail").value = contact.email;
        document.getElementById("contactPhone").value = contact.phone;

        // Change the modal header title text and submit button text
        modal.querySelector("h2").textContent = "Update Contact";
        contactForm.querySelector("button[type='submit']").textContent = "Save Changes";

        setStatus(contactFormStatus, "", "");
        editingContactId = contact.id; // Store the ID so our submit knows it's an update
        modal.hidden = false;
    }

    function closeModal() {
        modal.hidden = true;
    }

    function validateContact(contact) {
            if (!contact.firstName || !contact.lastName || !contact.email || !contact.phone) {
                return "Fill out every contact field.";
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
                return "Enter a valid email address.";
            }

            // Strict validation: Must contain EXACTLY 10 digits. No spaces, symbols, or letters.
            if (!/^\d{10}$/.test(contact.phone)) {
                return "Phone number must be exactly 10 numeric digits.";
            }

            return "";
        }

    async function deleteContact(contact) {
        const contactName = `${contact.firstName} ${contact.lastName}`.trim() || "this contact";
        if (!window.confirm(`Delete ${contactName}?`)) {
            return;
        }

        setStatus(dashboardStatus, "Deleting contact...", "");

        try {
            await api.deleteContact(contact.id, user.id);
            setStatus(dashboardStatus, "Contact deleted.", "success");
            await loadContacts();
        } catch (error) {
            setStatus(dashboardStatus, error.message, "error");
        }
    }
    async function executeContactUpdate(updatedContactData, currentUserId) {
        // 1. Leverage existing client validation rules directly
        const validationMessage = validateContact(updatedContactData);
        if (validationMessage) {
            setStatus(contactFormStatus, validationMessage, "error");
            return;
        }

        try {
            // 2. Dispatch straight to API without displaying a window.confirm popup dialog layout
            await api.updateContact(updatedContactData, currentUserId);
            
            setStatus(dashboardStatus, "Contact updated successfully.", "success");
            await loadContacts(); // Refresh UI layout grid view
        } catch (error) {
            setStatus(contactFormStatus, error.message, "error");
        }
    }

    logoutButton.addEventListener("click", () => {
        api.clearUser();
        window.location.href = "index.html";
    });

    openModalButton.addEventListener("click", openModal);
    closeModalButton.addEventListener("click", closeModal);
    cancelContactButton.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        loadContacts();
    });

    searchInput.addEventListener("input", () => {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(loadContacts, 250);
    });

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const contact = {
            firstName: document.getElementById("contactFirstName").value.trim(),
            lastName: document.getElementById("contactLastName").value.trim(),
            email: document.getElementById("contactEmail").value.trim(),
            phone: document.getElementById("contactPhone").value.trim()
        };

        const validationMessage = validateContact(contact);
        if (validationMessage) {
            setStatus(contactFormStatus, validationMessage, "error");
            return;
        }

        const submitButton = contactForm.querySelector("button[type='submit']");
        submitButton.disabled = true;
        setStatus(contactFormStatus, "Saving contact...", "");

    try {
        if (editingContactId) {
            // Mode: UPDATE (No warning popups, uses existing rules)
            contact.id = editingContactId; 
            await api.updateContact(contact, user.id);
            setStatus(dashboardStatus, "Contact updated.", "success");
        } else {
            // Mode: CREATE
            await api.createContact(contact, user.id);
            setStatus(dashboardStatus, "Contact added.", "success");
        }

        closeModal();
        await loadContacts();
    } catch (error) {
        setStatus(contactFormStatus, error.message, "error");
    } finally {
        submitButton.disabled = false;
    }
    });

    loadContacts();
});
