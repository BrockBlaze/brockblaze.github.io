
  let temperature = parseFloat(document.getElementById('temperature').innerHTML);
  let s = parseFloat(document.getElementById('windspeed').innerHTML);
  let windchill = 35.74 + 0.6215 * temperature - 35.75 * Math.pow(s,.16) + .4275 * temperature * Math.pow(s,.16);

  
 document.getElementById("windchill").innerHTML = windchill.toFixed(1);
