let BASE_DATA = [];

/* =========================
   사용자 데이터
========================= */

function getUserData() {
  const saved = localStorage.getItem("userData");

  try {
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("💥 userData 파싱 오류:", e);

    // 🔥 깨진 데이터 자동 제거
    localStorage.removeItem("userData");

    return [];
  }
}


function normalizeItem(item){
  if(!item) return null;
  return {
    ...item,
    artist: item.artist || "",
    writer: item.writer || "",
    category: item.category || item.day || "",
    tags: Array.isArray(item.tags)?item.tags.filter(Boolean):[],
    images: Array.isArray(item.images)?item.images.filter(Boolean):[],
    legacyAuthor: item.author || ""
  };
}

function getAuthorNames(item){
  const names=[];
  if(item.artist) names.push(item.artist);
  if(item.writer && item.writer!==item.artist) names.push(item.writer);
  if(names.length===0 && item.legacyAuthor) names.push(item.legacyAuthor);
  return names;
}

function getAllData(){return [...getUserData(),...BASE_DATA].map(normalizeItem);} 

/* =========================
   ⭐ 즐겨찾기
========================= */

function getFavorites(){
  return JSON.parse(localStorage.getItem("favorites")||"[]");
}

function toggleFavorite(title){
  let fav = getFavorites();
  if(fav.includes(title)){
    fav = fav.filter(t=>t!==title);
  }else{
    fav.push(title);
  }
  localStorage.setItem("favorites",JSON.stringify(fav));
}


/* =========================
   상태 관리
========================= */

let currentState = {
  search: "",
  categories: [],
  tags: []
};

const savedState = localStorage.getItem("archiveState");

if (savedState) {
  try {
    const parsed = JSON.parse(savedState);

    currentState = {
      search: parsed.search || "",
      categories: Array.isArray(parsed.categories)
        ? parsed.categories
        : (parsed.category ? [parsed.category] : []),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags
        : (parsed.tag ? [parsed.tag] : [])
    };
  } catch (e) {
    console.error("💥 archiveState 파싱 오류:", e);
    localStorage.removeItem("archiveState");
  }
}

/* =========================
   더보기 상태
========================= */

let visibleCount = 20;
const STEP = 20;

/* =========================
   필터링
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
    list = list.filter(item =>
      currentState.categories.includes(item.category)
    );
  }

  if (currentState.tags.length > 0) {
    list = list.filter(item =>
      (item.tags || []).some(tag => currentState.tags.includes(tag))
    );
  }

  return list;
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

    const authorNames=getAuthorNames(item);
    const authorText=authorNames.map(n=>`<span class="author-link" data-author="${n}">${n}</span>`).join(" / ");

    const isFav = favList.includes(item.title);
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="fav-btn ${isFav ? "active":""}"></div>
      <img class="card-thumb" src="${item.thumbnail || ""}">
      <div class="card-body">
        <div class="card-title">${item.title || ""}</div>
        <div class="card-author">${authorText}</div>
        <div class="card-rating">★ ${item.rating || ""}</div>
        ${item.note ? `<div class="card-note">${item.note}</div>` : ""}
      </div>
    `;

    card.onclick = () => {
      localStorage.setItem("selectedItem", JSON.stringify(item));
      location.href = "detail.html";
    };

    card.querySelector(".fav-btn").onclick = (e)=>{
      e.stopPropagation();
      toggleFavorite(item.title);

      if (location.pathname.includes("favorites.html")) {
        renderFavoritesPage();
      } else {
        update();
      }

    };
    wrap.appendChild(card);
  });

  if (count) {
    count.textContent = `${list.length}개 작품`;
  }
}

/* =========================
   필터 UI
========================= */

function renderFilters() {
  const categoryWrap = document.getElementById("categoryFilter");
  const tagWrap = document.getElementById("tagFilter");

  if (!categoryWrap || !tagWrap) return;

  categoryWrap.innerHTML = "";
  tagWrap.innerHTML = "";

  const categories = ["전체", "00", "AZ", "ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

  categories.forEach(category => {
    const el = document.createElement("div");

    const isActive =
      (category === "전체" && currentState.categories.length === 0) ||
      currentState.categories.includes(category);

    el.className = "pill" + (isActive ? " active" : "");
    el.textContent = category;

    el.onclick = () => {

      visibleCount = 20;

      if (category === "전체") {
        currentState.categories = [];
        currentState.tags = [];
      } else {
        currentState.categories = [category];
      }

      saveState();
      update();
    };

    categoryWrap.appendChild(el);
  });

  const allData = getAllData();
  const tags = [...new Set(allData.flatMap(d => d.tags || []))];

  tags.forEach(tag => {
    const el = document.createElement("div");

    const isActive = currentState.tags.includes(tag);

    el.className = "pill" + (isActive ? " active" : "");
    el.textContent = "#" + tag;

    el.onclick = () => {

      visibleCount = 20;

      if (currentState.tags.includes(tag)) {
        currentState.tags = currentState.tags.filter(t => t !== tag);
      } else {
        currentState.tags.push(tag);
      }

      saveState();
      update();
    };

    tagWrap.appendChild(el);
  });
}

/* =========================
   검색
========================= */

function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.value = currentState.search;

  input.addEventListener("input", (e) => {

    visibleCount = 20;

    currentState.search = e.target.value.trim();
    saveState();
    update();
  });
}

/* =========================
   더보기 버튼
========================= */

function renderLoadMore(total) {
  let btn = document.getElementById("loadMoreBtn");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "loadMoreBtn";
    btn.className = "loadmore-btn";
    btn.innerText = "더보기";

    const wrap = document.createElement("div");
    wrap.className = "loadmore-wrap";
    wrap.appendChild(btn);

    document.querySelector(".page").appendChild(wrap);
  }

  if (visibleCount >= total) {
    btn.style.display = "none";
  } else {
    btn.style.display = "inline-block";
  }

  btn.onclick = () => {
    visibleCount += STEP;
    update();
  };
}

/* =========================
   상태 저장
========================= */

function saveState() {
  localStorage.setItem("archiveState", JSON.stringify(currentState));
}

/* =========================
   전체 업데이트
========================= */

function update() {
  const filtered = getFilteredData();

  renderFilters();
  renderCards(filtered.slice(0, visibleCount));
  renderLoadMore(filtered.length);
  updateFavBadge();
}

/* =========================
   실행
========================= */

document.addEventListener("DOMContentLoaded", () => {

const isFavoritesPage = location.pathname.includes("favorites.html");

if (isFavoritesPage) {
  renderFavoritesPage();

  window.addEventListener("pageshow", () => {
    renderFavoritesPage();
  });

  return;
}


  initSearch();
  update();

  window.addEventListener("pageshow", () => {
    update();
  });

});
document.addEventListener("click",e=>{
 if(e.target.classList.contains("author-link")){
   e.stopPropagation();
   localStorage.setItem("selectedAuthor",e.target.dataset.author);
   location.href="author.html";
 }
});

/* =========================
   즐겨찾기
========================= */

// ⭐ 즐겨찾기 badge
function updateFavBadge(){
  const badge = document.getElementById("favBadge");
  if(!badge) return;
  const count = getFavorites().length;
  badge.textContent = "";
}

// ⭐ 즐겨찾기 목록
function getFavoriteItems() {
  const favList = getFavorites();
  return getAllData().filter(item => favList.includes(item.title));
}

// ⭐ 즐겨찾기 페이지 렌더
function renderFavoritesPage() {
  const list = getFavoriteItems();

  renderCards(list);

  const count = document.getElementById("resultCount");
  if (count) {
    count.textContent = list.length === 0
      ? "즐겨찾기한 작품이 없습니다."
      : `${list.length}개 작품`;
  }

  const btn = document.getElementById("loadMoreBtn");
  if(btn) btn.style.display = "none";

  updateFavBadge();
}

/* =========================
   스크롤
========================= */

let scrollTopBtn;
let scrollBottomBtn;

document.addEventListener('DOMContentLoaded', () => {

  scrollTopBtn = document.getElementById('scrollTopBtn');
  scrollBottomBtn = document.getElementById('scrollBottomBtn');
  
  if (!scrollTopBtn || !scrollBottomBtn) return;
  
  scrollTopBtn.classList.add('scroll-hidden');

  scrollTopBtn.addEventListener('click', () => {
    smoothScrollTo(0, 1000);
  });

  scrollBottomBtn.addEventListener('click', () => {
    smoothScrollTo(document.body.scrollHeight, 1000);
  });

});

function smoothScrollTo(target, duration = 800) {
  const start = window.scrollY;
  const distance = target - start;
  const startTime = performance.now();

  function easeInOutQuad(t) {
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function animation(currentTime) {
    const time = Math.min(1, (currentTime - startTime) / duration);
    const eased = easeInOutQuad(time);

    window.scrollTo(0, start + distance * eased);

    if (time < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

let scrollTimer;

window.addEventListener('scroll', () => {
	  if (!scrollTopBtn || !scrollBottomBtn) return;
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // ✅ 스크롤 중 → 또렷
  scrollTopBtn.style.opacity = '1';
  scrollBottomBtn.style.opacity = '1';

  clearTimeout(scrollTimer);

  // ✅ 맨 위 → 즉시 흐림
  if (scrollY < 100) {
    scrollTopBtn.style.opacity = '0.4';
  }

  // ✅ 맨 아래 → 즉시 흐림
  if (scrollY > maxScroll - 100) {
    scrollBottomBtn.style.opacity = '0.4';
  }

  // ✅ 멈추면 → 전체 흐림
  scrollTimer = setTimeout(() => {
    scrollTopBtn.style.opacity = '0.4';
    scrollBottomBtn.style.opacity = '0.4';
  }, 600);

  // 기존 숨김 로직
  if (scrollY < 100) {
    scrollTopBtn.classList.add('scroll-hidden');
  } else {
    scrollTopBtn.classList.remove('scroll-hidden');
  }

  if (scrollY > maxScroll - 100) {
    scrollBottomBtn.classList.add('scroll-hidden');
  } else {
    scrollBottomBtn.classList.remove('scroll-hidden');
  }
});
