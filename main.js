const WebSocket = require('ws')
var http = require('http');
var url = require('url');
var port = 8080
var st = require('node-static');

var mysql = require('mysql'); //npm i

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "weatherbot"
});

var fileServer = new st.Server('./public');

var httpserver = http.createServer(function (request, response) {
    request.on('end', function () {
        var get = url.parse(request.url, true).query;
        //var get = url.parse(request.url, true).query;
        fileServer.serve(request, response);
    }).resume();
    //response.end("hello");
}).listen(port, function () {
    console.log((new Date()) +
        ` Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({ server: httpserver });
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

wss.on('connection', function (ws) {
    ws.send('Welcome To Our WebBase WeatherBot')

    ws.on('message', message => {
        console.log(`Received message => ${message} length : ${message.length}`)
        
        if(message!=null)
            var sql = "select * from weather where message like '%" + message + "%' ";
        con.query(sql, function (err, result) {
            if (err) throw err;
            try {
                //doAthing();
                console.log("1 record Found");
                console.log(result);
                console.log(result.length);
               

                if (result != null){
                    ind = getRandomInt(0,result.length-1);    
                    var string=JSON.stringify(result);
                    var json =  JSON.parse(string);                
                    // console.log(json[ind].return_msg);
                        ws.send(json[ind].return_message);
                }
            } catch (e) {
                console.log(e);
                ws.send("No Anser Found By WeatherBot Sry About That !");
                // [Error: Uh oh!]
            }
            
        });

    })

})