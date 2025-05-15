import { VertexAI } from "@google-cloud/vertexai";

export function vertexClient() {
  const credential = JSON.parse(
    Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, "base64").toString()
  );
  const vertexAi = new VertexAI({
    project: process.env.PROJECT_ID,
    location: "us-central1",
    googleAuthOptions: { credentials: credential },
  });
  return vertexAi;
}
