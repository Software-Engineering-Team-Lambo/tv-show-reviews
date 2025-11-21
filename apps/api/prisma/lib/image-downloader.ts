import * as fs from "node:fs";
import * as path from "node:path";
import type { TmdbConfigurationResponse } from "../../src/types/tmdb.js";

export const IMAGES_DIR = path.join(
  process.cwd(),
  "..",
  "web",
  "public",
  "show_images"
);

export async function getTmdbConfiguration(
  apiKey: string
): Promise<TmdbConfigurationResponse> {
  console.log("Fetching TMDB configuration...");
  const response = await fetch(
    `https://api.themoviedb.org/3/configuration?api_key=${apiKey}`
  );
  const config: TmdbConfigurationResponse = await response.json();
  console.log(
    `✅ Available poster sizes: ${config.images.poster_sizes.join(", ")}`
  );
  return config;
}

export function setupImagesDirectory(): void {
  console.log("Setting up images directory...");
  if (fs.existsSync(IMAGES_DIR)) {
    console.log("Deleting existing images directory...");
    fs.rmSync(IMAGES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`✅ Created images directory: ${IMAGES_DIR}`);
}

export async function downloadImage(
  url: string,
  filepath: string
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download image: ${response.status} ${response.statusText}`
    );
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

export async function downloadShowPoster(
  showId: number,
  showTitle: string,
  posterPath: string | null,
  imageBaseUrl: string,
  posterSize: string = "w500"
): Promise<void> {
  if (!posterPath) {
    console.log(
      `⚠️  ${showTitle} (ID: ${showId}) has no poster path, skipping...`
    );
    return;
  }

  const imageUrl = `${imageBaseUrl}${posterSize}${posterPath}`;
  const filename = posterPath.slice(1);
  const filepath = path.join(IMAGES_DIR, filename);

  try {
    await downloadImage(imageUrl, filepath);
    console.log(`✅ Downloaded poster for ${showTitle}`);
  } catch (error) {
    console.error(`❌ Failed to download poster for ${showTitle}:`, error);
  }
}
