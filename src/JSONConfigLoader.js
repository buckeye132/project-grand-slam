class JSONConfigLoader {
  static LoadJson(jsonPath) {
    console.log("loading json");
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",jsonPath,false);
    Httpreq.send(null);
    return JSON.parse(Httpreq.responseText);
  }
}
