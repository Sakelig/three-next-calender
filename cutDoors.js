const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const doorData = {
  imageSize: { width: 1311, height: 1668 },
  doorSize: { width: 176, height: 216 },
  positions: []
};

// EXACT SAME CALCULATION AS Examples.jsx
// In Examples.jsx:
// const x = (col - 2.5) * 0.35
// const y = (1.5 - row) * 0.7
// 3D box dimensions: [2.2, 2.8, 0.3]
// Door dimensions: [0.35, 0.43, 0.015]

const box3DWidth = 2.2;
const box3DHeight = 2.8;
const door3DWidth = 0.35;
const door3DHeight = 0.43;

// Calculate pixels per 3D unit
const pixelsPerUnitX = doorData.imageSize.width / box3DWidth;  // 1311 / 2.2
const pixelsPerUnitY = doorData.imageSize.height / box3DHeight; // 1668 / 2.8

console.log(`Pixels per unit: X=${pixelsPerUnitX.toFixed(2)}, Y=${pixelsPerUnitY.toFixed(2)}`);

// Door size in pixels (based on 3D door dimensions)
const doorWidthPixels = Math.round(door3DWidth * pixelsPerUnitX);
const doorHeightPixels = Math.round(door3DHeight * pixelsPerUnitY);

console.log(`Calculated door size: ${doorWidthPixels} × ${doorHeightPixels} pixels`);

// Override doorData with calculated values
doorData.doorSize.width = doorWidthPixels;
doorData.doorSize.height = doorHeightPixels;

// Generate all 24 door positions using EXACT same formula as Examples.jsx
for (let i = 0; i < 24; i++) {
  const row = Math.floor(i / 6);
  const col = i % 6;

  // EXACT formula from Examples.jsx
  const x3D = (col - 2.5) * 0.35;
  const y3D = (1.5 - row) * 0.7;

  // Convert 3D coordinates to pixel coordinates
  // 3D: center is at (0, 0), ranges from -1.1 to 1.1 (width), -1.4 to 1.4 (height)
  // Pixels: top-left is (0, 0)
  const xPixel = (x3D + (box3DWidth / 2)) * pixelsPerUnitX - (doorWidthPixels / 2) + 5; // Moved 10px left
  const yPixel = ((box3DHeight / 2) - y3D) * pixelsPerUnitY - (doorHeightPixels / 2);

  const doorNumber = i + 1;

  doorData.positions.push({
    door: doorNumber,
    x: Math.round(xPixel),
    y: Math.round(yPixel)
  });
}

console.log(`\nDoor positions calculated using Examples.jsx formula:`);
for (let row = 0; row < 4; row++) {
  console.log(`\nRow ${row + 1}:`);
  for (let col = 0; col < 6; col++) {
    const doorIndex = row * 6 + col;
    const pos = doorData.positions[doorIndex];
    console.log(`  Door ${pos.door}: x=${pos.x}, y=${pos.y}`);
  }
}

console.log(`\nDoor 1: x=${doorData.positions[0].x}, y=${doorData.positions[0].y}`);
console.log(`Door 24: x=${doorData.positions[23].x}, y=${doorData.positions[23].y}`);
console.log(`Door 24 bottom-right: x=${doorData.positions[23].x + doorData.doorSize.width}, y=${doorData.positions[23].y + doorData.doorSize.height}\n`);

async function cutDoors() {
  // Input image path - adjust this to your actual calendar image
  const inputImage = './public/The_Wiggsters.jpg';

  // Output directory for cut doors
  const outputDir = './public/door-outside-images';

  // Check if input image exists
  if (!fs.existsSync(inputImage)) {
    console.error(`❌ Error: Input image not found at ${inputImage}`);
    console.log('Please update the inputImage path in cutDoors.js to point to your calendar image.');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  }

  console.log('🎄 Starting to cut doors from calendar image...\n');

  try {
    // First, resize the image to the expected dimensions
    console.log(`📏 Resizing calendar image to ${doorData.imageSize.width}×${doorData.imageSize.height}...`);
    const resizedImageBuffer = await sharp(inputImage)
      .resize(doorData.imageSize.width, doorData.imageSize.height, {
        fit: 'fill' // Force exact dimensions
      })
      .toBuffer();

    console.log('✅ Image resized successfully!\n');

    // Now cut doors from the resized image buffer
    for (const position of doorData.positions) {
      const outputPath = path.join(outputDir, `door-${position.door}.png`);

      await sharp(resizedImageBuffer)
        .extract({
          left: position.x,
          top: position.y,
          width: doorData.doorSize.width,
          height: doorData.doorSize.height
        })
        .toFile(outputPath);

      console.log(`✓ Cut door ${position.door.toString().padStart(2, ' ')} -> ${outputPath}`);
    }

    console.log('\n🎉 All 24 doors cut successfully!');
    console.log(`\n📂 Output location: ${path.resolve(outputDir)}`);
    console.log('\nYou can now use these images as outsideImage for each door.');
  } catch (error) {
    console.error('❌ Error cutting doors:', error.message);
    process.exit(1);
  }
}

cutDoors().catch(console.error);
