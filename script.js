let DATA=[];
let activeDay="전체";
let activeTags=[];

async function load(){

const res=await fetch("data.json");
DATA=await res.json();

renderFilters();
render();

}

function renderFilters(){

const days=["전체","월","화","수","목","금","토","일"];

const dayDiv=document.getElementById("dayFilter");
dayDiv.innerHTML="";

days.forEach(d=>{
const b=document.createElement("button");
b.textContent=d;
b.onclick=()=>{
activeDay=d;
render();
};
dayDiv.appendChild(b);
});

const tagSet=new Set();

DATA.forEach(w=>{
(w.tags||[]).forEach(t=>tagSet.add(t));
});

const tagDiv=document.getElementById("tagFilter");
tagDiv.innerHTML="";

tagSet.forEach(t=>{

const b=document.createElement("button");
b.textContent="#"+t;

b.onclick=()=>{

if(activeTags.includes(t)){
activeTags=activeTags.filter(x=>x!==t);
}else{
activeTags.push(t);
}

render();

};

tagDiv.appendChild(b);

});

}

function render(){

const container=document.getElementById("cards");
container.innerHTML="";

let list=DATA;

if(activeDay!=="전체"){
list=list.filter(w=>w.day===activeDay);
}

if(activeTags.length){
list=list.filter(w=>activeTags.every(t=>(w.tags||[]).includes(t)));
}

list.forEach(w=>{

const card=document.createElement("div");
card.className="card";

card.innerHTML=`
<img src="${w.thumbnail}">
<div class="info">
<h3>${w.title}</h3>
<p>${w.author}</p>
<span>⭐ ${w.rating}</span>
</div>
`;

container.appendChild(card);

});

}

load();