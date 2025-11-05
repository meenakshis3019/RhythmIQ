interface ECGWaveformProps {
  data: number[];
}

const ECGWaveform = ({ data }: ECGWaveformProps) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  // Create SVG path from data points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const normalizedValue = ((value - minValue) / range) * 80 + 10;
    const y = 100 - normalizedValue;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  return (
    <div className="w-full h-full bg-card rounded-lg p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        ECG Waveform Visualization
      </h3>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* ECG waveform */}
        <path
          d={pathData}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

export default ECGWaveform;
