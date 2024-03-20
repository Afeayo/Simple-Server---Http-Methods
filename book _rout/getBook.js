// book_rout/getBook.js

const fs = require('fs');
const path = require('path');

const bookDataBase = path.join(__dirname, "dataBase", 'booksDb.json');

function getBooks(req, res) {
    fs.readFile(bookDataBase, "utf8", (err, data) => {
        if (err) {
            console.log(err);
            res.writeHead(400);
            res.end("An error occurred");
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
    });
}

module.exports = getBooks;
