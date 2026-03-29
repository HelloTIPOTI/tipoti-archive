import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCqUVEubrHk2A5gIGdSNum63NFUFCG1jQI",
    authDomain: "my-archive-00.firebaseapp.com",
    projectId: "my-archive-00",
    storageBucket: "my-archive-00.firebasestorage.app",
    messagingSenderId: "626393416245",
    appId: "1:626393416245:web:0d0b6fbd8fe76d2f77277c",
    databaseURL: "https://my-archive-00-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let BASE_DATA = []; 
let visibleCount = 20;
const STEP = 20;

let currentState = {
    search: "",
    categories: [],
    tags: []
};

/* =========================
   데이터 가져오기
========================= */
async function fetchFirebaseData() {
    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, 'userData'));
        if (snapshot.exists()) {
            const data = snapshot.val();
            BASE_DATA = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).reverse();
            return BASE_DATA;
        }
        return [];
    } catch (error) {
        console.error("💥 Firebase 로드 실패:", error);
        return [];
    }
}

function normalizeItem(item){
    if(!item) return null;
    return {
        ...item,
        artist: item.artist || "",
        writer: item.writer || "",
        category: item.category || "",
        tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
        images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
        thumbnail: item.thumbnail || ""
    };
}

function getAllData() {
    return BASE_DATA.map(normalizeItem);
}

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
}

/* =========================
   필터링 로직
========================= */
function getFilteredData() {
    let list = getAllData();

    if (currentState.search.length >= 2) {
        const q = currentState.search.toLowerCase();
        return list.filter(item =>
            (item.title || "").toLowerCase().includes(q) ||
            (item.artist || "").toLowerCase().includes(q) ||
            (item.writer || "").toLowerCase().includes(q)
        );
    }

    if (currentState.categories.length > 0) {
        list = list.filter(item => currentState.categories.includes(item.category));
    }

    if (currentState.tags.length > 0) {
        list = list.filter(item => (item.tags || []).some(tag => currentState.tags.includes(tag)));
    }

    return list;
}

/* =========================
   ⭐⭐ 핵심: 삭제되었던 검색 초기화 함수 (initSearch)
========================= */
function initSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    input.value = currentState.search;

    input.addEventListener("input", (e) => {
        visibleCount = 20;
        currentState.search = e.target.value.trim();
        update(); // 검색할 때마다 화면 갱신
    });
}

/* =========================
   카드 렌더링
========================= */
function renderCards(list) {
    const wrap = document.getElementById("cards");
    const count = document.getElementById("resultCount");
    if (!wrap) return;

    wrap.innerHTML = "";
    const favList = getFavorites();

    list.forEach((item) => {
        if (!item) return;

        const isFav = favList.includes(item.title);
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="fav-btn ${isFav ? "active":""}"></div>
            <img class="card-thumb" src="${item.thumbnail || ""}">
            <div class="card-body">
                <div class="card-title">${item.title || ""}</div>
                <div class="card-author">${item.artist || item.writer || ""}</div>
                <div class="card-rating">★ ${item.rating || ""}</div>
            </div>
        `;

        card.onclick = () => {
            localStorage.setItem("selectedItem", JSON.stringify(item));
            location.href = `detail.html?id=${item.id}`;
        };

        wrap.appendChild(card);
    });

    if (count) count.textContent = `${list.length}개 작품`;
}

/* =========================
   필터 UI 렌더링
========================= */
function renderFilters() {
    const categoryWrap = document.getElementById("categoryFilter");
    if (!categoryWrap) return;
    categoryWrap.innerHTML = "";

    const categories = ["전체", "00", "AZ", "ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

    categories.forEach(category => {
        const el = document.createElement("div");
        const isActive = (category === "전체" && currentState.categories.length === 0) || currentState.categories.includes(category);
        el.className = "pill" + (isActive ? " active" : "");
        el.textContent = category;
        el.onclick = () => {
            visibleCount = 20;
            currentState.categories = (category === "전체") ? [] : [category];
            update();
        };
        categoryWrap.appendChild(el);
    });
}

/* =========================
   더보기 버튼
========================= */
function renderLoadMore(total) {
    let btn = document.getElementById("loadMoreBtn");
    if (visibleCount >= total) {
        if (btn) btn.style.display = "none";
    } else {
        if (btn) btn.style.display = "inline-block";
    }
}

/* =========================
   전체 업데이트 함수
========================= */
async function update() {
    if (BASE_DATA.length === 0) {
        await fetchFirebaseData();
    }
    const filtered = getFilteredData();
    renderFilters();
    renderCards(filtered.slice(0, visibleCount));
    renderLoadMore(filtered.length);
}

/* =========================
   실행부 (DOMContentLoaded)
========================= */
document.addEventListener("DOMContentLoaded", async () => {
    // 1. 데이터 먼저 가져오기
    await fetchFirebaseData();
    
    // 2. 검색창 연결 (에러 났던 부분 해결)
    initSearch();
    
    // 3. 화면 그리기
    update();
});