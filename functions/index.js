
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Configuration, OpenAIApi } = require("openai");
const pdfParse = require("pdf-parse");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Konfigurasi OpenAI
const openai = new OpenAIApi(new Configuration({
  apiKey: "YOUR_OPENAI_API_KEY",
}));

// API untuk upload berkas perkara
exports.uploadCaseFile = functions.https.onRequest(async (req, res) => {
  try {
    const file = req.body.file; // Base64 file
    const fileName = `cases/${Date.now()}.pdf`;
    const bucket = storage.bucket();
    const fileRef = bucket.file(fileName);

    await fileRef.save(Buffer.from(file, "base64"), { contentType: "application/pdf" });
    res.status(200).json({ message: "File uploaded successfully!", fileName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API untuk membaca UU dari PDF
exports.readLawDocument = functions.https.onRequest(async (req, res) => {
  try {
    const { documentId } = req.body;
    const docRef = db.collection("laws").doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error("Document not found");
    }

    const pdfFile = await storage.bucket().file(doc.data().filePath).download();
    const pdfData = await pdfParse(pdfFile[0]);

    res.status(200).json({ text: pdfData.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API untuk ChatGPT
exports.askAI = functions.https.onRequest(async (req, res) => {
  try {
    const { question, context } = req.body;
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert legal assistant." },
        { role: "user", content: `Context: ${context}. Question: ${question}` },
      ],
    });
    res.status(200).json({ answer: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
