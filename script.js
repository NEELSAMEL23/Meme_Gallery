const API_URL = "https://api.imgflip.com/get_memes";

let memes = [];
let filteredMemes = [];
let currentPage = 1;
const memesPerPage = 8;

const memeContainer = document.getElementById("memeContainer");
const searchInput = document.getElementById("searchInput");
const filterWidth = document.getElementById("filterWidth");
const sortOption = document.getElementById("sortOption");
const pagination = document.getElementById("pagination");
const loading = document.getElementById("loading");
const resultCount = document.getElementById("resultCount");


loading.style.display = "block";

fetch(API_URL)
    .then(res => res.json())
    .then(data => {
        memes = data.data.memes;
        loading.style.display = "none";
        applyFilters();
    })
    .catch(() => {
        loading.textContent = "Failed to load memes.";
    });

searchInput.addEventListener("input", applyFilters);
filterWidth.addEventListener("change", applyFilters);
sortOption.addEventListener("change", applyFilters);


function renderMemes() {
    memeContainer.innerHTML = "";

    resultCount.textContent = `Showing ${filteredMemes.length} meme(s)`;

    const start = (currentPage - 1) * memesPerPage;
    const end = start + memesPerPage;
    const currentMemes = filteredMemes.slice(start, end);
 
    if (currentMemes.length === 0) {
        memeContainer.innerHTML = "<p>No memes found.</p>";
        return;
    }

    currentMemes.forEach(meme => {
        const card = document.createElement("div");
        card.className = "meme-card";
        card.innerHTML = `
      <img src="${meme.url}" alt="${meme.name}" />
      <p>${meme.name}</p>
    `;
        memeContainer.appendChild(card);
    });
}


function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const widthFilter = filterWidth.value;
    const sort = sortOption.value;

    filteredMemes = memes.filter(meme => {
        const nameMatch = meme.name.toLowerCase().includes(searchTerm);
        let widthMatch = true;

        if (widthFilter === "<300") widthMatch = meme.width < 300;
        else if (widthFilter === "300-500") widthMatch = meme.width >= 300 && meme.width <= 500;
        else if (widthFilter === ">500") widthMatch = meme.width > 500;

        return nameMatch && widthMatch;
    });

    // Sorting
    if (sort === "name-asc") {
        filteredMemes.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "width-asc") {
        filteredMemes.sort((a, b) => a.width - b.width);
    } else if (sort === "width-desc") {
        filteredMemes.sort((a, b) => b.width - a.width);
    }

    currentPage = 1;
    renderMemes();
    renderPagination();
}



function renderPagination() {
    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredMemes.length / memesPerPage);
    if (totalPages <= 1) return;

    const createBtn = (text, pageNum) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        if (pageNum === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
            currentPage = pageNum;
            renderMemes();
            renderPagination();
        });
        return btn;
    };

    if (currentPage > 1) {
        pagination.appendChild(createBtn("Prev", currentPage - 1));
    }

    for (let i = 1; i <= totalPages; i++) {
        pagination.appendChild(createBtn(i, i));
    }

    if (currentPage < totalPages) {
        pagination.appendChild(createBtn("Next", currentPage + 1));
    }
}
