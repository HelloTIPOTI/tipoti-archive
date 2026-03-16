
let DATA=[];
let activeDay="전체";
let activeTags=[];
let searchQuery="";

async function loadData(){
 const res=await fetch("data.json");
 DATA=await res.json();
 renderFilters();
 renderCards();
}

function normalize(t){
 return String(t||"").toLowerCase().replace(/\s+/g,"");
}

function uniqueTags(){
 const set=new Set();
 DATA.forEach(i=>{
  (i.tags||[]).forEach(t=>set.add(t));
 });
 return [...set];
}

function renderFilters(){

 const dayWrap=document.getElementById("dayFilter");
 const tagWrap=document.getElementById("tagFilter");

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

 const q=normalize(searchQuery);

 return DATA.filter(item=>{

  const text=normalize(
   item.title + item.author + (item.tags||[]).join("")
  );

  const searchMatch =
   q.length<2 ? true : text.includes(q);

  if(q.length>=2) return searchMatch;

  const dayMatch=activeDay==="전체"?true:item.day===activeDay;

  const tagMatch=activeTags.length===0
   ? true
   : activeTags.every(tag=>(item.tags||[]).includes(tag));

  return dayMatch && tagMatch;

 });

}

function renderCards(){

 const wrap=document.getElementById("cards");
 const list=filteredData();

 const count=document.getElementById("resultCount");

 if(searchQuery.trim().length>=2){
  count.textContent="검색 결과 "+list.length+"개";
 }else{
  count.textContent="전체 "+list.length+"개 작품";
 }

 wrap.innerHTML="";

 list.forEach((item,index)=>{

  const card=document.createElement("a");
  card.className="card";
  card.href="detail.html?id="+index;

  card.innerHTML=`
   <img class="card-thumb" src="${item.thumbnail}">

   <div class="card-body">

    <div class="card-title">${item.title}</div>

    <div class="card-author">${item.author}</div>

    <div class="card-rating">★ ${item.rating}</div>

    <div>
    ${(item.tags||[]).map(t=>`<span class="tag">#${t}</span>`).join("")}
    </div>

   </div>
  `;

  wrap.appendChild(card);

 });

}

document.addEventListener("DOMContentLoaded",()=>{

 const search=document.getElementById("searchInput");

 search.addEventListener("input",e=>{

  searchQuery=e.target.value;

  if(searchQuery.trim().length>=2){
   activeDay="전체";
   activeTags=[];
   renderFilters();
  }

  renderCards();

 });

 loadData();

});
