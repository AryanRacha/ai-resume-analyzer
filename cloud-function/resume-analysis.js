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
    console.log(`New file detected: ${fileName} in bucket ${bucket}`);

    const fileContent = await fetchFileContent(bucket, fileName);

    const processorName = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;
    const request = {
      name: processorName,
      rawDocument: {
        content: fileContent,
        mimeType: "application/pdf",
      },
    };

    const [result] = await documentaiClient.processDocument(request);
    const document = result.document;

    const extractedText = document.text || "No text extracted";
    console.log("Text extracted from Document AI.", extractedText);

    const resumeData = await extractResumeData(extractedText);
    console.log("Structured data from Gemini:", resumeData);

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
          created_at: new Date().toISOString(),
        },
      ]);

    console.log(`Successfully saved analysis for ${fileName} to BigQuery!`);
  } catch (error) {
    console.error("Error in resumeAnalyzer:", error);
  }
});
