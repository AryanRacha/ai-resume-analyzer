import { GoogleGenAI } from "@google/genai";
import { Storage } from "@google-cloud/storage";

const genAI = new GoogleGenAI({});
const storage = new Storage();

export async function extractResumeData(text) {
  const response = await genAI.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
              Extract this resume text into a valid JSON object in the following structure:

              {
                "name": "",
                "email": "",
                "phone": "",
                "skills": {
                  "frontend": [],
                  "backend": [],
                  "database": [],
                  "devops": [],
                  "other": []
                },
                "education": "",
                "years_of_experience": "",
                "last_company": "",
                "projects": [
                  {
                    "title": "",
                    "summary": "",
                    "tech_stack": ""
                  }
                ],
                "summary": "Summarize the resume here..."
              }

              Resume text:
              """
              ${text}
              """
              Return only valid JSON, no explanation.
            `,
          },
        ],
      },
    ],
  });

  const rawText = response.candidates[0].content.parts[0].text;

  try {
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}") + 1;
    const jsonStr = rawText.slice(jsonStart, jsonEnd);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(
      "Error parsing JSON from Gemini:",
      err,
      "\nRaw response:",
      rawText
    );
    return {};
  }
}

export async function fetchFileContent(bucketName, fileName) {
  const file = storage.bucket(bucketName).file(fileName);
  const [contents] = await file.download();
  return contents;
}
