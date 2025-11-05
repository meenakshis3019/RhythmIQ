import { useState } from "react";
import { Activity } from "lucide-react";
import Header from "@/components/Header";
import UploadSection from "@/components/UploadSection";
import ResultsDashboard from "@/components/ResultsDashboard";
import ChatbotSection from "@/components/ChatbotSection";
import Footer from "@/components/Footer";

export interface ECGAnalysis {
  heartRate: number;
  prInterval: number;
  qrsDuration: number;
  qtInterval: number;
  stSegment: string;
  diagnosis: {
    status: "normal" | "abnormal";
    condition?: string;
    details: string;
    confidence?: number;
    ensembleAgreement?: string;
  };
  waveformData: number[];
}

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ECGAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 pulse-glow">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Welcome to RhythmIQ Analysis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant, accurate ECG analysis powered by advanced AI
            technology. Simply upload your ECG strip and receive detailed
            insights in seconds.
          </p>
        </div>

        <UploadSection
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
          setAnalysis={setAnalysis}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
        />

        {analysis && (
          <div className="space-y-8 animate-fade-in">
            <ResultsDashboard analysis={analysis} />
            <ChatbotSection analysis={analysis} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
