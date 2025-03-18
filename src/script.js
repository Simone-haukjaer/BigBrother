fetch("data/persondata.json")
  .then(response => response.json())
  .then(data => {
    document.getElementById("data-display").textContent = JSON.stringify(data, null, 2);
    // In here we can setup the data to be visualized with Chart.js or D3.js
  })
  .catch(error => console.error("Error loading data:", error));
