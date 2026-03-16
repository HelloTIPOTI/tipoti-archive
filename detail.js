async function loadDetail(){
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const res = await fetch("data.json");
  const data = await res.json();

  const item = data.find((x, i) => String(x.id || i) === String(id));
  const wrap = document.getElementById("detailWrap");

  if(!item){
    wrap.innerHTML = '<p class="empty-state">작품 정보를 찾을 수 없습니다.</p>';
    return;
  }

  wrap.innerHTML = `
    <a href="index.html" class="back-link">← 아카이브로 돌아가기</a>
    <div class="detail-grid">
      <div>
        <img class="detail-cover" src="${item.thumbnail}" alt="${item.title}">
      </div>
      <div>
        <h1 class="detail-title">${item.title}</h1>
        <div class="detail-meta">
          <div class="meta-item"><div class="meta-label">평점</div><div class="meta-value">⭐ ${item.rating || "-"}</div></div>
          <div class="meta-item"><div class="meta-label">회차</div><div class="meta-value">${item.episodes || "-"}</div></div>
          <div class="meta-item"><div class="meta-label">용량</div><div class="meta-value">${item.size || "-"}</div></div>
          <div class="meta-item"><div class="meta-label">타입</div><div class="meta-value">${item.type || "-"}</div></div>
          <div class="meta-item"><div class="meta-label">작가</div><div class="meta-value">${item.author || "-"}</div></div>
          <div class="meta-item"><div class="meta-label">요일</div><div class="meta-value">${item.day || "-"}</div></div>
          <div class="meta-item"><div class="meta-label">태그</div><div class="detail-tags">${(item.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join("")}</div></div>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", loadDetail);