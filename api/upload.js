const express = require('express');
const multer = require('multer');
const Arweave = require('arweave');
const fs = require('fs');
const cors = require('cors');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static('.'));

// Set up multer for file upload
//const storage = multer.memoryStorage();
//const upload = multer({ storage: storage });
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for uploads
// Initialize Arweave
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});

// Define a root route
app.get('/', (req, res) => {
    res.sendFile('index.html');
});

// POST route for file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log('File upload request received'); // Log for incoming request
    try {
        const keyPath = `${process.cwd()}/arweave-keyfile.json`; // Adjusted path for Vercel
        if (!fs.existsSync(keyPath)) {
            console.error(`Key file not found: ${keyPath}`);
            return res.status(500).json({ error: 'Key file not found.' });
        }
        
        const key = JSON.parse(fs.readFileSync(keyPath)); // Read the key file
        console.log('Key file loaded successfully'); // Log successful key file loading

        const fileData = req.file.buffer; // Get file data from multer
        if (!fileData) {
            console.error('No file data received');
            return res.status(400).json({ error: 'No file data received.' });
        }

        const transaction = await arweave.createTransaction({ data: fileData }, key);
        console.log('Transaction created successfully'); // Log successful transaction creation

        transaction.addTag('Content-Type', req.file.mimetype); // Set content type based on uploaded file
        await arweave.transactions.sign(transaction, key);
        console.log('Transaction signed successfully'); // Log successful transaction signing

        const response = await arweave.transactions.post(transaction);
        console.log('Transaction posted successfully', response); // Log successful transaction posting

        // Respond with the transaction ID and link to the uploaded file
        res.json({ link: `https://arweave.net/${transaction.id}` });
    } catch (error) {
        console.error("Error during file upload:", error);
        res.status(500).json({ error: 'File upload failed.', details: error.message });
    }
});

// Start the server



// Start the server (this is not needed in Vercel; it will automatically handle this)
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
