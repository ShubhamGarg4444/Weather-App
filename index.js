const http = require('http');
const fs = require('fs');
const url = require('url') ;
var requests = require("requests");

const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(2);

const replaceVal = (tempVal, orgVal) => {
    let temperature = tempVal.replace("{%tempval%}", kelvinToCelsius(orgVal.main.temp));
    temperature = temperature.replace("{%tempmin%}", kelvinToCelsius(orgVal.main.temp_min));
    temperature = temperature.replace("{%tempmax%}", kelvinToCelsius(orgVal.main.temp_max));
    temperature = temperature.replace("{%location%}", orgVal.name);
    temperature = temperature.replace("{%country%}", orgVal.sys.country);
    temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);
    return temperature;
};

const server = http.createServer((req, res) => {

    if (req.url === "/") {
        fs.readFile("home.html", "utf-8", (err, homeFile) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end("<h1>Failed to load the page</h1>");
                return;
            }

            requests('https://api.openweathermap.org/data/2.5/weather?q=Panchkula&appid=895a6f98e3bacf8b1f23a50ad51b9cfd')
                .on('data', (chunk) => {
                    const objdata = JSON.parse(chunk);
                    const realTimeData = replaceVal(homeFile, objdata);
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(realTimeData);
                })
                .on('error', (err) => {
                    console.log("API request failed:", err);
                    res.writeHead(500, { "Content-Type": "text/html" });
                    res.end("<h1>Error fetching weather data</h1>");
                });
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 - Page Not Found</h1>");
    }
});

server.listen(8000, "127.0.0.1", () => {
    console.log("Server running at http://127.0.0.1:8000/");
});




