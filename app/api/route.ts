import { NextApiRequest, NextApiResponse } from "next";

import { pipeline } from "@xenova/transformers";

// Inicializar el pipeline como singleton
let generatePipeline: any = null;

async function initializePipeline() {
  if (!generatePipeline) {
    generatePipeline = await pipeline(
      "text-generation",
      "your-model-name", // Reemplazar con el nombre de tu modelo
      {
        quantized: true, // Para reducir el tamaño del modelo
      }
    );
  }
  return generatePipeline;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const pipe = await initializePipeline();
    const result = await pipe(`[INST] ${prompt} [/INST]`, {
      max_length: 200,
      temperature: 0.7,
    });

    return res.status(200).json({
      generated_text: result[0].generated_text,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: "Error generating response",
    });
  }
}
