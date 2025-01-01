import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Chart as ChartJS, registerables } from 'chart.js';
import './TrafficChart.css';

ChartJS.register(...registerables);

const TrafficChart = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light'); // For Dark Mode
  const [confidenceFilter, setConfidenceFilter] = useState(0); // Filter Confidence
  const [summary, setSummary] = useState({}); // Summary Stats

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/logs/detection_log.csv');
        const csvData = await response.text();

        const parsedData = parseCSV(csvData);

        if (!parsedData || parsedData.length === 0) {
          throw new Error('Parsed data is empty or invalid');
        }

        const filteredData = parsedData.filter(
          (item) => item.confidence >= confidenceFilter
        );

        setChartData(formatChartData(filteredData));
        setSummary(calculateSummary(filteredData));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching or parsing data:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [confidenceFilter]);

  const parseCSV = (csvData) => {
    const lines = csvData.trim().split('\n');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const [timestamp, object, confidence] = lines[i].split(',');
      if (timestamp && object && confidence) {
        result.push({
          timestamp: new Date(timestamp.trim()),
          object: object.trim(),
          confidence: parseFloat(confidence.trim()),
        });
      }
    }
    return result;
  };

  const formatChartData = (data) => {
    const groupedData = {
      Car: [],
      Pedestrian: [],
      Cyclist: [],
    };

    data.forEach(({ timestamp, object, confidence }) => {
      if (groupedData[object]) {
        groupedData[object].push({ x: timestamp, y: confidence });
      }
    });

    return {
      datasets: [
        {
          label: 'Car',
          data: groupedData.Car,
          borderColor: 'green',
          backgroundColor: 'rgba(0, 128, 0, 0.2)',
          pointRadius: 2,
        },
        {
          label: 'Pedestrian',
          data: groupedData.Pedestrian,
          borderColor: 'purple',
          backgroundColor: 'rgba(128, 0, 128, 0.2)',
          pointRadius: 2,
        },
        {
          label: 'Cyclist',
          data: groupedData.Cyclist,
          borderColor: 'red',
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          pointRadius: 2,
        },
      ],
    };
  };

  const calculateSummary = (data) => {
    const objects = ['Car', 'Pedestrian', 'Cyclist'];
    const summary = {};

    objects.forEach((object) => {
      const objectData = data.filter((item) => item.object === object);
      const averageConfidence =
        objectData.reduce((sum, item) => sum + item.confidence, 0) /
        (objectData.length || 1);
      summary[object] = averageConfidence.toFixed(2);
    });

    return summary;
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className={`traffic-chart ${theme}`}>
      <h2>Smart Traffic System Dashboard</h2>
      <button onClick={toggleTheme}>
        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>

      <div className="summary">
        <h3>Summary Statistics</h3>
        {Object.entries(summary).map(([key, value]) => (
          <p key={key}>
            {key}: {value}
          </p>
        ))}
      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={confidenceFilter}
        onChange={(e) => setConfidenceFilter(Number(e.target.value))}
      />
      <span>Confidence Filter: {confidenceFilter}</span>

      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true, position: 'top' },
          },
          scales: {
            x: {
              type: 'time',
              title: { display: true, text: 'Time' },
            },
            y: {
              min: 0,
              max: 1,
              title: { display: true, text: 'Confidence' },
            },
          },
        }}
      />
    </div>
  );
};

export default TrafficChart;
