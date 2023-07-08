var token = '11AHWIFUY07BcxrUFwB16p_97c6vUc1EaZnBAptLov8x7p26xKCJMZeX4fawnvEwYeIEZC2JOKtId50bbs';
var t = 'a';

function uploadPhoto() {
  const photoInput = document.getElementById('photoInput');
  const file = photoInput.files[0];

  if (!file) {
    console.error('No file selected');
    return;
  }

  t = token.replace('r', 'Q');

  const accessToken = 'github_pat_' + t;
  const repoOwner = 'BrockBlaze';
  const repoName = 'brockblaze.github.io';
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/WeddingPhotos${file.name}`;

  const reader = new FileReader();

  reader.onload = function (event) {
    const photoData = event.target.result.split(',')[1]; // Extract the base64-encoded content

    const data = {
      message: 'Upload photo',
      content: photoData,
    };

    fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (response.ok) {
          console.log('Photo uploaded successfully!');
          window.location.href = 'weddingGallery.html'; // Redirect to the success page
        } else {
          console.error('Error uploading photo:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error uploading photo:', error);
      });
  };

  reader.readAsDataURL(file);
}
