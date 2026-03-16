async function loadDetail(){

 const params = new URLSearchParams(location.search);
 const id = params.get("id");

 const res = await fetch("data.json");
 const data = await res.json();

 const item = data[id];

 const wrap = document.getElementById("detailWrap");

 wrap.innerHTML = `

 <a href="index.html" class="back-link">← 아카이브로 돌아가기</a>

 <div class="detail-grid">

 <img class="detail-cover" src="${item.thumbnail}">

 <div>

 <div class="detail-title">${item.title}</div>

 <div class="meta-item">
 <div class="meta-label">평점</div>
 <div class="meta-value card-rating">★ ${item.rating}</div>
 </div>

 <div class="meta-item">
 <div class="meta-label">회차</div>
 <div class="meta-value">${item.episodes}</div>
 </div>

 <div class="meta-item">
 <div class="meta-label">용량</div>
 <div class="meta-value">${item.size}</div>
 </div>

 <div class="meta-item">
 <div class="meta-label">타입</div>
 <div class="meta-value">${item.type}</div>
 </div>

 <div class="meta-item">
 <div class="meta-label">작가</div>
 <div class="meta-value">${item.author}</div>
 </div>

 <div class="meta-item">
 <div class="meta-label">요일</div>
 <div class="meta-value">${item.day}</div>
 </div>

 <div class="meta-item">
 <div class="meta-label">태그</div>
 <div class="meta-value">
 ${(item.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}
 </div>
 </div>

 </div>

 </div>
 `;
}

document.addEventListener("DOMContentLoaded", loadDetail);