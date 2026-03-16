let DATA = [];
let activeDay = "전체";
let activeTags = [];
let searchQuery = "";

async function loadData(){
  const res = await fetch("data.json");
  DATA = await res.json();
  renderFilters();
  renderCards();
}

function normalize(text){
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g,"");
}

function uniqueTags(){
  const set = new Set();
  DATA.forEach(item=>{
    (item.tags || []).forEach(tag=>set.add(tag));
  });
  return [...set];
}

function renderFilters(){

  const dayWrap = document.getElementById("dayFilter");
  const tagWrap = document.getElementById("tagFilter");

  const days=["전체","월","화","수","목","금","토","일"];

  dayWrap.innerHTML="";

  days.forEach(day=>{

    const btn=document.createElement("button");
    btn.className="pill"+(activeDay===day?" active":"");
    btn.textContent=day;

    btn.onclick=()=>{
      activeDay=day;
      renderFilters();
      renderCards();
    };

    dayWrap.appendChild(btn);

  });

  tagWrap.innerHTML="";

  uniqueTags().forEach(tag=>{

    const btn=document.createElement("button");
    btn.className="pill"+(activeTags.includes(tag)?" active":"");
    btn.textContent="#"+tag;

    btn.onclick=()=>{

      if(activeTags.includes(tag)){
        activeTags=activeTags.filter(t=>t!==tag);
      }else{
        activeTags.push(tag);
      }

      renderFilters();
      renderCards();

    };

    tagWrap.appendChild(btn);

  });

}

function filteredData(){

  const q = normalize(searchQuery);

  return DATA.filter(item=>{

    // 검색용 텍스트
    const searchTarget = normalize(
      item.title +
      item.author +
      (item.tags || []).join("")
    );

    const searchMatch = q===""
      ? true
      : searchTarget.includes(q);

    // 검색 중이면 필터 무시
    if(q){
      return searchMatch;
    }

    const dayMatch =
      activeDay==="전체" ? true : item.day===activeDay;

    const tagMatch =
      activeTags.length===0
        ? true
        : activeTags.every(tag => (item.tags||[]).includes(tag));

    return dayMatch && tagMatch;

  });

}

function renderCards(){

  const wrap=document.getElementById("cards");
  const list=filteredData();

  wrap.innerHTML="";

  if(list.length===0){
    wrap.innerHTML='<div class="empty-state">검색 결과가 없습니다.</div>';
    return;
  }

  list.forEach((item,index)=>{

    const card=document.createElement("a");
    card.className="card";
    card.href=`detail.html?id=${item.id || index}`;

    card.innerHTML=`
      <img class="card-thumb" src="${item.thumbnail}">
      <div class="card-body">
        <h2 class="card-title">${item.title}</h2>
        <div class="card-author">${item.author}</div>
        <div class="card-rating">⭐ ${item.rating}</div>
        <div class="tag-list">
          ${(item.tags||[]).map(tag=>`<span class="tag">#${tag}</span>`).join("")}
        </div>
      </div>
    `;

    wrap.appendChild(card);

  });

}

document.addEventListener("DOMContentLoaded",()=>{

  const search=document.getElementById("searchInput");

  search.addEventListener("input",(e)=>{

    searchQuery=e.target.value;

    // 검색 시작하면 필터 초기화
    if(searchQuery.trim() !== ""){
      activeDay="전체";
      activeTags=[];
      renderFilters();
    }

    renderCards();

  });

  loadData();

});