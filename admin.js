function generateJson(){
  const item = {
    id: Date.now(),
    title: document.getElementById("title").value,
    author: document.getElementById("author").value,
    rating: document.getElementById("rating").value,
    day: document.getElementById("day").value,
    episodes: document.getElementById("episodes").value,
    size: document.getElementById("size").value,
    type: document.getElementById("type").value,
    tags: document.getElementById("tags").value.split(",").map(v => v.trim()).filter(Boolean),
    thumbnail: document.getElementById("thumb").value
  };

  document.getElementById("output").value = JSON.stringify(item, null, 2);
}