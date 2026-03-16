function generate(){

const item={

title:document.getElementById("title").value,
author:document.getElementById("author").value,
rating:document.getElementById("rating").value,
day:document.getElementById("day").value,
tags:document.getElementById("tags").value.split(","),
thumbnail:document.getElementById("thumb").value

};

document.getElementById("output").value=JSON.stringify(item,null,2);

}