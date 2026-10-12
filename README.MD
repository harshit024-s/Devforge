# DevForge E-Learning Platform

Prerequisites
Node.js v18 or higher
PostgreSQL database

Step 1: Environment Setup
Create a file named .env in the root directory and add the following variables:

DATABASE_URL="postgresql://postgres@localhost:5433/elearning_db?schema=public"
PORT=5000
NODE_ENV=development
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
CLIENT_URL=http://localhost:3000
DRIVE_FOLDER_ID=your-google-drive-folder-id
GOOGLE_SERVICE_ACCOUNT_KEY=./service-account.json
S3_UPLOAD_PREFIX=courses/media

Create a file named .env.local in the client directory and add the following variables

NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_JUDGE0_API=https://judge0-ce.p.rapidapi.com
NEXT_PUBLIC_JUDGE0_KEY=your-rapidapi-key

Step 2: Database Setup
Install the Prisma CLI and Prisma Client
npm install prisma @prisma/client

Generate the Prisma Client
npx prisma generate

Run the database migration to create tables
npx prisma migrate dev --name init

For production environments deploy the migration
npx prisma migrate deploy

Step 3: Backend Setup
Install the backend dependencies
npm install express cors dotenv bcrypt zod @aws-sdk/client-s3 @aws-sdk/s3-request-presigner stripe googleapis

Start the development server
npm run dev

Step 4: Frontend Setup
Navigate to the client directory and install the required dependencies
npm install @monaco-editor/react

Start the Next.js development server
npm run dev

Step 5: Google Drive to S3 Migration
Ensure the Google Service Account JSON key is saved as service-account.json in the root directory
Ensure the Service Account has Viewer access to the Google Drive folder

Run the migration script to transfer files from Drive to S3
npm run migrate:drive

Step 6: Stripe Configuration
Add the webhook endpoint in the Stripe Dashboard to listen for checkout.session.completed events
Update the webhook secret in the environment variables if required for future webhook implementation

Step 7: AWS S3 Configuration
Ensure the S3 bucket has the correct CORS configuration to allow direct browser uploads
AllowedMethods: PUT
AllowedOrigins: http://localhost:3000
ExposeHeaders: ETag
MaxAgeSeconds: 3600
