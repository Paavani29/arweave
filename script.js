
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    document.getElementById('loadingMessage').style.display = 'block'; // Show loading message

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('File upload failed');
        }

        const data = await response.json();
        document.getElementById('loadingMessage').style.display = 'none'; // Hide loading message
        document.getElementById('linkMessage').style.display = 'block'; // Show link message

        // Update the link with the full URL and display it
        const fileLinkElement = document.getElementById('fileLink');
        fileLinkElement.href = data.link; // Set the link to the uploaded file
        fileLinkElement.textContent = data.link; // Set the text content to the full URL
    } catch (error) {
        console.error('Error:', error);
        alert('File upload failed. Please try again.');
        document.getElementById('loadingMessage').style.display = 'none'; // Hide loading message
    }
}

