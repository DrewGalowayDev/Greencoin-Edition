import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_LOGO = join(__dirname, '../src/assets/GreenCoin_ A Digital Revolution.png');
const ANDROID_RES = join(__dirname, '../android/app/src/main/res');

// Define icon sizes for different densities
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Define splash screen sizes
const splashSizes = {
  'drawable-land-hdpi': { width: 800, height: 480 },
  'drawable-land-mdpi': { width: 480, height: 320 },
  'drawable-land-xhdpi': { width: 1280, height: 720 },
  'drawable-land-xxhdpi': { width: 1600, height: 960 },
  'drawable-land-xxxhdpi': { width: 1920, height: 1280 },
  'drawable-port-hdpi': { width: 480, height: 800 },
  'drawable-port-mdpi': { width: 320, height: 480 },
  'drawable-port-xhdpi': { width: 720, height: 1280 },
  'drawable-port-xxhdpi': { width: 960, height: 1600 },
  'drawable-port-xxxhdpi': { width: 1280, height: 1920 }
};

async function generateIcons() {
  for (const [density, size] of Object.entries(iconSizes)) {
    const dir = join(ANDROID_RES, density);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(SOURCE_LOGO)
      .resize(size, size)
      .toFile(join(dir, 'ic_launcher.png'));

    await sharp(SOURCE_LOGO)
      .resize(size, size)
      .toFile(join(dir, 'ic_launcher_round.png'));
  }
}

async function generateSplashScreens() {
  for (const [density, dimensions] of Object.entries(splashSizes)) {
    const dir = join(ANDROID_RES, density);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(SOURCE_LOGO)
      .resize(dimensions.width, dimensions.height, {
        fit: 'contain',
        background: { r: 26, g: 26, b: 26, alpha: 1 } // #1a1a1a background
      })
      .toFile(join(dir, 'splash.png'));
  }
}

async function main() {
  try {
    await generateIcons();
    await generateSplashScreens();
    console.log('Successfully generated Android resources');
  } catch (error) {
    console.error('Error generating resources:', error);
  }
}

main();