// Load data and initialize charts
export function createDnaPieChart(personData) {
  // Clear the existing content first
  document.getElementById('dna-pie-chart').innerHTML = '';
  
  // Create DNA Uniqueness Pie Chart
  const dnaCanvas = document.createElement('canvas');
  dnaCanvas.id = 'dnaChart';
  dnaCanvas.style.width = '100%';
  dnaCanvas.style.height = '100%';
  document.getElementById('dna-pie-chart').appendChild(dnaCanvas);
  
  const dnaCtx = dnaCanvas.getContext('2d');
  const dnaChart = new Chart(dnaCtx, {
    type: 'pie',
    data: {
      labels: ['Common', 'Unusual', 'Rare'],
      datasets: [{
        data: [
          personData.dna_uniqueness.common * 100, 
          personData.dna_uniqueness.unusual * 100, 
          personData.dna_uniqueness.rare * 100
        ],
        backgroundColor: [
          '#4ECCA3',  // green for common
          '#FF9A76',  // orange for unusual
          '#A2D5F2'   // blue for rare
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed.toFixed(1) + '%';
            }
          }
        }
      }
    }
  });
  
  // Create legend elements manually
  // Clear the legend container first
  const legendContainer = document.getElementById('dna-pie-legend');
  legendContainer.innerHTML = '';
  
  const legendColors = ['#4ECCA3', '#FF9A76', '#A2D5F2'];
  const legendLabels = ['Common', 'Unusual', 'Rare'];
  const legendValues = [
    personData.dna_uniqueness.common * 100,
    personData.dna_uniqueness.unusual * 100,
    personData.dna_uniqueness.rare * 100
  ];
  
  legendLabels.forEach((label, index) => {
    const legendItem = document.createElement('div');
    legendItem.className = 'pie-legend-item';
    
    const colorBox = document.createElement('div');
    colorBox.className = 'pie-legend-color';
    colorBox.style.backgroundColor = legendColors[index];
    
    const textSpan = document.createElement('span');
    textSpan.textContent = `${label}: ${legendValues[index].toFixed(1)}%`;
    
    legendItem.appendChild(colorBox);
    legendItem.appendChild(textSpan);
    legendContainer.appendChild(legendItem);
  });
}

export function createRiskMatrix(personData, generalData) {
  // Clear existing content
  const riskContainer = document.getElementById('risk-matrix-container');
  riskContainer.innerHTML = '';
  
  // Create a container for the chart with fixed dimensions
  const chartContainer = document.createElement('div');
  chartContainer.style.height = '400px';
  chartContainer.style.width = '100%';
  chartContainer.style.position = 'relative';
  riskContainer.appendChild(chartContainer);
  
  // Create a canvas element for the risk matrix chart
  const matrixCanvas = document.createElement('canvas');
  matrixCanvas.id = 'matrixChart';
  matrixCanvas.style.height = '100%';
  matrixCanvas.style.width = '100%';
  chartContainer.appendChild(matrixCanvas);
  
  const matrixCtx = matrixCanvas.getContext('2d');

  // Function to generate heat map data
  function generateHeatmapData() {
    const impactLabels = ['Minimal', 'Minor', 'Moderate', 'Major', 'Severe'];
    const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely/Almost Certain'];
    
    // Create empty data array (5x4)
    const data = [];
    
    // Generate gradient data
    for (let i = 0; i < impactLabels.length; i++) {
      for (let j = 0; j < likelihoodLabels.length; j++) {
        // Calculate risk level (0-1)
        const riskLevel = (j / (likelihoodLabels.length - 1) + i / (impactLabels.length - 1)) / 2;
        data.push({
          x: j,
          y: 4 - i,  // Y-axis is reversed in the matrix
          v: riskLevel
        });
      }
    }
    
    return {
      impactLabels,
      likelihoodLabels,
      data
    };
  }

  const heatmapData = generateHeatmapData();

  // Calculate positions based on risk values - simplified for demo
  const personRisk = personData.health_risks.alzheimer_risk || 0.5;
  const populationRisk = generalData.genetic_risk_averages.alzheimer_risk || 0.25;
  
  // Position calculation (convert risk values to x,y coordinates)
  // Higher risk = higher likelihood and impact
  const personLikelihood = 1.2 + personRisk * 2; // Range from ~1.2 to ~3.2
  const personImpact = 1 + personRisk * 3; // Range from ~1 to ~4
  
  const popLikelihood = 1 + populationRisk * 2; // Range from ~1 to ~3
  const popImpact = 0.8 + populationRisk * 3; // Range from ~0.8 to ~3.8

  // Create bubble data for John and population points
  const bubbleData = [
    {
      x: personLikelihood,  // Position for Person based on risk
      y: personImpact,      // Position for Person based on risk
      r: 8,                 // Radius
      label: personData.name || 'Individual',
      color: '#2980b9'      // Blue
    },
    {
      x: popLikelihood,     // Position for Population
      y: popImpact,         // Position for Population
      r: 6,                 // Radius
      label: 'Population Average',
      color: '#7f8c8d'      // Gray
    }
  ];

  // Create risk matrix chart
  const matrixChart = new Chart(matrixCtx, {
    type: 'scatter',
    data: {
      datasets: [
        // Heatmap background
        {
          type: 'bubble',
          label: 'Risk Levels',
          data: heatmapData.data.map(point => ({
            x: point.x,
            y: point.y,
            r: 15
          })),
          backgroundColor: heatmapData.data.map(point => {
            // Color gradient from green to yellow to red
            if (point.v < 0.3) {
              return `rgba(46, 204, 113, ${0.6 + point.v})`;  // Green
            } else if (point.v < 0.7) {
              return `rgba(241, 196, 15, ${0.6 + point.v * 0.4})`;  // Yellow
            } else {
              return `rgba(231, 76, 60, ${0.6 + point.v * 0.4})`;  // Red
            }
          }),
          borderColor: 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          hoverRadius: 0,
          hoverBackgroundColor: 'transparent',
          pointStyle: 'rect'
        },
        // Person point
        {
          type: 'bubble',
          label: bubbleData[0].label,
          data: [{
            x: bubbleData[0].x,
            y: bubbleData[0].y,
            r: bubbleData[0].r
          }],
          backgroundColor: bubbleData[0].color,
          borderColor: 'white',
          borderWidth: 2
        },
        // Population Average point
        {
          type: 'bubble',
          label: bubbleData[1].label,
          data: [{
            x: bubbleData[1].x,
            y: bubbleData[1].y,
            r: bubbleData[1].r
          }],
          backgroundColor: bubbleData[1].color,
          borderColor: 'white',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          min: -0.5,
          max: 3.5,
          ticks: {
            callback: function(value) {
              if (Number.isInteger(value) && value >= 0 && value < heatmapData.likelihoodLabels.length) {
                return heatmapData.likelihoodLabels[value];
              }
              return '';
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          title: {
            display: true,
            text: 'Likelihood'
          }
        },
        y: {
          min: -0.5,
          max: 4.5,
          ticks: {
            callback: function(value) {
              if (Number.isInteger(value) && value >= 0 && value < heatmapData.impactLabels.length) {
                return heatmapData.impactLabels[4 - value];
              }
              return '';
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          title: {
            display: true,
            text: 'Impact'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const datasetLabel = context.dataset.label || '';
              if (datasetLabel === 'Risk Levels') {
                const xIndex = Math.round(context.parsed.x);
                const yIndex = Math.round(context.parsed.y);
                if (xIndex >= 0 && xIndex < heatmapData.likelihoodLabels.length && 
                    yIndex >= 0 && yIndex < heatmapData.impactLabels.length) {
                  const impact = heatmapData.impactLabels[4 - yIndex];
                  const likelihood = heatmapData.likelihoodLabels[xIndex];
                  return `${impact} impact, ${likelihood} likelihood`;
                }
                return '';
              }
              return datasetLabel;
            }
          }
        }
      }
    }
  });
  
  // Create legend for the risk matrix
  const markersLegend = document.createElement('div');
  markersLegend.className = 'markers-legend';
  
  // Add legend items
  const legendItems = [
    { color: '#2980b9', label: personData.name || 'Individual' },
    { color: '#7f8c8d', label: 'Population Average' }
  ];
  
  legendItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    
    const circle = document.createElement('div');
    circle.className = 'legend-circle';
    circle.style.backgroundColor = item.color;
    
    const label = document.createElement('span');
    label.textContent = item.label;
    
    legendItem.appendChild(circle);
    legendItem.appendChild(label);
    markersLegend.appendChild(legendItem);
  });
  
  chartContainer.appendChild(markersLegend);
}