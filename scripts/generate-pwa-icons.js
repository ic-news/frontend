const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// PWA icon sizes
const sizes = [16, 32, 48, 72, 96, 120, 128, 144, 152, 180, 192, 384, 512];

const sourceIcon = path.join(__dirname, "../src/assets/logo.svg");
const outputDir = path.join(__dirname, "../public/icons");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));

      console.log(`Generated ${size}x${size} icon`);
    }

    // Generate favicon.ico (16x16 and 32x32)
    const faviconSizes = [16, 32];
    const faviconBuffers = await Promise.all(
      faviconSizes.map((size) =>
        sharp(sourceIcon)
          .resize(size, size, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .toBuffer()
      )
    );

    await sharp(faviconBuffers[0]).toFile(path.join(outputDir, "favicon.ico"));

    console.log("Generated favicon.ico");
    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
