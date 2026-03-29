// 1. Firebase 라이브러리 및 설정 (admin.js와 동일하게 맞춰줍니다)
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

let BASE_DATA = []; // Firebase에서 가져온 원본 데이터를 저장할 곳

/* =========================
   데이터 가져오기 (Firebase 연동)
========================= */
async function fetchFirebaseData() {
    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, 'userData'));
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Firebase의 객체 데이터를 배열로 변환
            BASE_DATA = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).reverse(); // 최신순 정렬
            return BASE_DATA;
        }
        return [];
    } catch (error) {
        console.error("💥 Firebase 데이터 로드 실패:", error);
        return [];
    }
}

// 기존 getAllData 함수를 Firebase 데이터를 사용하도록 수정
function getAllData() {
    return BASE_DATA.map(normalizeItem);
}

/* =========================
   데이터 정규화 (기존 로직 유지)
========================= */
function normalizeItem(item) {
    if (!item) return null;
    return {
        ...item,
        artist: item.artist || "",
        writer: item.writer || "",
        category: item.category || "",
        tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
        images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
        thumbnail: item.thumbnail || "" // 깃허브 주소
    };
}

// ... (중략: getAuthorNames, getFavorites, toggleFavorite 등 기존 로직은 동일하게 유지) ...

/* =========================
   상태 관리 및 필터 로직 (기존 유지)
========================= */
let currentState = { search: "", categories: [], tags: [] };
// (중략: savedState 로직 유지)

function getFilteredData() {
    let list = getAllData();
    // (중략: 검색 및 카테고리 필터 로직 유지)
    return list;
}

/* =========================
   카드 렌더링 (기존 유지)
========================= */
function renderCards(list) {
    const wrap = document.getElementById("cards");
    if (!wrap) return;
    wrap.innerHTML = "";
    // ... (기존 카드 생성 코드 그대로 사용) ...
}

// ... (중략: renderFilters, initSearch 등 UI 관련 함수 유지) ...

/* =========================
   전체 업데이트 (핵심!)
========================= */
async function update() {
    // 1. 데이터를 먼저 가져옵니다 (처음 한 번만 실행되거나 업데이트 시 실행)
    if (BASE_DATA.length === 0) {
        await fetchFirebaseData();
    }
    
    const filtered = getFilteredData();
    renderFilters();
    renderCards(filtered.slice(0, visibleCount));
    renderLoadMore(filtered.length);
    // updateFavBadge(); // 필요한 경우 활성화
}

/* =========================
   실행 (DOMContentLoaded)
========================= */
document.addEventListener("DOMContentLoaded", async () => {
    const isFavoritesPage = location.pathname.includes("favorites.html");

    // 🚀 페이지 접속 시 데이터를 먼저 가져옵니다.
    await fetchFirebaseData();

    if (isFavoritesPage) {
        renderFavoritesPage();
        return;
    }

    initSearch();
    update();
});

// ... (나머지 스크롤 및 즐겨찾기 로직 그대로 하단에 배치) ...