
function generate(){

 const item={
  title:document.getElementById("title").value,
  author:document.getElementById("author").value,
  rating:document.getElementById("rating").value,
  day:document.getElementById("day").value,
  episodes:document.getElementById("episodes").value,
  size:document.getElementById("size").value,
  type:document.getElementById("type").value,
  thumbnail:document.getElementById("thumb").value,
  tags:document.getElementById("tags").value.split(",").map(t=>t.trim())
 };

 document.getElementById("output").value=JSON.stringify(item,null,2);
}
