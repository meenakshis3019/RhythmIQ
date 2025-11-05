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
    const { messages, analysis } = await req.json();
    // Environment variable for the AI gateway API key
    const AI_GATEWAY_API_KEY = Deno.env.get("AI_GATEWAY_API_KEY");

    if (!AI_GATEWAY_API_KEY) {
      throw new Error("AI_GATEWAY_API_KEY is not configured");
    }

    // Build context about the ECG analysis
    const contextMessage = `The patient's ECG analysis shows:
- Heart Rate: ${analysis.heartRate} BPM
- PR Interval: ${analysis.prInterval} ms
- QRS Duration: ${analysis.qrsDuration} ms
- QT Interval: ${analysis.qtInterval} ms
- ST Segment: ${analysis.stSegment}
- Diagnosis: ${analysis.diagnosis.status.toUpperCase()}
${
  analysis.diagnosis.condition
    ? `- Condition: ${analysis.diagnosis.condition}`
    : ""
}
- Details: ${analysis.diagnosis.details}

You are a helpful AI medical assistant. Explain these ECG results in simple, clear language. 
Provide context about what the measurements mean and whether they indicate normal or abnormal heart function.
Always recommend consulting a healthcare professional for serious concerns.
Be reassuring but honest. Keep responses concise and easy to understand.`;

    // NOTE: replace the placeholder URL below with your actual AI gateway endpoint.
    const aiResponse = await fetch(
      "https://ai.gateway.example.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_GATEWAY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: contextMessage,
            },
            ...messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a few moments.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI service credits exhausted. Please contact support.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ecg-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Chat failed";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
