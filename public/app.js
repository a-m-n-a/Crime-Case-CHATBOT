document.getElementById('caseForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const caseDetails = document.getElementById('caseDetails').value;
    const response = await fetch('http://localhost:3000/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDetails })
    });
    const data = await response.json();
    document.getElementById('output').innerHTML = `<h2>Summary:</h2><p>${data.summary}</p><h2>Applicable Sections:</h2><p>${data.sections}</p>`;
});