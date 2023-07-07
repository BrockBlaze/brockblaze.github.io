var e = 

function uploadPhoto() {
  const photoInput = document.getElementById("photoInput");
  const file = photoInput.files[0];

  if (!file) {
    console.error("No file selected");
    return;
  }

  const accessToken = "a";
  const repoOwner = "BrockBlaze";
  const repoName = "brockblaze.github.io";
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/Wedding/WeddingPhotos/${file.name}`;

  const reader = new FileReader();

  reader.onload = function (event) {
    const photoData = event.target.result.split(",")[1]; // Extract the base64-encoded content

    const data = {
      message: "Upload photo",
      content: photoData,
    };

    fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Photo uploaded successfully!");
          window.location.href = "success.html"; // Redirect to the success page
        } else {
          console.error("Error uploading photo:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error uploading photo:", error);
      });
  };

  reader.readAsDataURL(file);
}