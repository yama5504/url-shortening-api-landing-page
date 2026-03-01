document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const menuBtn = document.querySelector('.menu-toggle');

    menuBtn.addEventListener('click', () => {
        header.classList.toggle('open');
    });


    const form = document.querySelector("#url-form");
    const input = document.querySelector("#url-input");
    const errorText = document.querySelector(".error");
    const result = document.querySelector(".result");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const urlValue = input.value.trim();

        if (!urlValue) {
            showError("Please add a link.");
            return;
        }

        if (!isValidUrl(urlValue)) {
            showError("Please enter a valid URL.");
            return;
        }
        
        clearError();

        try {
            const response = await fetch("/api/shorten", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `url=${encodeURIComponent(urlValue)}`
            });

            const data = await response.json();

            if (data.result_url) {

            result.classList.add("is-active");

            result.insertAdjacentHTML("beforeend", `
                <div class="result-item">
                    <p class="original">${urlValue}</p>
                    <p class="short"><a href="${data.result_url}" target="_blank">${data.result_url}</a></p>
                    <div class="copy-btn"><button data-url="${data.result_url}">Copy</button></div>
                </div>
            `);

            input.value = "";
            } else {
            showError("Something went wrong. Try again.");
            }

        } catch (error) {
            showError("Network error. Please try again.");
        }
    });

    result.addEventListener("click", async (e) => {
        if (!e.target.matches(".copy-btn button")) return;

        const btn = e.target;
        const url = btn.dataset.url;

        try {
        await navigator.clipboard.writeText(url);

        btn.textContent = "Copied!";
        btn.classList.add("copied");

        setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
        }, 2000);
        } catch {
        alert("Copy failed");
        }
    });

    function showError(message) {
        errorText.textContent = message;
        errorText.style.display = "block";
        input.classList.add("is-error");
    }

    function clearError() {
        errorText.style.display = "none";
        input.classList.remove("is-error");
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }

});