const https = require('https');
const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Function to download image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        console.log(`Attempting to download from: ${url}`);
        
        const request = https.get(url, (response) => {
            console.log(`Response status code: ${response.statusCode}`);
            
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded successfully to: ${filepath}`);
                    resolve();
                });
                
                file.on('error', (err) => {
                    fs.unlink(filepath, () => {});
                    reject(err);
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                console.log(`Redirected to: ${response.headers.location}`);
                downloadImage(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
            } else {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
            }
        });
        
        request.on('error', (err) => {
            console.error(`Request error: ${err.message}`);
            reject(err);
        });
    });
}

// Alternative URLs for the images
const copyProjectLogoUrl = 'https://copyprojects.ecanarys.com/wp-content/uploads/2023/01/cropped-Canarys-copy-project-1.png';
const canarysLogoUrl = 'https://ecanarys.com/wp-content/uploads/2022/05/canarys-logo.png';

// Try to download both logos
(async () => {
    try {
        await downloadImage(
            copyProjectLogoUrl, 
            path.join(imagesDir, 'copyproject-logo.png')
        );
        
        await downloadImage(
            canarysLogoUrl, 
            path.join(imagesDir, 'canarys-logo.png')
        );
        
        console.log('All images downloaded successfully');
    } catch (error) {
        console.error('Error downloading images:', error);
    }
})();
