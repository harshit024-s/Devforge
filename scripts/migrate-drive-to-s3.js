require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const S3_BUCKET = process.env.AWS_S3_BUCKET;
const S3_REGION = process.env.AWS_REGION;
const S3_PREFIX = process.env.S3_UPLOAD_PREFIX || "courses/media";
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "./service-account.json";
const TEMP_DIR = path.join(__dirname, ".tmp-downloads");

const s3 = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function getAuth() {
  const keyFile = path.resolve(SERVICE_ACCOUNT_PATH);
  if (!fs.existsSync(keyFile)) {
    throw new Error(`Service account key not found at: ${keyFile}`);
  }
  return new google.auth.GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

async function listFiles(drive, folderId) {
  const files = [];
  let pageToken = null;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, size)",
      pageSize: 100,
      pageToken,
    });

    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files;
}

async function downloadFile(drive, fileId, destPath) {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    res.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function uploadToS3(filePath, s3Key, mimeType) {
  const fileStream = fs.createReadStream(filePath);

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: fileStream,
      ContentType: mimeType,
    })
  );

  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${s3Key}`;
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
}

function cleanup() {
  if (fs.existsSync(TEMP_DIR)) {
    const files = fs.readdirSync(TEMP_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(TEMP_DIR, file));
    }
    fs.rmdirSync(TEMP_DIR);
  }
}

async function main() {
  if (!DRIVE_FOLDER_ID) {
    console.error("DRIVE_FOLDER_ID is not set in .env");
    process.exit(1);
  }
  if (!S3_BUCKET || !S3_REGION) {
    console.error("AWS_S3_BUCKET and AWS_REGION must be set in .env");
    process.exit(1);
  }

  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  console.log(`Fetching files from Google Drive folder: ${DRIVE_FOLDER_ID}\n`);
  const files = await listFiles(drive, DRIVE_FOLDER_ID);

  if (files.length === 0) {
    console.log("No files found in the folder.");
    process.exit(0);
  }

  console.log(`Found ${files.length} file(s). Starting migration...\n`);

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = `[${i + 1}/${files.length}]`;
    const safeName = sanitizeFileName(file.name);
    const s3Key = `${S3_PREFIX}/${safeName}`;
    const tempPath = path.join(TEMP_DIR, safeName);

    try {
      process.stdout.write(`${progress} Downloading "${file.name}"...`);
      await downloadFile(drive, file.id, tempPath);
      console.log(" done");

      process.stdout.write(`${progress} Uploading to S3 as "${s3Key}"...`);
      const s3Url = await uploadToS3(tempPath, s3Key, file.mimeType);
      console.log(" done");

      results.push({
        originalName: file.name,
        mimeType: file.mimeType,
        size: Number(file.size) || null,
        s3Key,
        s3Url,
      });

      successCount++;
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
      failCount++;
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  cleanup();

  console.log(`\nMigration complete: ${successCount} succeeded, ${failCount} failed.\n`);

  const outputPath = path.join(__dirname, "migration-output.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Results saved to: ${outputPath}\n`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("Migration failed:", err);
  cleanup();
  process.exit(1);
});
