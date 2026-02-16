document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#dashboard-table tbody');
    const urlInput = document.getElementById('url-input');
    const shortenBtn = document.getElementById('shorten-btn');

    // Function to load all links and populate the table
    function refreshLinks() {
        tableBody.innerHTML = ''; // clear table
        fetch('/api/links')
        .then(res => res.json())
        .then(data => {
            for (const code in data) {
                addRow(data[code], code);
            }
        });
    }

    // Initial load
    refreshLinks();

    // Refresh table every 5 seconds
    setInterval(refreshLinks, 5000);

    // Shorten button click
    shortenBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) return alert('Please enter a URL');

        fetch('/api/links', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ url })
        })
        .then(res => res.json())
        .then(data => {
            refreshLinks(); // update table
            urlInput.value = '';
            alert('Shortened URL: ' + data.short_url);
        })
        .catch(err => alert('Error: ' + err));
    });

    // Add a row to the table
    function addRow(link, code) {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td class="border px-2 py-1">${code}</td>
            <td class="border px-2 py-1"><a href="${link.original_url}" target="_blank">${link.original_url}</a></td>
            <td class="border px-2 py-1">${link.clicks ?? 0}</td>
            <td class="border px-2 py-1">${link.last_clicked ?? '-'}</td>
            <td class="border px-2 py-1">
                <button onclick="copyURL('http://localhost:3000/${code}', this)" class="bg-green-500 text-white p-1">Copy</button>
            </td>
        `;
    }
});

// Copy URL function – increments clicks by 2 for demo
function copyURL(shortUrl, btn) {
    navigator.clipboard.writeText(shortUrl);
    alert('Copied: ' + shortUrl);

    // Increment clicks in table immediately
    const row = btn.closest('tr');
    const clicksCell = row.cells[2];
    clicksCell.textContent = parseInt(clicksCell.textContent) + 2;
}
