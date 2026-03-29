// 1. Firebase 라이브러리 불러오기 (HTML 상단에 넣어도 되지만, JS 상단에 배치)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, push, remove, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 2. 질문자님의 Firebase 설정 (전달해주신 값)
const firebaseConfig = {
    apiKey: "AIzaSyCqUVEubrHk2A5gIGdSNum63NFUFCG1jQI",
    authDomain: "my-archive-00.firebaseapp.com",
    projectId: "my-archive-00",
    storageBucket: "my-archive-00.firebasestorage.app",
    messagingSenderId: "626393416245",
    appId: "1:626393416245:web:0d0b6fbd8fe76d2f77277c",
	databaseURL: "https://my-archive-00-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// 3. Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let editingKey = null; // 인덱스 대신 Firebase의 고유 키(Key)를 사용합니다.

/* =========================
   이미지 경로 처리 (수정됨)
   이제 파일명만 넣으면 깃허브 주소가 아니라고 판단하여 
   입력한 그대로(주소)를 반환하도록 변경합니다.
========================= */
function getImagePath(path) {
    if (!path) return "";
    // http로 시작하면 이미 온라인 주소이므로 그대로 반환, 아니면 예외처리
    return path.startsWith("http") ? path : path; 
}

/* =========================
   미리보기
========================= */
document.getElementById("thumbName").addEventListener("input", function() {
    const val = this.value.trim();
    const preview = document.getElementById("preview");
    if (!val) {
        preview.style.display = "none";
        return;
    }
    preview.src = val; // 이제 파일명이 아니라 '주소'를 넣으므로 바로 src에 대입
    preview.style.display = "block";
});

/* =========================
   데이터 가져오기 (Firebase 버전)
========================= */
async function renderList() {
    const wrap = document.getElementById("adminList");
    if (!wrap) return;

    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, 'userData'));
        wrap.innerHTML = "";
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            // 데이터를 화면에 그리기 (객체 형태이므로 반복문 처리)
            Object.keys(data).reverse().forEach(key => {
                const item = data[key];
                const row = document.createElement("div");
                row.className = "list-row"; // CSS용 클래스
                row.style = "display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;";

                row.innerHTML = `
                    <div>
                        <b>${item.title || ""}</b>
                        <div style="font-size:12px; color:#777;">${item.artist || ""}</div>
                    </div>
                    <div>
                        <button onclick="editItem('${key}')">수정</button>
                        <button onclick="deleteItem('${key}')">삭제</button>
                    </div>
                `;
                wrap.appendChild(row);
            });
        }
    } catch (error) {
        console.error("데이터 불러오기 실패:", error);
    }
}

/* =========================
   추가 / 수정 (Firebase 저장)
========================= */
export const generate = window.generate = async function() { // HTML에서 호출할 수 있도록 window에 바인딩
    const title = document.getElementById("title").value.trim();
    const thumbName = document.getElementById("thumbName").value.trim(); // 이제 여기에 깃허브 주소를 넣습니다.

    if (!title) { alert("⚠️ 작품명을 입력하세요"); return; }
    
    const item = {
        title: title,
        artist: document.getElementById("artist").value,
        writer: document.getElementById("writer").value,
        rating: document.getElementById("rating").value,
        category: document.getElementById("category").value,
        episodes: document.getElementById("episodes").value,
        size: document.getElementById("size").value,
        type: document.getElementById("type").value,
        note: document.getElementById("note").value,
        thumbnail: thumbName, // 깃허브 주소 그대로 저장
        tags: (document.getElementById("tags").value || "").split(",").map(t => t.trim()).filter(t => t)
    };

    try {
        if (editingKey) {
            await set(ref(db, 'userData/' + editingKey), item);
            alert("✅ 수정 완료");
        } else {
            const newListRef = push(ref(db, 'userData'));
            await set(newListRef, item);
            alert("✅ 추가 완료");
        }
        resetForm();
        renderList();
    } catch (e) {
        alert("💥 저장 실패!");
        console.error(e);
    }
};

/* =========================
   수정 모드 진입
========================= */
window.editItem = async function(key) {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `userData/${key}`));
    if (snapshot.exists()) {
        const item = snapshot.val();
        editingKey = key;

        document.getElementById("title").value = item.title || "";
        document.getElementById("artist").value = item.artist || "";
        document.getElementById("writer").value = item.writer || "";
        document.getElementById("rating").value = item.rating || "";
        document.getElementById("category").value = item.category || "";
        document.getElementById("episodes").value = item.episodes || "";
        document.getElementById("size").value = item.size || "";
        document.getElementById("type").value = item.type || "";
        document.getElementById("tags").value = (item.tags || []).join(",");
        document.getElementById("note").value = item.note || "";
        document.getElementById("thumbName").value = item.thumbnail || "";

        if (item.thumbnail) {
            document.getElementById("preview").src = item.thumbnail;
            document.getElementById("preview").style.display = "block";
        }
        document.getElementById("submitBtn").innerText = "수정 완료";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
};

/* =========================
   삭제
========================= */
window.deleteItem = async function(key) {
    if (!confirm("정말 삭제할까요?")) return;
    await remove(ref(db, `userData/${key}`));
    renderList();
};

function resetForm() {
    document.querySelectorAll(".admin-form input, .admin-form textarea").forEach(i => i.value = "");
    document.getElementById("preview").style.display = "none";
    editingKey = null;
    document.getElementById("submitBtn").innerText = "+ 작품 추가";
}

// 초기 리스트 실행
renderList();