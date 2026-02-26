document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('csv-file');
    const browseBtn = document.getElementById('browse-btn');
    const uploadContent = document.querySelector('.upload-content');
    const selectedFileDisplay = document.getElementById('selected-file-display');
    const fileNameDisplay = document.getElementById('file-name');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const submitBtn = document.getElementById('submit-btn');

    // Config Elements
    const rowSlider = document.getElementById('row-slider');
    const rowCountDisplay = document.getElementById('row-count-display');

    // Status Elements
    const statusMessage = document.getElementById('status-message');
    const statusText = document.getElementById('status-text');
    const statusIcon = document.querySelector('.status-icon');

    // Button States
    const btnContent = document.querySelector('.btn-content');
    const loadingState = document.querySelector('.loading-state');

    let selectedFile = null;

    // Using relative path for production deployment
    const API_URL = "";

    // Slider Logic
    rowSlider.addEventListener('input', (e) => {
        rowCountDisplay.textContent = e.target.value;
    });

    // File Upload Logic
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault(); // prevent form submission or odd bubblings
        fileInput.click();
    });

    uploadZone.addEventListener('click', (e) => {
        if (e.target !== browseBtn && e.target !== removeFileBtn && !removeFileBtn.contains(e.target)) {
            fileInput.click();
        }
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFile = null;
        fileInput.value = "";

        uploadContent.classList.remove('hidden');
        selectedFileDisplay.classList.add('hidden');
        submitBtn.disabled = true;
        hideStatus();
    });

    function handleFile(file) {
        if (!file.name.endsWith('.csv')) {
            showStatus("Please upload a valid CSV file.", "error");
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB
            showStatus("File is too large. Max size is 50MB.", "error");
            return;
        }

        selectedFile = file;
        fileNameDisplay.textContent = file.name;

        uploadContent.classList.add('hidden');
        selectedFileDisplay.classList.remove('hidden');
        submitBtn.disabled = false;
        hideStatus();
    }

    // Form Submission
    document.getElementById('generator-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedFile) return;

        setLoadingState(true);
        hideStatus();

        const formData = new FormData();
        formData.append('file', selectedFile);

        const rows = rowSlider.value;

        try {
            const response = await fetch(`${API_URL}/generate?rows=${rows}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server responded with status ${response.status}`);
            }

            // Get the blob response
            const blob = await response.blob();

            // Create a download link and trigger it
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `synthetic_${selectedFile.name}`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showStatus("Success! Your synthetic data has been generated and downloaded.", "success");

        } catch (error) {
            console.error("API Error:", error);
            if (error.message.includes("Failed to fetch")) {
                showStatus("Network Error: Could not connect to the backend. Ensure it is running.", "error");
            } else {
                showStatus(`Generation Failed: ${error.message}`, "error");
            }
        } finally {
            setLoadingState(false);
        }
    });

    // Helpers
    function setLoadingState(isLoading) {
        if (isLoading) {
            btnContent.classList.add('hidden');
            loadingState.classList.remove('hidden');
            submitBtn.disabled = true;
            uploadZone.style.pointerEvents = 'none';
            removeFileBtn.disabled = true;
            rowSlider.disabled = true;
        } else {
            btnContent.classList.remove('hidden');
            loadingState.classList.add('hidden');
            submitBtn.disabled = false;
            uploadZone.style.pointerEvents = 'auto';
            removeFileBtn.disabled = false;
            rowSlider.disabled = false;
        }
    }

    function showStatus(message, type) {
        statusText.textContent = message;
        statusMessage.className = `status-message ${type}`;

        if (type === 'error') {
            statusIcon.className = 'ph ph-warning-circle status-icon';
        } else if (type === 'success') {
            statusIcon.className = 'ph ph-check-circle status-icon';
        }

        statusMessage.classList.remove('hidden');
    }

    function hideStatus() {
        statusMessage.classList.add('hidden');
    }
});
