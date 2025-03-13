document.addEventListener("DOMContentLoaded", async function () {
    const gallery = document.getElementById("gallery");

    async function loadConfig() {
        try {
            const response = await fetch("config.json");
            return await response.json();
        } catch (error) {
            console.error("Error loading config.json:", error);
            return null;
        }
    }

    function renderHome(categories) {
        gallery.innerHTML = `<h1>Prabal Ghosh | Photography</h1>`;
        categories.forEach(category => {
            let categoryDiv = document.createElement("div");
            categoryDiv.className = "category";
            categoryDiv.innerHTML = `<h2>${category.name}</h2>
                <img src="photos/${category.path}/cover.jpg" alt="${category.name}" onerror="this.style.display='none'">`;
            categoryDiv.addEventListener("click", () => {
                if (category.albums.length > 0) {
                    loadAlbums(category);
                } else {
                    loadPhotos(category.path, category.photos);
                }
            });
            gallery.appendChild(categoryDiv);
        });
    }

    function loadAlbums(category) {
        gallery.innerHTML = `<h2>${category.name}</h2><button onclick="initGallery()">Back to Home</button>`;
        category.albums.forEach(album => {
            let albumDiv = document.createElement("div");
            albumDiv.className = "album";
            albumDiv.innerHTML = `<h3>${album.replace("_", " ")}</h3>
                <img src="photos/${category.path}/${album}/cover.jpg" alt="${album}" onerror="this.style.display='none'">`;
            albumDiv.addEventListener("click", () => loadPhotos(`${category.path}/${album}`, category.photos));
            gallery.appendChild(albumDiv);
        });
    }

    function loadPhotos(folderPath, photos) {
        gallery.innerHTML = `<h2>Photos</h2><button onclick="initGallery()">Back to Home</button>`;
        photos.forEach(photo => {
            let imgDiv = document.createElement("div");
            imgDiv.className = "photo";
            imgDiv.innerHTML = `<img src="photos/${folderPath}/${photo}" alt="Photo">`;
            imgDiv.addEventListener("click", () => showFullImage(`photos/${folderPath}/${photo}`));
            gallery.appendChild(imgDiv);
        });
    }

    function showFullImage(src) {
        let modal = document.createElement("div");
        modal.id = "photo-modal";
        modal.innerHTML = `
            <span class="close">&times;</span>
            <img src="${src}" alt="Full Size Photo">
            <div id="exif-info">Loading EXIF...</div>
        `;
        document.body.appendChild(modal);
        modal.style.display = "flex";

        modal.querySelector(".close").addEventListener("click", () => {
            modal.remove();
        });

        loadExif(src);
    }

    async function loadExif(src) {
        let exifDiv = document.getElementById("exif-info");
        try {
            const exiftoolUrl = `https://exiftool.org/extract?url=${src}`;
            let response = await fetch(exiftoolUrl);
            let data = await response.json();
            exifDiv.innerHTML = `
                <p>Camera: ${data.Model || "Unknown"}</p>
                <p>Lens: ${data.LensModel || "Unknown"}</p>
                <p>ISO: ${data.ISO || "N/A"}</p>
                <p>Shutter: ${data.ExposureTime || "N/A"}</p>
                <p>Aperture: ${data.FNumber || "N/A"}</p>
            `;
        } catch (error) {
            exifDiv.innerHTML = "<p>EXIF data not available</p>";
        }
    }

    async function initGallery() {
        const data = await loadConfig();
        if (data) {
            renderHome(data.categories);
        }
    }

    initGallery();
});
