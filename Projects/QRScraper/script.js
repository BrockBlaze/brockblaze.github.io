// DOM Elements
const fTitle = document.getElementById('fTitle');
const form = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const scrapedData = document.getElementById('scrapedData');
const qrCodeCanvas = document.getElementById('qrcode');
const labelName = document.getElementById('labelNameText');
const labelIP = document.getElementById('labelIPText');
const labelEnvironment = document.getElementById('labelEnvironmentText');


// Function to generate a QR code
function generateQRCode(url) {
    QRCode.toCanvas(qrCodeCanvas, url, { width: 200 }, (error) => {
        if (error) console.error("Error generating QR code:", error);
    });
}

// Form submission handlera
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
