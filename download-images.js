const fs = require('fs');
const https = require('https');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Function to download image
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }
            
            const filePath = path.join(imagesDir, filename);
            const fileStream = fs.createWriteStream(filePath);
            
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded ${filename}`);
                resolve();
            });
            
            fileStream.on('error', (err) => {
                fs.unlink(filePath, () => {});
                reject(err);
            });
        }).on('error', reject);
    });
}

// Download both logos
async function downloadLogos() {
    try {
        // Updated URLs for the logo images
        await downloadImage('https://copyprojects.ecanarys.com/wp-content/uploads/2023/01/cropped-Canarys-copy-project-1.png', 'copyproject-logo.png');
        await downloadImage('https://ecanarys.com/wp-content/uploads/2022/05/canarys-logo.png', 'canarys-logo.png');
        console.log('All images downloaded successfully');
    } catch (error) {
        console.error('Error downloading images:', error);
    }
}

downloadLogos();
