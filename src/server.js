const http = require("http");
const url = require("url");
const fs = require("fs");

function start() {
    function onRequest(request, response) {
        let pathname = url.parse(request.url).pathname;
        const log = "Request for " + pathname + " received.\n";
        console.log(log);
        fs.appendFile('src/serverLog.log', log, err => {
            if (err) {
                console.log("文件写入失败");
            }
        });

        fs.writeFileSync('src/serverTemp.log', log);

        response.writeHead(200, {"Content-Type": "text/plain"});
        // const text = fs.readFileSync('src/student.json');
        const stu = new Student("travis", 28, 100);

        new Promise((resolve, reject) => {
            resolve(stu);

        }).then(stu => {
            stu.score += 100;
            response.write(JSON.stringify(stu));
            response.end();
        });

    }

    http.createServer(onRequest).listen(8888);
    console.log("Server has started.");
}

function route(pathname) {
    console.log("About to route a request for " + pathname);
}

class Student {
    constructor(name, age, score) {
        this.name = name;
        this.age = age;
        this.score = score;
    }
}

start(route);


