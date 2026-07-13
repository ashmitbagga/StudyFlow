const API_BASE_URL = "http://127.0.0.1:8000";

function getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function getUserId() {
    return localStorage.getItem("user_id");
}

function saveSession(user) {

    localStorage.setItem("user", JSON.stringify(user));

    localStorage.setItem("user_id", user.id);

}

function logout() {

    localStorage.removeItem("user");

    localStorage.removeItem("user_id");

    window.location.href = "index.html";

}

function requireLogin() {

    if (!getUserId()) {

        window.location.href = "index.html";

    }

}

async function apiRequest(path, method = "GET", body = null) {

    const headers = {

        "Content-Type": "application/json",

        "user-id": getUserId()

    };

    const response = await fetch(

        API_BASE_URL + path,

        {

            method,

            headers,

            body: body ? JSON.stringify(body) : null

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.detail || "Request Failed");

    }

    return data;

}