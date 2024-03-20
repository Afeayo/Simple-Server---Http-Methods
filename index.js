const http = require('http');
const fs = require('fs');
const path = require('path');

const HOSTNAME = 'localhost';
const PORT = 8000;

const authorDataBase = path.join(__dirname, "dataBase", 'authorsDB.json');
const booksDataBase = path.join(__dirname, "dataBase", 'booksDb.json');

try {
    const data = fs.readFileSync(booksDataBase);
    books = JSON.parse(data);
} catch (error) {
    console.error(`Error reading books data: ${error.message}`);
}

try {
    const data = fs.readFileSync(authorDataBase);
    authors = JSON.parse(data);
} catch (error) {
    console.error(`Error reading authors data: ${error.message}`);
}

const writeBooksToFile = () => {
    fs.writeFile(booksDataBase, JSON.stringify(books, null, 2), (err) => {
        if (err) {
            console.error(`Error writing books data: ${err.message}`);
        }
    });
};

const writeAuthorsToFile = () => {
    fs.writeFile(authorDataBase, JSON.stringify(authors, null, 2), (err) => {
        if (err) {
            console.error(`Error writing authors data: ${err.message}`);
        }
    });
};

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function requestHandler(req, res) {
    console.log('Received request:', req.url, req.method);

    if (req.url === '/books' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(books));
    } else if (req.url === '/books/author' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(authors));
    } else if (req.url.startsWith('/books/') && req.method === 'GET') {
        const bookId = req.url.split('/')[2];
        const book = books.find(book => book.id === bookId);
        if (book) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(book));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Book not found.');
        }
    } else if (req.url.startsWith('/books/') && req.method === 'PUT') {
        const authorId = req.url.split('/').pop();
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            console.log('End of data stream');
            const updatedAuthor = JSON.parse(data);
            console.log('Updated Author:', updatedAuthor);
            console.log('Author IDs:', authors.map(author => author.id));

            const index = authors.findIndex(author => author.id === authorId);
          

            if (index !== -1) {
                authors[index] = { ...authors[index], ...updatedAuthor };
                writeAuthorsToFile();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(authors[index]));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Author not found.');
            }
        });
    } else if (req.url.startsWith('/books/') && req.method === 'DELETE') {
            const bookId = req.url.split('/').pop();
            const index = books.findIndex(book => book.id === bookId);
            if (index !== -1) {
                books.splice(index, 1);
                writeBooksToFile();
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Book deleted successfully.');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Book not found.');
            }
        }
        
     else if (req.url.startsWith('/books/author/') && req.method === 'GET') {
        const authorId = req.url.split('/').pop(); 
        const author = authors.find(author => author.id === authorId);
        if (author) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(author));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Author not found.');
        }
    } else if (req.url === '/books/author' && req.method === 'POST') {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            const newAuthor = JSON.parse(data);
            newAuthor.id = generateUniqueId(); 
            authors.push(newAuthor);
            writeAuthorsToFile();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newAuthor));
        });
    } else {
        
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Route not found.');

        
    }

    
}


const server = http.createServer(requestHandler);
server.listen(PORT, HOSTNAME, () => {
    console.log(`Server listening @ ${HOSTNAME}:${PORT}`);
});
