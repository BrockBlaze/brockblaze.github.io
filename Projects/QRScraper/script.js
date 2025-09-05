// DOM Elements
const fTitle = document.getElementById('fTitle');
const form = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const scrapedData = document.getElementById('scrapedData');
const qrCodeCanvas = document.getElementById('qrcode');
const labelName = document.getElementById('labelNameText');
const labelItem2 = document.getElementById('labelItem2Text');
const labelItem3 = document.getElementById('labelItem3Text');


// Function to generate a QR code
function generateQRCode(url) {
    QRCode.toCanvas(qrCodeCanvas, url, { 
        width: 96, 
        margin: 2,
        errorCorrectionLevel: 'L',
        type: 'image/png',
        quality: 0.92,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, (error) => {
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
    labelItem2.innerHTML = document.getElementById('labelItem2').value;
    labelItem3.innerHTML = document.getElementById('labelItem3').value;
    // Generate QR code
    generateQRCode(url);
});
