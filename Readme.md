# AI Resume Analyzer — Cloud Computing Project

This project is a **Resume Analyzer Tool** built using Google Cloud Platform (GCP).

It allows recruiters to analyze resumes stored in Google Cloud Storage, extract important data using Document AI and Gemini, and view ranked results in a professional dashboard.

## 💡 Features

- ✅ Upload resumes (PDF) directly to GCS bucket
- ✅ Automated text extraction using **Document AI**
- ✅ Advanced summarization & structured parsing using **Gemini AI**
- ✅ Stores analysis in **BigQuery**
- ✅ SSR web app to view all analyzed resumes
- ✅ Clean, modern UI with detailed candidate info

## 🏗️ Architecture

```
            Recruiter Upload
                    ↓
                GCS Bucket
                    ↓
  Trigger Cloud Function (Event-Driven)
                    ↓
      Document AI: Extract raw text
                    ↓
  Gemini: Summarize & structure into JSON
                    ↓
      BigQuery: Store candidate data
                    ↓
Web App: Display results on /results page
```

## 🚀 Technologies Used

- HTML, CSS, EJS (SSR frontend)
- Node.js (SSR App & Cloud Function)
- Google Cloud Run Functions (Gen2)
- Google Cloud Storage
- Google Document AI
- Gemini AI (Google GenAI SDK)
- BigQuery

## 💬 How It Works

1️⃣ Recruiter uploads resumes to a GCS bucket.  
2️⃣ A Cloud Function automatically triggers on new uploads.  
3️⃣ The function uses Document AI to extract text, then sends it to Gemini to convert into structured JSON (skills, projects, experience, etc.).  
4️⃣ The data is inserted into BigQuery for analysis.  
5️⃣ The web app queries BigQuery and shows a results dashboard.

## ⚡ Quick Start

### Web App

```bash
cd web-app
npm install
npm start
```

Visit http://localhost:3000/results to view analyzed resumes.

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

Use **`** instead of \ for Windows
