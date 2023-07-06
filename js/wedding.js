const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle the photo upload
app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const { path, originalname } = req.file;

    // Read the photo file
    const photoData = fs.readFileSync(path);

    // Delete the temporary file
    fs.unlinkSync(path);

    // Upload the photo to GitHub
    const uploadResult = await uploadToGitHub(photoData, originalname);

    res.send('Photo uploaded successfully!');
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).send('An error occurred while uploading the photo.');
  }
});

// Upload photo to GitHub repository using GitHub's REST API
async function uploadToGitHub(photoData, filename) {
  const accessToken = 'YOUR_GITHUB_ACCESS_TOKEN';
  const repoOwner = 'BrockBlaze';
  const repoName = 'brockblaze.github.io';
  const uploadUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filename}`;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  };

  const encodedContent = photoData.toString('base64');

  const data = {
    message: 'Upload photo',
    content: encodedContent,
  };

  const response = await axios.put(uploadUrl, data, { headers });

  return response.data;
}

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});