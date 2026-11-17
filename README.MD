# DevForge E-Learning Platform

Prerequisites
Node.js v18 or higher
PostgreSQL database

Step 1: Environment Setup
Create a file named .env in the root directory and add the following variables:

DATABASE_URL="postgresql://postgres@localhost:5433/elearning_db?schema=public"
PORT=5000
NODE_ENV=development
AUTH_TOKEN_SECRET=replace-with-a-random-secret-at-least-32-characters-long
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
npx prisma migrate dev

For production environments deploy the migration
npx prisma migrate deploy

Step 3: Backend Setup
Install the backend dependencies from package.json
npm install

Start the development server
npm run dev

Step 4: Frontend Setup
Navigate to the client directory and install the dependencies from package.json
npm install

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

Render Demo Deployment
----------------------
The render.yaml Blueprint deploys the Next.js frontend, Express API, and PostgreSQL database on Render's free plans. In Render, create a new Blueprint from this repository and provide AUTH_TOKEN_SECRET when prompted. Generate a strong value locally with:

node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

The free web services sleep when idle. The free PostgreSQL database expires 30 days after creation and is deleted after a further 14-day grace period unless upgraded. This setup is for demos only; upgrade the database before storing data you need to keep.

After the first deployment, create an account through the app. To make it an administrator, run scripts/set-admin.js from a trusted local machine using the Render database's external connection URL and temporary ADMIN_EMAIL and ADMIN_PASSWORD environment variables. Do not commit database URLs or credentials.

Optional integrations can be configured in the Render dashboard: Stripe checkout requires STRIPE_SECRET_KEY; AWS media uploads require AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET; Judge0 requires NEXT_PUBLIC_JUDGE0_KEY. Contact messages are stored even when email credentials are absent. Render's free web services block outbound SMTP, so contact notification email requires a paid service or a non-SMTP email provider.
