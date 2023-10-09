var http = require('http')
var { Client } = require('pg')

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'sampledatabase',
    password: 'santhosh',
    port: 5432, // The default PostgreSQL port is 5432
});

client.connect().then((res) => {
    console.log("****", res);
}).catch((err) => {
    console.log("*******", err);
})

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' }); // http header
    var url = req.url;
    console.log("urllllll", url);
    var method = req.method;
    switch (method) {
        case 'GET':
            if (url === '/products') {
                console.log(method, "urllllll", url);
                client.query('select * from products', (err, result) => {
                    if (!err) {
                        let getData = result.rows[0]
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(getData));
                        // console.log("getData",getData);
                    }
                })
            }
            break;
        case 'POST':
            break;
        case 'DELET':

            break;
        case 'PUT':

            break;
        default:
            break;
    }

    // if (url === '/about') {
    //     res.write('<h1>about us page<h1>'); //write a response
    //     res.end(); //end the response
    // } else if (url === '/contact') {
    //     res.write('<h1>contact us page<h1>'); //write a response
    //     res.end(); //end the response
    // } else {
    //     res.write('Hello World!'); //write a response
    //     res.end(); //end the response
    // }
}).listen(3000, () => {
    console.log("Server Started post Numner 3000");
})