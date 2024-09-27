const http = require('http');
const fs = require('fs');
const url = require('url');
const { v4: uuidv4 } = require('uuid'); // Unique ID for each breed

const PORT = 3000;

// Utility function to read dog breeds from JSON file
function readBreeds(callback) {
    fs.readFile('dogs.json', 'utf8', (err, data) => {
        if (err) throw err;
        callback(JSON.parse(data));
    });
}

// Utility function to write breeds to the JSON file
function writeBreeds(breeds, callback) {
    fs.writeFile('dogs.json', JSON.stringify(breeds, null, 2), 'utf8', err => {
        if (err) throw err;
        callback();
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/breeds' && req.method === 'GET') {
        // READ - Get all breeds
        readBreeds(breeds => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(breeds));
        });

    } else if (pathname === '/breed' && req.method === 'POST') {
        // CREATE - Add a new breed
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newBreed = JSON.parse(body);
            newBreed.id = uuidv4(); // Assign a unique ID

            readBreeds(breeds => {
                breeds.push(newBreed);
                writeBreeds(breeds, () => {
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newBreed));
                });
            });
        });

    } else if (pathname.startsWith('/breed/') && req.method === 'PUT') {
        // UPDATE - Update an existing breed by ID
        const id = pathname.split('/')[2];
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedBreed = JSON.parse(body);

            readBreeds(breeds => {
                const index = breeds.findIndex(b => b.id === id);
                if (index !== -1) {
                    breeds[index] = { ...breeds[index], ...updatedBreed };
                    writeBreeds(breeds, () => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(breeds[index]));
                    });
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Breed not found' }));
                }
            });
        });

    } else if (pathname.startsWith('/breed/') && req.method === 'DELETE') {
        // DELETE - Remove a breed by ID
        const id = pathname.split('/')[2];

        readBreeds(breeds => {
            const filteredBreeds = breeds.filter(b => b.id !== id);
            if (filteredBreeds.length !== breeds.length) {
                writeBreeds(filteredBreeds, () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Breed deleted' }));
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Breed not found' }));
            }
        });

    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

// Start server
server.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});