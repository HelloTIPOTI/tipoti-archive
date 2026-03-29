// 1. Firebase 라이브러리 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, push, remove, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 2. Firebase 설정 (databaseURL 추가됨)
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

let editingKey = null; 

/* =========================
   이미지 경로 처리
========================= */
function getImagePath(path) {
    if (!path) return "";
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
    preview.src = val; 
    preview.style.display = "block";
});

/* =========================
   데이터 가져오기 및 목록 렌더링
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
            Object.keys(data).reverse().forEach(key => {
                const item = data[key];
                const row = document.createElement("div");
                row.className = "list-row"; 
                row.style = "display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;";

                // 💡 여기서 onclick을 window.함수로 연결하여 모듈 시스템에서도 작동하게 함
                row.innerHTML = `
                    <div>
                        <b>${item.title || ""}</b>
                        <div style="font-size:12px; color:#777;">${item.artist || ""}</div>
                    </div>
                    <div>
                        <button onclick="window.editItem('${key}')">수정</button>
                        <button onclick="window.deleteItem('${key}')">삭제</button>
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
   추가 / 수정 실행 (generate)
========================= */
export const generate = window.generate = async function() { 
    const title = document.getElementById("title").value.trim();
    const thumbName = document.getElementById("thumbName").value.trim();

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
        thumbnail: thumbName, 
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
   수정 모드 진입 (editItem)
========================= */
export const editItem = window.editItem = async function(key) {
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
   삭제 (deleteItem)
========================= */
export const deleteItem = window.deleteItem = async function(key) {
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

// 초기 목록 불러오기 실행
renderList();