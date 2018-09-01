// Public API URLs
var urlWaterTemp =
    "http://api.spitcast.com/api/county/water-temperature/santa-barbara/";
var urlWind =
    "http://api.spitcast.com/api/county/wind/santa-barbara/";
// Spot 179 is Campus Point @ UCSB
var urlWaveHeight =
    "http://api.spitcast.com/api/spot/forecast/179/";

function waterTempCallback(response) {
    // Parses JSON for Temperature
    var temperature = parseInt(JSON.parse(response).fahrenheit);
    return;
}

function windCallback(response) {
    var jsonResponse = JSON.parse(response);
    document.getElementById('date').innerHTML = jsonResponse[0].date;
    var windObj = { // JSON object to be used by Chart.js
        "xLabels": [],
        "yValues": []
    }
    for (var i = 0; i < jsonResponse.length - 1; i++) {
        // length-1 because the data includes 12AM for the following day
        windObj.xLabels.push(jsonResponse[i].hour);
        windObj.yValues.push(
            parseFloat(jsonResponse[i].speed_mph.toFixed(2)));
    }
    var windchart = new Chart(ctxWind, {
        type: 'bar',
        responsive: true,
        data: {
            labels: windObj.xLabels,
            datasets: [{
                label: 'Wind Speed',
                data: windObj.yValues,
                backgroundColor: 'rgba(154, 158, 161, 0.89)',
                borderColor: 'rgba(216, 219, 222, 0.89)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function waveHeightCallback(response) {
    var jsonResponse = JSON.parse(response);
    var waveObj = {
        "date": jsonResponse[0].date,
        "xLabels": [],
        "yValues": []
    };
    for (var i = 0; i < jsonResponse.length - 1; i++) {
        waveObj.xLabels.push(jsonResponse[i].hour);
        waveObj.yValues.push(parseFloat(jsonResponse[i].size_ft.toFixed(2)));
    }
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
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    return wavechart;
}

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

// Send requests for Conditions
getAsync(urlWaterTemp, waterTempCallback);
getAsync(urlWind, windCallback);
getAsync(urlWaveHeight, waveHeightCallback);
