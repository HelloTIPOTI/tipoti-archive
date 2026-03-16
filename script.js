async function load(){
 const res = await fetch('data.json');
 const data = await res.json();

 const container = document.getElementById("cards");
 container.innerHTML="";

 data.forEach(w=>{
  const card = document.createElement("div");
  card.className="card";

  card.innerHTML = `
   <img src="${w.thumbnail}">
   <div class="info">
    <h3>${w.title}</h3>
    <p>${w.author}</p>
    <span class="rating">⭐ ${w.rating}</span>
   </div>
  `;

  container.appendChild(card);
 });

}
load();