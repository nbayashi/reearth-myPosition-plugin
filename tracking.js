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
      <button id="btn">
          Tracking start
      </button>
      <input type="checkbox" id="follow" name="follow">
      <label for="follow">Follow</label>
  </div>
  <div class="txt-margin">
      <p>Time:<span id="time">???</span></p>
      <p>Lat:<span id="latitude">???</span><span></span></p>
      <p>Lng:<span id="longitude">???</span><span></span></p>
  </div>
</div>
<script>
  let lat, lng, watch_id, follow;


  
  var optionObj = {
  "enableHighAccuracy": true ,
  "timeout": 600000 ,
  "maximumAge": 10000000 ,
  } ;

  watch_id=0;
  document.getElementById("btn").onclick = function(){
    if(watch_id != 0){
			// リアルタイム監視を停止
			navigator.geolocation.clearWatch(watch_id);
      watch_id=0;
			// ボタン表記を変更
      document.getElementById("btn").innerHTML ="Tracking start";
    }else{
      // 位置情報を取得する
      watch_id = navigator.geolocation.watchPosition(successCallback, errorCallback,optionObj);
    }

  };

  // 取得に成功した場合の処理
  function successCallback(position){
    // Timeを取得し画面に表示
    var date = position.timestamp;
    if( typeof(date) =="number"){
      date=new Date(date);
    }
    document.getElementById("time").innerHTML = date;
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
    document.getElementById("btn").innerHTML ="Tracking stop";

    var follow = document.getElementById("follow").checked;
    parent.postMessage({ lat, lng, head, follow }, "*");
  };


  // 取得に失敗した場合の処理
  function errorCallback(error){
			// リアルタイム監視を停止
			navigator.geolocation.clearWatch(watch_id);
			// ボタン表記を変更
      document.getElementById("btn").innerHTML ="トラッキング開始";
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
  if (msg.follow == true) {
    reearth.visualizer.camera.flyTo({
      lat: msg.lat,
      lng: msg.lng,
      height: 500,
      heading: msg.head * (Math.PI / 180),
      pitch: -90 * (Math.PI / 180),
      roll: 0,
    }, {
      duration: 1
    });
  }
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
