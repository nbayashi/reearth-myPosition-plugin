const html = `
<style>
  body { margin: 0; }
  .extendedh { width: 100%; }
  .extendedv { height: 100%; }
  #wrapper {
    border: 2px solid blue;
    border-radius: 5px;
    background-color: rgba(111, 111, 111, 0.5);
    box-sizing: border-box;
    width: 300px;
  }
  .extendedh body, .extendedh #wrapper { width: 100%; }
  .extendedv body, .extendedv #wrapper { height: 100%; }
</style>
<div id="wrapper">
  <div class="btn-margin">
      <button id="btn" class="btn btn-outline-primary btn-lg">
          Get location
      </button>
  </div>
  <div class="txt-margin">
      <p>Lat:<span id="latitude">???</span><span></span></p>
      <p>Lng:<span id="longitude">???</span><span></span></p>
  </div>
</div>
<script>
  let lat, lng;

  document.getElementById("btn").onclick = function(){
    // 位置情報を取得する
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  };

  // 取得に成功した場合の処理
  function successCallback(position){
    // 緯度を取得し画面に表示
    var lat = position.coords.latitude;
    document.getElementById("latitude").innerHTML = lat;
    // 経度を取得し画面に表示
    var lng = position.coords.longitude;
    document.getElementById("longitude").innerHTML = lng;
    if (position.coords.heading === null){
      var head = 0
    }else{
      var head = position.coords.heading;
    }
    
    parent.postMessage({ lat, lng, head }, "*");
  };

  // 取得に失敗した場合の処理
  function errorCallback(error){
      alert("位置情報が取得できませんでした");
  };





  const updateExtended = e => {
    if (e && e.horizontally) {
      document.documentElement.classList.add("extendedh");
    } else {
      document.documentElement.classList.remove("extendedh");
    }
    if (e && e.vertically) {
      document.documentElement.classList.add("extendedv");
    } else {
      document.documentElement.classList.remove("extendedv");
    }
  };

  addEventListener("message", e => {
    if (e.source !== parent || !e.data.extended) return;
    updateExtended(e.data.extended);
  });

  updateExtended(${JSON.stringify(reearth.widget.extended || null)});


</script>
`;

reearth.ui.show(html);

reearth.on("update", () => {
  reearth.ui.postMessage({
    extended: reearth.widget.extended,
  });
});



reearth.on("message", msg => {
  reearth.visualizer.camera.flyTo({
    lat: msg.lat,
    lng: msg.lng,
    height: 500,
    heading: msg.head * (Math.PI / 180),
    pitch: -90 * (Math.PI / 180),
    roll: 0,
  }, {
    duration: 2
  });
  const mytag = reearth.widget.property.default.positiontag;
  const myposition_tmp = reearth.layers.findByTagLabels(mytag);
  const myposition = myposition_tmp.flatMap(ch => (ch.children || [ch]));
  if (myposition) {
    for (let i = 0; i < myposition.length; i++) {
      reearth.layers.overrideProperty(myposition[i].id, {
        default: {
          location: { lat: msg.lat, lng: msg.lng },
          height: 0,
          heightReference: "clamp"
        }
      });
      if (myposition[i].type == "model") {
        reearth.layers.overrideProperty(myposition[i].id, {
          default: {
            heading: (msg.head - 90)
          }
        });
      }
    }
  }
});


