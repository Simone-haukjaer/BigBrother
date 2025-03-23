// Load both JSON files in parallel
Promise.all([
  fetch("data/persondata.json").then(res => res.json()),
  fetch("data/generaldata.json").then(res => res.json())
])
.then(([person, general]) => {
  const personSection = document.getElementById("person-data");
  const generalSection = document.getElementById("general-data");

  personSection.innerHTML = `
    <h2>👤 Person Profile</h2>
    <pre>${JSON.stringify(person, null, 2)}</pre>
  `;

  generalSection.innerHTML = `
    <h2>🌍 General Health Data</h2>
    <pre>${JSON.stringify(general, null, 2)}</pre>
  `;
})
.catch(err => {
  document.getElementById("data-display").textContent = "Failed to load data.";
  console.error("Error loading data:", err);
});

