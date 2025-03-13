document.addEventListener("DOMContentLoaded", async function () {
    const gallery = document.getElementById("gallery");

    try {
        const response = await fetch("config.json");
        const data = await response.json();
        const categories = data.categories;

        categories.forEach(category => {
            let categoryDiv = document.createElement("div");
            categoryDiv.className = "category";
            categoryDiv.innerHTML = `<h2>${category.name}</h2>
                <img src="photos/${category.path}/cover.jpg" alt="${category.name}">`;
            categoryDiv.addEventListener("click", () => {
                if (category.albums.length > 0) {
                    loadAlbums(category);
                } else {
                    loadPhotos(category.path, ""); // Load photos directly
                }
            });
            gallery.appendChild(categoryDiv);
        });
    } catch (error) {
        console.error("Error loading config.json:", error);
    }

    function loadAlbums(category) {
        gallery.innerHTML = `<h2>${category.name}</h2>`;
        category.albums.forEach(album => {
            let albumDiv = document.createElement("div");
            albumDiv.className = "album";
            albumDiv.innerHTML = `<h3>${album.replace("_", " ")}</h3>
                <img src="photos/${category.path}/${album}/cover.jpg" alt="${album}">`;
            albumDiv.addEventListener("click", () => loadPhotos(category.path, album));
            gallery.appendChild(albumDiv);
        });
    }

    function loadPhotos(categoryPath, albumPath) {
        gallery.innerHTML = `<h2>${albumPath ? albumPath.replace("_", " ") : categoryPath.replace("_", " ")}</h2>`;
        let folderPath = albumPath ? `${categoryPath}/${albumPath}` : categoryPath;
        let images = ["img1.jpg", "img2.jpg", "img3.jpg"]; // Replace with dynamic fetch later

        images.forEach(img => {
            let imgDiv = document.createElement("div");
            imgDiv.className = "photo";
            imgDiv.innerHTML = `<img src="photos/${folderPath}/${img}" alt="Photo">`;
            imgDiv.addEventListener("click", () => showFullImage(`photos/${folderPath}/${img}`));
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
            const exiftoolUrl = `https://exiftool.org/extract?url=${src}`; // Replace with real EXIF API or JS lib
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
});
