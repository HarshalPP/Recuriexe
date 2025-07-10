import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to download a single image
export const downloadImage = async (url, filepath) => {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    // Create a writable stream and pipe the response data
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    // Return a promise that resolves when the download is complete
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
  }
};

// Function to download all images from the URL array
export const downloadImages = async (urls) => {
  // Ensure the output directory exists
  const outputDir = path.resolve(process.cwd(), "image");
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    // Derive a filename from the URL or use a default
    const filename = path.basename(url).split("?")[0] || `image_${i}.jpg`;
    const filepath = path.resolve(outputDir, filename);

    // console.log(`Downloading ${url} to ${filepath}`);
    await downloadImage(url, filepath);
    // console.log(`Downloaded: ${filename}`);
  }
};
