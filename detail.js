// 1. Firebase 라이브러리 및 설정
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

async function loadDetail() {
    const wrap = document.getElementById("detailWrap");
    if (!wrap) return;

    // 1. URL에서 작품의 고유 ID(Key)를 가져옵니다. (예: detail.html?id=-Nxyz...)
    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    // 만약 URL에 ID가 없다면 localStorage에 저장된 임시 데이터를 사용합니다 (백업 로직)
    if (!id) {
        const localItem = JSON.parse(localStorage.getItem("selectedItem"));
        if (localItem) {
            renderDetail(localItem);
            return;
        }
        wrap.innerHTML = "<p>작품 정보를 찾을 수 없습니다.</p>";
        return;
    }

    // 2. Firebase에서 해당 ID의 데이터를 직접 가져옵니다.
    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, `userData/${id}`));
        if (snapshot.exists()) {
            const item = snapshot.val();
            renderDetail(item);
        } else {
            wrap.innerHTML = "<p>삭제되었거나 존재하지 않는 작품입니다.</p>";
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        wrap.innerHTML = "<p>데이터를 불러오는 중 오류가 발생했습니다.</p>";
    }
}

// 화면에 데이터를 그려주는 함수
function renderDetail(item) {
    const wrap = document.getElementById("detailWrap");
    
    // 작가 이름 처리 (그림/스토리 작가 합치기)
    let authorText = "";
    if (item.artist && item.writer) {
        authorText = `${item.artist} / ${item.writer}`;
    } else {
        authorText = item.artist || item.writer || item.author || "미상";
    }

    wrap.innerHTML = `
        <a href="javascript:history.back()" class="back-link">← 아카이브로 돌아가기</a>
        <div class="detail-grid">
            <img class="detail-cover" src="${item.thumbnail || ''}" alt="썸네일">
            <div>
                <div class="detail-title">${item.title || "제목 없음"}</div>
                
                <div class="meta-item">
                    <div class="meta-label">평점</div>
                    <div class="meta-value"><span class="detail-star">★</span> ${item.rating || "0.0"}</div>
                </div>

                <div class="meta-item"><div class="meta-label">회차</div><div class="meta-value">${item.episodes || "-"}</div></div>
                <div class="meta-item"><div class="meta-label">용량</div><div class="meta-value">${item.size || "-"}</div></div>
                <div class="meta-item"><div class="meta-label">타입</div><div class="meta-value">${item.type || "-"}</div></div>
                <div class="meta-item"><div class="meta-label">작가</div><div class="meta-value">${authorText}</div></div>
                <div class="meta-item"><div class="meta-label">분류</div><div class="meta-value">${item.category || item.day || "-"}</div></div>
                
                <div class="meta-item">
                    <div class="meta-label">태그</div>
                    <div class="meta-value">
                        ${(item.tags || []).map(t => `<span class="tag">#${t}</span>`).join("")}
                    </div>
                </div>

                ${item.note ? `<div class="meta-item"><div class="meta-label">비고</div><div class="meta-value">${item.note}</div></div>` : ""}
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", loadDetail);