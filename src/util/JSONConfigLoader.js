class JSONConfigLoader {
  static LoadJson(jsonPath, fs = null) {
    if (typeof window === 'undefined') {
      var json = fs.readFileSync(jsonPath, 'utf8')
    } else {
      var Httpreq = new XMLHttpRequest(); // a new request
      Httpreq.open("GET",jsonPath,false);
      Httpreq.send(null);
      var json = Httpreq.responseText;
    }
    return JSON.parse(json);
  }
}

if (typeof window === 'undefined') {
  module.exports = JSONConfigLoader;
}
