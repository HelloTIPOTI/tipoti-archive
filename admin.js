let data=[];

async function init(){
 const res = await fetch('data.json');
 data = await res.json();
}
init();

function add(){

 const item={
  title:document.getElementById("title").value,
  author:document.getElementById("author").value,
  rating:document.getElementById("rating").value,
  thumbnail:document.getElementById("thumb").value
 };

 data.push(item);

 document.getElementById("output").value =
 JSON.stringify(data,null,2);
}