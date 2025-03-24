// Function to create the DNA uniqueness pie chart
export function createDnaPieChart(personData, d3) {
    console.log("Creating D3 DNA pie chart with data:", personData.dna_uniqueness);
    
    // Clear any existing content
    document.getElementById("dna-pie-chart").innerHTML = "";
    document.getElementById("dna-pie-legend").innerHTML = "";
  
    const width = 320;  
    const height = 320; 
    const radius = Math.min(width, height) / 2.2;
    
    // Parse DNA uniqueness data
    const dnaData = [
      { category: "Common", value: personData.dna_uniqueness.common },
      { category: "Unusual", value: personData.dna_uniqueness.unusual },
      { category: "Rare", value: personData.dna_uniqueness.rare }
    ];
    
    // Enhanced color scale for the pie chart
    const colorScale = d3.scaleOrdinal()
      .domain(["Common", "Unusual", "Rare"])
      .range(["#66c2a5", "#fc8d62", "#8da0cb"]);
    
    // Create SVG container
    const svg = d3.select("#dna-pie-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Create pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null); // Don't sort, maintain input order
    
    // Create arc generator with slight padding between slices
    const arc = d3.arc()
      .innerRadius(0) // Full pie chart
      .outerRadius(radius - 10)
      .padAngle(0.01);
    
    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "pie-tooltip")
      .style("opacity", 0);
    
    // Create arcs for pie slices
    const arcs = svg.selectAll(".arc")
      .data(pie(dnaData))
      .enter()
      .append("g")
      .attr("class", "arc");
    
    // Draw pie slices with animation
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => colorScale(d.data.category))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("filter", "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))")
      .on("mouseover", function(event, d) {
        // Highlight on hover
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", `scale(1.05)`);
        
        // Show tooltip on hover
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        
        const percent = (d.data.value * 100).toFixed(1);
        tooltip.html(`<strong>${d.data.category}:</strong> ${percent}%`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        // Remove highlight
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", `scale(1)`);
        
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
    
    // Add percentage labels to the pie slices
    arcs.append("text")
      .attr("transform", d => {
        // Position labels in the middle of each arc
        const centroid = arc.centroid(d);
        return `translate(${centroid})`;
      })
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "white")
      .style("font-size", "15px")
      .style("font-weight", "bold")
      .text(d => {
        // Only show percentage if slice is large enough
        return d.data.value >= 0.05 ? `${(d.data.value * 100).toFixed(0)}%` : "";
      });
    
    // Create legend items
    const legend = d3.select("#dna-pie-legend");
    
    dnaData.forEach(data => {
      const legendItem = legend.append("div")
        .attr("class", "pie-legend-item");
      
      legendItem.append("div")
        .attr("class", "pie-legend-color")
        .style("background-color", colorScale(data.category));
      
      legendItem.append("div")
        .style("font-size", "16px")
        .html(`<strong>${data.category}:</strong> ${(data.value * 100).toFixed(1)}%`);
    });
    
    console.log("D3 DNA pie chart created successfully");
  }
  
  // Function to create the risk matrix
  export function createRiskMatrix(personData, generalData, d3) {
    // Clear existing content
    const riskContainer = document.getElementById('risk-matrix-container');
    riskContainer.innerHTML = '';
    
    // Risk matrix configuration
    const config = {
      width: 600,
      height: 500,
      margin: { top: 80, right: 50, bottom: 100, left: 140 },
      cellSize: 60,
      levels: 5, // 5x5 risk matrix
      colorRange: ["#4CAF50", "#FFC107", "#F44336"] // green to yellow to red (enhanced colors)
    };
  
    // Calculate actual dimensions
    const width = config.width;
    const height = config.height;
    
    // Create SVG container
    const svg = d3.select("#risk-matrix-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "risk-matrix");
  
    // Risk levels and descriptions
    const impactLevels = [
      { level: 1, label: "Minimal", description: "Minimal impact on health" },
      { level: 2, label: "Minor", description: "Minor impact, manageable" },
      { level: 3, label: "Moderate", description: "Moderate impact, requires attention" },
      { level: 4, label: "Major", description: "Major impact, significant concern" },
      { level: 5, label: "Severe", description: "Severe impact, critical concern" }
    ];
  
    const likelihoodLevels = [
      { level: 1, label: "Rare", description: "Very unlikely to occur" },
      { level: 2, label: "Unlikely", description: "Could occur but not expected" },
      { level: 3, label: "Possible", description: "Might occur at some point" },
      { level: 4, label: "Likely", description: "Will probably occur" },
      { level: 5, label: "Very Likely", description: "Expected to occur" }
    ];
  
    // Create color scale
    const colorScale = d3.scaleLinear()
      .domain([1, 3, 5]) 
      .range(config.colorRange)
      .interpolate(d3.interpolateRgb);
  
    // Calculate risk score (1-25)
    const calculateRiskScore = (impact, likelihood) => impact * likelihood;
  
    // Convert a probability (0-1) to a risk level (1-5)
    const probabilityToLevel = probability => {
      if (probability < 0.2) return 1;
      if (probability < 0.4) return 2;
      if (probability < 0.6) return 3;
      if (probability < 0.8) return 4;
      return 5;
    };
  
    // Extract Alzheimer's risk values from the data 
    const personAlzheimerRisk = personData.health_risks.alzheimer_risk;
    const averageAlzheimerRisk = generalData.genetic_risk_averages.alzheimer_risk;
  
    // Convert Alzheimer risk to impact and likelihood
    const personImpact = probabilityToLevel(personAlzheimerRisk);
    const personLikelihood = probabilityToLevel(personAlzheimerRisk);
    
    const averageImpact = probabilityToLevel(averageAlzheimerRisk);
    const averageLikelihood = probabilityToLevel(averageAlzheimerRisk);
  
    // Calculate cell size based on available space
    const cellSize = Math.min(
      (width - config.margin.left - config.margin.right) / config.levels,
      (height - config.margin.top - config.margin.bottom) / config.levels
    );
  
    // Add title
    svg.append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Alzheimer's Risk Matrix");
  
    // Add subtitle with person name
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .text(`${personData.name} vs. Population Average`);
  
    // Create cells
    const cells = [];
    for (let impact = 1; impact <= config.levels; impact++) {
      for (let likelihood = 1; likelihood <= config.levels; likelihood++) {
        cells.push({
          impact,
          likelihood,
          score: calculateRiskScore(impact, likelihood)
        });
      }
    }
  
    // Draw cells with smooth corners
    const g = svg.append("g")
      .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
  
    g.selectAll(".risk-cell")
      .data(cells)
      .enter()
      .append("rect")
      .attr("class", "risk-cell")
      .attr("x", d => (d.likelihood - 1) * cellSize)
      .attr("y", d => (config.levels - d.impact) * cellSize)
      .attr("width", cellSize - 2) // Create a small gap between cells
      .attr("height", cellSize - 2)
      .attr("rx", 3) // Rounded corners
      .attr("ry", 3)
      .attr("fill", d => colorScale(Math.sqrt(d.score)))
      .style("opacity", 0.9) // Slightly transparent
      .append("title")
      .text(d => `Impact: ${impactLevels[d.impact-1].label}, Likelihood: ${likelihoodLevels[d.likelihood-1].label}\nRisk Score: ${d.score}`);
  
    // Add person marker
    g.append("circle")
      .attr("class", "person-marker")
      .attr("cx", (personLikelihood - 0.5) * cellSize)
      .attr("cy", (config.levels - personImpact + 0.5) * cellSize)
      .attr("r", 12)
      .attr("fill", "rgba(0, 102, 204, 0.8)")
      .append("title")
      .text(`${personData.name}: Impact ${personImpact}, Likelihood ${personLikelihood}\nRisk Value: ${personAlzheimerRisk.toFixed(2)}`);
  
    // Add population average marker
    g.append("circle")
      .attr("class", "average-marker")
      .attr("cx", (averageLikelihood - 0.5) * cellSize)
      .attr("cy", (config.levels - averageImpact + 0.5) * cellSize)
      .attr("r", 12)
      .attr("fill", "rgba(128, 128, 128, 0.8)")
      .append("title")
      .text(`Population Average: Impact ${averageImpact}, Likelihood ${averageLikelihood}\nRisk Value: ${averageAlzheimerRisk.toFixed(2)}`);
  
    // Add HTML-based marker legends under the graph to the left
    const markersLegendDiv = document.createElement("div");
    markersLegendDiv.className = "markers-legend";
    markersLegendDiv.innerHTML = `
      <div class="legend-item">
        <div class="legend-circle" style="background-color: rgba(0, 102, 204, 0.8);"></div>
        <span><strong>${personData.name}</strong></span>
      </div>
      <div class="legend-item">
        <div class="legend-circle" style="background-color: rgba(128, 128, 128, 0.8);"></div>
        <span><strong>Population Average</strong></span>
      </div>
    `;
    document.getElementById("risk-matrix-container").appendChild(markersLegendDiv);
  
    // Draw x-axis (Likelihood)
    const xAxis = g.append("g")
    .attr("transform", `translate(0, ${config.levels * cellSize + 5})`);

  xAxis.selectAll("text")
    .data(likelihoodLevels)
    .enter()
    .append("text")
    .attr("x", (d, i) => (i + 0.5) * cellSize)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .text(d => d.label);

  // X-axis label
  g.append("text")
    .attr("class", "axis-label")
    .attr("x", (config.levels * cellSize) / 2)
    .attr("y", config.levels * cellSize + 50)
    .attr("text-anchor", "middle")
    .text("Likelihood");

  // Draw y-axis (Impact)
  const yAxis = g.append("g")
    .attr("transform", `translate(-30, 0)`);

  yAxis.selectAll("text")
    .data(impactLevels.slice().reverse())
    .enter()
    .append("text")
    .attr("x", -10)
    .attr("y", (d, i) => (i + 0.5) * cellSize)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .text(d => d.label);

  // Y-axis label
  g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -(config.levels * cellSize) / 2)
    .attr("y", -105)
    .attr("text-anchor", "middle")
    .text("Impact");

  // Add risk level legend
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "risk-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  linearGradient.selectAll("stop")
    .data([
      {offset: "0%", color: config.colorRange[0]},
      {offset: "50%", color: config.colorRange[1]},
      {offset: "100%", color: config.colorRange[2]}
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);
}