const upload = document.getElementById("upload");
const dropZone = document.getElementById("dropZone");
const preview = document.getElementById("preview");
const qualitySlider = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");
const compressBtn = document.getElementById("compressBtn");
const cancelBtn = document.getElementById("cancelBtn");
const themeToggle = document.getElementById("themeToggle");

const progressWrapper = document.getElementById("progressWrapper");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

let images = [];
let cancelProcess = false;

/* Dark mode */
themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
};

/* Quality */
qualitySlider.oninput = () => {
    qualityValue.textContent = qualitySlider.value;
};

/* Upload */
dropZone.onclick = () => upload.click();

upload.addEventListener("change", e => {
    images = Array.from(e.target.files);
    preview.innerHTML = "";

    images.forEach((file, index) => {
        const card = document.createElement("div");
        card.className = "preview-card";
        card.innerHTML = `
            <img src="${URL.createObjectURL(file)}">
            <p>${(file.size / 1024).toFixed(1)} KB</p>
            <div class="status pending" id="status-${index}">Pending</div>
            <button class="download-btn" id="download-${index}">Download</button>
        `;
        preview.appendChild(card);
    });
});

/* Cancel */
cancelBtn.onclick = () => {
    cancelProcess = true;
};

/* Compress All */
compressBtn.onclick = async () => {
    if (!images.length) return alert("Upload images first");

    cancelProcess = false;
    compressBtn.disabled = true;
    cancelBtn.classList.remove("hidden");
    progressWrapper.classList.remove("hidden");

    const zip = new JSZip();
    const quality = qualitySlider.value / 100;

    for (let i = 0; i < images.length; i++) {
        if (cancelProcess) break;

        const status = document.getElementById(`status-${i}`);
        const downloadBtn = document.getElementById(`download-${i}`);

        status.textContent = "Compressing...";
        status.className = "status working";

        const blob = await compressImage(images[i], quality);

        /* ZIP */
        zip.file(`compressed_${images[i].name}`, blob);

        /* Per-image download */
        const url = URL.createObjectURL(blob);
        downloadBtn.style.display = "block";
        downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `compressed_${images[i].name}`;
            a.click();
        };

        status.textContent = "Done";
        status.className = "status done";

        const percent = Math.round(((i + 1) / images.length) * 100);
        progressFill.style.width = percent + "%";
        progressText.textContent = percent + "%";
    }

    if (!cancelProcess) {
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(zipBlob);
        a.download = "compressed_images.zip";
        a.click();
    }

    compressBtn.disabled = false;
    cancelBtn.classList.add("hidden");
    progressWrapper.classList.add("hidden");
};

/* Compression function */
function compressImage(file, quality) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext("2d").drawImage(img, 0, 0);
            canvas.toBlob(blob => resolve(blob), "image/jpeg", quality);
        };
    });
}
