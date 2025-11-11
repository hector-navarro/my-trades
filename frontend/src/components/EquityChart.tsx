interface EquityChartProps {
  data: number[];
}

function EquityChart({ data }: EquityChartProps) {
  if (!data.length) {
    return <p>No hay datos de curva de capital.</p>;
  }

  const max = Math.max(...data, 0);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  return (
    <svg viewBox="0 0 100 40" className="equity-chart">
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 40 - ((value - min) / range) * 30 - 5;
        return <circle key={index} cx={x} cy={y} r={1.5} />;
      })}
      <polyline
        points={data
          .map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 40 - ((value - min) / range) * 30 - 5;
            return `${x},${y}`;
          })
          .join(' ')}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1}
      />
    </svg>
  );
}

export default EquityChart;
