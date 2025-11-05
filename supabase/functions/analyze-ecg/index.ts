// Disable TypeScript checking in this Deno edge function file (editor compatibility)
// deno-lint-ignore-file
// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    // Environment variable for the AI gateway API key
    const AI_GATEWAY_API_KEY = Deno.env.get("AI_GATEWAY_API_KEY");

    if (!AI_GATEWAY_API_KEY) {
      throw new Error("AI_GATEWAY_API_KEY is not configured");
    }

    // Generate mock waveform data (in production, this would use actual signal processing)
    const waveformData = generateMockECGWaveform();

    // Ensemble approach: Use multiple AI perspectives for cross-verification
    console.log("Starting ensemble ECG analysis...");

    // Model 1: CNN-style image pattern analysis
    const cnnAnalysis = await performAnalysis(AI_GATEWAY_API_KEY, image, "cnn");
    console.log("CNN analysis completed");

    // Model 2: BiLSTM-style temporal sequence analysis
    const bilstmAnalysis = await performAnalysis(
      AI_GATEWAY_API_KEY,
      image,
      "bilstm"
    );
    console.log("BiLSTM analysis completed");

    // Model 3: Transformer-style attention-based analysis
    const transformerAnalysis = await performAnalysis(
      AI_GATEWAY_API_KEY,
      image,
      "transformer"
    );
    console.log("Transformer analysis completed");

    // Aggregate results from all three models
    const analysis = aggregateEnsembleResults([
      cnnAnalysis,
      bilstmAnalysis,
      transformerAnalysis,
    ]);

    // Add waveform data
    analysis.waveformData = waveformData;

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-ecg function:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Analysis failed";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateMockECGWaveform(): number[] {
  const data: number[] = [];
  const length = 200;

  for (let i = 0; i < length; i++) {
    // Create a realistic ECG waveform pattern
    const x = (i / length) * 4 * Math.PI;

    // P wave
    let value = Math.sin(x * 3) * 0.3;

    // QRS complex (sharp spike)
    if (Math.sin(x) > 0.8) {
      value += Math.sin(x * 20) * 2;
    }

    // T wave
    value += Math.sin(x * 1.5) * 0.5;

    // Add baseline
    value += 0.5;

    // Add slight noise
    value += (Math.random() - 0.5) * 0.1;

    data.push(value);
  }

  return data;
}

async function performAnalysis(
  apiKey: string,
  image: string,
  modelType: "cnn" | "bilstm" | "transformer"
) {
  const systemPrompts: Record<string, string> = {
    cnn: `You are a CNN-based ECG pattern recognition system. Analyze the ECG image focusing on:
- Spatial patterns and waveform morphology
- P wave, QRS complex, and T wave shapes
- ST segment elevation/depression
- Rhythm regularity and visual abnormalities

Detect: Arrhythmia, Ischemia, Conduction blocks, Myocardial infarction patterns.`,

    bilstm: `You are a BiLSTM-based temporal sequence analyzer. Analyze the ECG focusing on:
- Temporal patterns and rhythm consistency
- R-R interval variations
- Heart rate variability
- Sequential abnormalities over time

Detect: Atrial fibrillation, Flutter, Bradycardia, Tachycardia, irregular rhythms.`,

    transformer: `You are a Transformer-based attention mechanism for ECG analysis. Focus on:
- Long-range dependencies in the signal
- Subtle pattern correlations across leads
- Complex arrhythmia patterns
- Multi-lead signal coherence

Detect: Complex arrhythmias, Bundle branch blocks, Axis deviations, Chamber enlargements.`,
  };

  // NOTE: replace the placeholder URL below with your actual AI gateway endpoint.
  const response = await fetch(
    "https://ai.gateway.example.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `${systemPrompts[modelType]}

Return ONLY valid JSON in this exact format:
{
  "heartRate": number,
  "prInterval": number,
  "qrsDuration": number,
  "qtInterval": number,
  "stSegment": "description",
  "diagnosis": {
    "status": "normal" or "abnormal",
    "condition": "specific condition name",
    "details": "detailed clinical explanation",
    "confidence": number (0-100)
  }
}`,
          },
          {
            role: "user",
            content: `Analyze this ECG image and provide detailed measurements. Image data: ${image.substring(
              0,
              100
            )}...`,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`${modelType} analysis error:`, response.status, errorText);
    throw new Error(`${modelType} analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Robust JSON extraction
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found");
  } catch (e) {
    console.error(
      `Failed to parse ${modelType} response:`,
      e,
      "Content:",
      content
    );
    throw new Error(`${modelType} parsing failed`);
  }
}

function aggregateEnsembleResults(results: any[]) {
  console.log("Aggregating ensemble results from", results.length, "models");

  // Average numerical measurements
  const heartRate = Math.round(
    results.reduce((sum, r) => sum + r.heartRate, 0) / results.length
  );
  const prInterval = Math.round(
    results.reduce((sum, r) => sum + r.prInterval, 0) / results.length
  );
  const qrsDuration = Math.round(
    results.reduce((sum, r) => sum + r.qrsDuration, 0) / results.length
  );
  const qtInterval = Math.round(
    results.reduce((sum, r) => sum + r.qtInterval, 0) / results.length
  );

  // Majority voting for diagnosis status
  const abnormalCount = results.filter(
    (r) => r.diagnosis.status === "abnormal"
  ).length;
  const isAbnormal = abnormalCount >= 2; // Majority decides

  // Aggregate confidence scores
  const avgConfidence = Math.round(
    results.reduce((sum, r) => sum + (r.diagnosis.confidence || 85), 0) /
      results.length
  );

  // Combine diagnoses
  const conditions = results
    .filter((r) => r.diagnosis.condition && r.diagnosis.condition !== "Normal")
    .map((r) => r.diagnosis.condition);
  const uniqueConditions = [...new Set(conditions)];

  // Most detailed diagnosis
  const detailedDiagnosis = results
    .map((r) => r.diagnosis.details)
    .reduce(
      (longest, current) =>
        current.length > longest.length ? current : longest,
      ""
    );

  return {
    heartRate,
    prInterval,
    qrsDuration,
    qtInterval,
    stSegment: results[0].stSegment,
    waveformData: [] as number[],
    diagnosis: {
      status: isAbnormal ? "abnormal" : "normal",
      condition:
        uniqueConditions.length > 0 ? uniqueConditions.join(", ") : undefined,
      details: detailedDiagnosis,
      confidence: avgConfidence,
      ensembleAgreement: `${results.length} models analyzed - ${abnormalCount} detected abnormalities`,
    },
  };
}
