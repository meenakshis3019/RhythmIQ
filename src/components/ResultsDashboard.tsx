import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Timer,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import ECGWaveform from "./ECGWaveform";
import type { ECGAnalysis } from "@/pages/Index";

interface ResultsDashboardProps {
  analysis: ECGAnalysis;
}

const ResultsDashboard = ({ analysis }: ResultsDashboardProps) => {

  const metrics = [
    {
      icon: Activity,
      label: "Heart Rate",
      value: `${analysis.heartRate} BPM`,
      color: "text-primary",
    },
    {
      icon: Timer,
      label: "PR Interval",
      value: `${analysis.prInterval} ms`,
      color: "text-accent",
    },
    {
      icon: Zap,
      label: "QRS Duration",
      value: `${analysis.qrsDuration} ms`,
      color: "text-warning",
    },
    {
      icon: TrendingUp,
      label: "QT Interval",
      value: `${analysis.qtInterval} ms`,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-2xl font-bold text-foreground">Analysis Results</h3>

      {/* Waveform Chart */}
      <Card className="shadow-lg">
        <div className="h-64">
          <ECGWaveform data={analysis.waveformData} />
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`${metric.color} mt-1`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {metric.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ST Segment */}
      <Card className="p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <TrendingUp className="w-6 h-6 text-primary mt-1" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              ST Segment
            </h4>
            <p className="text-muted-foreground">{analysis.stSegment}</p>
          </div>
        </div>
      </Card>

      {/* AI Diagnosis */}
      <Card
        className={`p-6 shadow-lg ${
          analysis.diagnosis.status === "normal"
            ? "bg-success/5 border-success/20"
            : "bg-warning/5 border-warning/20"
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {analysis.diagnosis.status === "normal" ? (
                <CheckCircle className="w-8 h-8 text-success" />
              ) : (
                <AlertCircle className="w-8 h-8 text-warning" />
              )}
              <div>
                <h4 className="text-xl font-bold text-foreground">
                  AI Ensemble Diagnosis
                </h4>
                <Badge
                  variant={
                    analysis.diagnosis.status === "normal"
                      ? "default"
                      : "destructive"
                  }
                  className="mt-1"
                >
                  {analysis.diagnosis.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            {analysis.diagnosis.confidence && (
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {analysis.diagnosis.confidence}%
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            )}
          </div>

          {analysis.diagnosis.condition && (
            <div className="pl-11">
              <p className="font-semibold text-foreground text-lg">
                {analysis.diagnosis.condition}
              </p>
            </div>
          )}

          <div className="pl-11">
            <p className="text-muted-foreground">
              {analysis.diagnosis.details}
            </p>
          </div>

          {analysis.diagnosis.ensembleAgreement && (
            <div className="pl-11 pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                🤖 {analysis.diagnosis.ensembleAgreement}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
