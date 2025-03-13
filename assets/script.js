document.addEventListener("DOMContentLoaded", async () => {
    const categoryList = document.getElementById("category-list");
    const gallery = document.getElementById("gallery");

    let config = await fetch("config.json").then(res => res.json());

    // Populate Sidebar Categories
    config.categories.forEach(category => {
        let li = document.createElement("li");
        li.innerHTML = `<a href="#" onclick="loadCategory('${category.path}')">${category.name}</a>`;
        categoryList.appendChild(li);
    });

    // Load category
    window.loadCategory = function (categoryPath) {
        gallery.innerHTML = "";
        let category = config.categories.find(c => c.path === categoryPath);

        if (!category.albums || category.albums.length === 0) {
            loadImages(categoryPath, "");
        } else {
            category.albums.forEach(album => {
                let div = document.createElement("div");
                div.innerHTML = `<div class="gallery-item"><a href="#" onclick="loadImages('${categoryPath}', '${album}')">${album}</a></div>`;
                gallery.appendChild(div);
            });
        }
    };

    // Load images
    window.loadImages = function (category, album) {
        gallery.innerHTML = "";
        let folder = `photos/${category}/${album ? album + '/' : ''}`;
        fetch(folder)
            .then(response => response.text())
            .then(html => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(html, "text/html");
                let images = Array.from(doc.querySelectorAll("a"))
                                  .map(a => a.href)
                                  .filter(href => /\.(jpg|jpeg|png|gif)$/i.test(href));

                images.forEach(imgSrc => {
                    let img = document.createElement("img");
                    img.src = imgSrc;
                    img.classList.add("gallery-item");
                    img.onclick = () => openLightbox(imgSrc);
                    gallery.appendChild(img);
                });
            });
    };

    // Lightbox Functionality
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const exifData = document.getElementById("exif-data");
    const closeLightbox = document.getElementById("close-lightbox");

    let currentIndex = 0;
    let currentImages = [];

    window.openLightbox = function (imgSrc) {
        currentIndex = currentImages.indexOf(imgSrc);
        lightboxImg.src = imgSrc;
        lightbox.classList.remove("hidden");
        fetchExifData(imgSrc);
    };

    closeLightbox.onclick = () => lightbox.classList.add("hidden");

    document.getElementById("prev-img").onclick = () => {
        if (currentIndex > 0) {
            openLightbox(currentImages[--currentIndex]);
        }
    };

    document.getElementById("next-img").onclick = () => {
        if (currentIndex < currentImages.length - 1) {
            openLightbox(currentImages[++currentIndex]);
        }
    };

    async function fetchExifData(imgSrc) {
        exifData.innerText = `EXIF Info: ${imgSrc}`;
    }
});
