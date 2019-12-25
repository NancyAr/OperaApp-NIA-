setInterval(() => {
  const resp = await fetch({
    url: "http://localhost:5000/user/watcher/<%=eventId%>",
    method: "GET"
  }).catch(err => console.log(err));
  console.log("LOL");

  const json = await resp.json();

  console.log(json);
}, 1000).catch(err => console.log(err));
