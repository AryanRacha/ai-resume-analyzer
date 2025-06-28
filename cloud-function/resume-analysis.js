import { cloudEvent } from "@google-cloud/functions-framework";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { BigQuery } from "@google-cloud/bigquery";
import { fetchFileContent, extractResumeData } from "./helpers.js";

const documentaiClient = new DocumentProcessorServiceClient();
const bigquery = new BigQuery();

const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = process.env.LOCATION;
const PROCESSOR_ID = process.env.PROCESSOR_ID;
const DATASET_ID = process.env.DATASET_ID;
const TABLE_ID = process.env.TABLE_ID;

cloudEvent("resumeAnalyzer", async (event) => {
  try {
    const { bucket, name: fileName } = event.data;
    console.log(
      `📄 New resume detected: "${fileName}" in bucket "${bucket}". Starting analysis...`
    );

    const fileContent = await fetchFileContent(bucket, fileName);
    console.log(`☁️ Successfully fetched file content from Cloud Storage.`);

    const processorName = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;
    const request = {
      name: processorName,
      rawDocument: {
        content: fileContent,
        mimeType: "application/pdf",
      },
    };

    console.log(
      `🤖 Sending document to Document AI processor: ${processorName}`
    );
    const [result] = await documentaiClient.processDocument(request);
    const document = result.document;

    const extractedText = document.text || "No text extracted";
    console.log(
      `✅ Text successfully extracted from Document AI (length: ${extractedText.length} characters).`
    );

    console.log(`🔎 Extracting structured resume data using Gemini...`);
    const resumeData = await extractResumeData(extractedText);
    console.log(`🎯 Resume data extracted:`, resumeData);

    console.log(
      `📥 Inserting structured data into BigQuery dataset "${DATASET_ID}", table "${TABLE_ID}"...`
    );
    await bigquery
      .dataset(DATASET_ID)
      .table(TABLE_ID)
      .insert([
        {
          file_name: fileName,
          candidate_name: resumeData.name || "Not Provided",
          email: resumeData.email || "Not provided",
          phone: resumeData.phone || "Not provided",
          skills: JSON.stringify(resumeData.skills || {}),
          education: resumeData.education || "",
          years_of_experience: resumeData.years_of_experience || "",
          last_company: resumeData.last_company || "",
          projects: JSON.stringify(resumeData.projects || []),
          summary: resumeData.summary || "Not available",
          created_at: new Date().toISOString(),
        },
      ]);

    console.log(
      `🚀 Successfully saved analysis for "${fileName}" to BigQuery! 🎉`
    );
  } catch (error) {
    console.error(`❌ Error during resume analysis:`, error);
  }
});
