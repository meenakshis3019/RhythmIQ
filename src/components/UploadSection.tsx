import { useCallback, useState } from "react";
import { Upload, FileImage, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ECGAnalysis } from "@/pages/Index";

interface UploadSectionProps {
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  setAnalysis: (analysis: ECGAnalysis | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const UploadSection = ({
  uploadedImage,
  setUploadedImage,
  setAnalysis,
  isAnalyzing,
  setIsAnalyzing,
}: UploadSectionProps) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, or PDF)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const analyzeECG = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-ecg", {
        body: { image: uploadedImage },
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Your ECG has been successfully analyzed",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze ECG. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-card to-secondary/20">
      <div className="space-y-6">
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {uploadedImage ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <img
                  src={uploadedImage}
                  alt="Uploaded ECG"
                  className="max-h-64 rounded-lg shadow-lg"
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-success">
                <FileImage className="w-5 h-5" />
                <span className="font-medium">ECG Image Uploaded</span>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drop your ECG image here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse (JPG, PNG, PDF)
                </p>
              </div>
            </div>
          )}
        </div>

        {uploadedImage && (
          <div className="flex gap-3 justify-center">
            <Button
              onClick={analyzeECG}
              disabled={isAnalyzing}
              size="lg"
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze ECG"
              )}
            </Button>
            <Button
              onClick={() => {
                setUploadedImage(null);
                setAnalysis(null);
              }}
              variant="outline"
              size="lg"
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UploadSection;
