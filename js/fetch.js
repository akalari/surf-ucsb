// County Data URLs from Spitcast and OpenWeather API
var urlWaterTemp = "http://api.spitcast.com/api/county/water-temperature/santa-barbara/";
var urlWind = "http://api.spitcast.com/api/county/wind/santa-barbara/";
var urlSwell = "http://api.spitcast.com/api/county/swell/santa-barbara/";
var urlTide = "http://api.spitcast.com/api/county/tide/santa-barbara/";
var urlWeather = "http://api.openweathermap.org/data/2.5/weather?lat=35&lon=-120&units=imperial&appid=135760273c771df61f0839c8082cd122";
// Spot Specific Data - Needs spot ID to function
var urlWaveHeight = "http://api.spitcast.com/api/spot/forecast/179/";
    
// Array of Spot Names and IDs
var spotnames = ["Campus Point", "Devereaux", "Sands", "Rincon"];
var spotid = [179, 181, 182, 198];
var spotnum = [4, 3, 2, 6];

function waterTempCallback(response) {
  // Parses JSON for Temperature
  var temperature = parseInt(JSON.parse(response).fahrenheit);
  var waterTempHtml = '<div>' + Math.round(temperature) + '&deg;</div>';
  document.getElementById('waterTemp').innerHTML = waterTempHtml;
}
function windCallback(response) {
  // Parses JSON for Temperature
  var jsonResponse = JSON.parse(response);
  
  var time = new Date();
  var hours = time.getHours();
  
  var windspeed = jsonResponse[hours].speed_kts;
  var winddirection = jsonResponse[hours].direction_text;

  var windspeedHtml = '<div>' + Math.round(windspeed) + '</div>';
  var winddirectionHtml = '<div>' + winddirection + '</div>';
  document.getElementById('speed').innerHTML = windspeedHtml;
  document.getElementById('direction').innerHTML = winddirectionHtml;
}
function tideCallback(response) {
  var jsonResponse = JSON.parse(response);
  var tideObj = { // JSON object for Chart.js
    "xLabels": [],
    "yValues": []
  }
  for (var i = 0; i < jsonResponse.length - 1; i++) { 
      tideObj.xLabels.push(jsonResponse[i].hour);
      tideObj.yValues.push(parseFloat(jsonResponse[i].tide.toFixed(2))+1);
  }
  var ctxTide = document.getElementById("tidechart");
  var tidechart = new Chart(ctxTide, {
      type: 'bar',
      responsive: true,
      data: {
        labels: tideObj.xLabels,
        datasets: [{
          label: 'Tide',
          data: tideObj.yValues,
          backgroundColor: 'rgba(154, 158, 161, 0.89)',
          borderColor: 'rgba(216, 219, 222, 0.89)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              display: false,
              min: 0
            },
            gridLines: {
              display: false
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            }
          }]
        }
      }
  });
}
function weatherCallback(response) {
  // Parses JSON for temperature
  var temp = Math.round(JSON.parse(response).main.temp);
  var tempHtml = '<div>' + Math.round(temp) + '&deg</div>';
  document.getElementById('temperature').innerHTML = tempHtml;
  
  // Parses for Sunset and Sunrise
  var sunrise = JSON.parse(response).sys.sunrise;
  var sunset = JSON. parse(response).sys.sunset;
  
  var ampm = function (hours) {
    suffix = (hours >= 12)? ' PM' : ' AM';
    hours = (hours > 12)? hours -12 : hours;
    hours = (hours == '00')? 12 : hours;
    return hours+suffix;
  }
  
  sunrise = ampm((new Date(sunrise*1000)).getHours());
  sunset = ampm((new Date(sunset*1000)).getHours());

  var riseHtml = '<div>' + sunrise + '\t / ' + sunset + '</div>';
  document.getElementById('sunriseset').innerHTML = riseHtml;  
}
function swellCallback(response) {
  var jsonResponse = JSON.parse(response);
  var time = new Date();
  var hours = time.getHours();
  var swell = jsonResponse[hours];
  for (var index = 0; index < spotnum.length; index++)
    swellsize.push(swell[spotnum[index]]);
}
function waveHeightCallback(response) {
  var jsonResponse = JSON.parse(response);
    
  var time = new Date();
  var hours = time.getHours();
  var waveheight = jsonResponse[hours].size_ft;
  
  var waveObj = {
      "date": jsonResponse[0].date,
      "xLabels": [],
      "yValues": []
  };
  for (var i = 0; i < jsonResponse.length - 1; i++) {
      waveObj.xLabels.push(jsonResponse[i].hour);
      waveObj.yValues.push(parseFloat(jsonResponse[i].size_ft.toFixed(2)));
  }
  var ctxWave = document.getElementById("wavechart");
  var wavechart = new Chart(ctxWave, {
      type: 'bar',
      data: {
          labels: waveObj.xLabels,
          datasets: [{
              label: 'Wave Height',
              data: waveObj.yValues,
              backgroundColor: 'rgba(21, 44, 66, 0.89)',
              borderColor: 'rgba(216, 219, 222, 0.89)',
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true,
                      max: 10,
                      min: 0
                  }
              }]
          }
      }
  });
}

/**
 * Pulls JSON file from the specified URL
 * Passes url into the specified callback function
 *
 * @param url The data source
 * @param callback The callback/data handler function
 */
function getAsync(url, callback) {
    var xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, true);
    xmlHttpReq.onreadystatechange = function() {
        // Status 200 and ReadyState 4 signal successful request
        if (xmlHttpReq.status == 200 && xmlHttpReq.readyState == 4)
            callback(xmlHttpReq.responseText);
    }
    xmlHttpReq.send(null);
}

// Send Requests for Countywide Conditions
getAsync(urlWaterTemp, waterTempCallback);
getAsync(urlWind, windCallback);
getAsync(urlSwell, swellCallback);
getAsync(urlTide, tideCallback);
getAsync(urlWeather, weatherCallback);
// Send Request for Spot Specific Conditions
getAsync(urlWaveHeight, waveHeightCallback);

// Listeners re-render wave height chart when changing break
document.getElementById("changecampus").addEventListener('click', function () {
  urlWaveHeight = urlWaveHeight.slice(0, -4);
  urlWaveHeight = urlWaveHeight + spotid[0] + '/';
  getAsync(urlWaveHeight, waveHeightCallback);
}); 
document.getElementById("changedev").addEventListener('click', function () {
  urlWaveHeight = urlWaveHeight.slice(0, -4);
  urlWaveHeight = urlWaveHeight + spotid[1] + '/';
  getAsync(urlWaveHeight, waveHeightCallback);
}); 
document.getElementById("changesands").addEventListener('click', function () {
  urlWaveHeight = urlWaveHeight.slice(0, -4);
  urlWaveHeight = urlWaveHeight + spotid[2] + '/';
  getAsync(urlWaveHeight, waveHeightCallback);
}); 
document.getElementById("changerincon").addEventListener('click', function () {
  urlWaveHeight = urlWaveHeight.slice(0, -4);
  urlWaveHeight = urlWaveHeight + spotid[3] + '/';
  getAsync(urlWaveHeight, waveHeightCallback);
}); 
