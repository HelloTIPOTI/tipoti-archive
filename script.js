
let DATA=[]

fetch('data.json')
.then(r=>r.json())
.then(d=>{
DATA=d
render(DATA)
createTags()
})

function render(list){
let grid=document.getElementById('grid')
grid.innerHTML=''

list.forEach(w=>{
let card=document.createElement('div')
card.className='card'

card.innerHTML=`
<img src="${w.cover}">
<div class="meta">
<div>${w.title}</div>
<div>${w.author}</div>
<div class="rating">⭐ ${w.rating}</div>
</div>
`
grid.appendChild(card)
})
}

function createTags(){
let set=new Set()
DATA.forEach(w=>w.tags.forEach(t=>set.add(t)))
let wrap=document.getElementById('tagFilter')
set.forEach(tag=>{
let b=document.createElement('button')
b.textContent='#'+tag
b.onclick=()=>{
render(DATA.filter(w=>w.tags.includes(tag)))
}
wrap.appendChild(b)
})
}

document.getElementById('search').oninput=e=>{
let q=e.target.value.toLowerCase()
render(DATA.filter(w=>w.title.toLowerCase().includes(q)||w.author.toLowerCase().includes(q)))
}

document.querySelectorAll('#dayFilter button').forEach(b=>{
b.onclick=()=>{
document.querySelectorAll('#dayFilter button').forEach(x=>x.classList.remove('active'))
b.classList.add('active')
let day=b.dataset.day
if(day==='all'){render(DATA);return}
render(DATA.filter(w=>w.day===day))
}
})
