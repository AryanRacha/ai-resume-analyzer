# AI Resume Analyzer — Cloud Computing Project

This project is a **Resume Analyzer Tool** built using Google Cloud Platform (GCP).

It allows recruiters to analyze resumes stored in Google Cloud Storage, extract important data using Document AI and Gemini, and view ranked results in a professional dashboard.

## 🎥 Demo Video

https://github.com/user-attachments/assets/4918b5c0-14cd-4454-85a2-82ce08197bf1

## 🚀 Technologies Used

- HTML, CSS, EJS (SSR frontend)
- Node.js (SSR App & Cloud Function)
- Google Cloud Run Functions (Gen2)
- Google Cloud Storage
- Google Document AI
- Gemini AI (Google GenAI SDK)
- BigQuery

## 🏗️ Architecture

![image](https://github.com/user-attachments/assets/ed0edce4-8374-452c-b578-5a6783ee09c9)


## 💬 How It Works

1️⃣ Recruiter uploads resumes to a GCS bucket.  
2️⃣ A Cloud Function automatically triggers on new uploads.  
3️⃣ The function uses Document AI to extract text, then sends it to Gemini to convert into structured JSON (skills, projects, experience, etc.).  
4️⃣ The data is inserted into BigQuery for analysis.  
5️⃣ The web app queries BigQuery and shows a results dashboard.

## ⚡ Quick Start

### Deploy the Cloud Function

```bash
cd cloud-function
npm install

# Deploy
gcloud functions deploy resumeAnalyzer \
  --gen2 \
  --region=YOUR_REGION \
  --runtime=nodejs20 \
  --entry-point=resumeAnalyzer \
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
  --trigger-event-filters="bucket=YOUR_BUCKET_NAME" \
  --source=. \
  --set-env-vars="PROJECT_ID=your-project-id,LOCATION=us,PROCESSOR_ID=your-processor-id,DATASET_ID=your-dataset-id,TABLE_ID=resumes,GEMINI_API_KEY=your-gemini-key"
```

Note: Use **`** instead of \ for Windows

### Start the Web App

```bash
cd web-app
npm install
npm start
```

Visit http://localhost:3000/results to view analyzed resumes.


