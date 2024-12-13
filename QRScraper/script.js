// DOM Elements
const fTitle = document.getElementById('fTitle');
const form = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const scrapedData = document.getElementById('scrapedData');
const qrCodeCanvas = document.getElementById('qrcode');
const labelName = document.getElementById('labelNameText');
const labelIP = document.getElementById('labelIPText');
const labelEnvironment = document.getElementById('labelEnvironmentText');

// Function to scrape metadata using an external API
async function fetchUsingScraperAPI(url) {
    const scraperApiUrl = `https://api.scraperapi.com?api_key=5dfaaab34de8447c615346120bf58543&url=${encodeURIComponent(url)}`;

    try {
        const response = await fetch(scraperApiUrl);
        const html = await response.text();

        // Parse the HTML and extract the specific attribute value
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Target the input element with the `data-kwcachedvalue` attribute
        const inputElement = doc.querySelector("input[data-kwcachedvalue]");
        const waldoText = inputElement
            ? inputElement.getAttribute("data-kwcachedvalue")
            : "Text not found";

        return waldoText;
    } catch (error) {
        console.error("Error fetching with ScraperAPI:", error);
        return "Failed to fetch data.";
    }
}

// Function to generate a QR code
function generateQRCode(url) {
    QRCode.toCanvas(qrCodeCanvas, url, { width: 200 }, (error) => {
        if (error) console.error("Error generating QR code:", error);
    });
}

// Form submission handler
form.addEventListener('submit', async (event) => {
    fTitle.style.display = 'none';
    form.style.display = 'none';
    event.preventDefault();
    const url = urlInput.value;
    labelName.innerHTML = document.getElementById('labelName').value;
    labelIP.innerHTML = document.getElementById('labelIP').value;
    labelEnvironment.innerHTML = document.getElementById('labelEvironment').value;
    // Generate QR code
    generateQRCode(url);
});
