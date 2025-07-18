document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const dashboardLayout = document.querySelector('.dashboard-layout');

    menuToggle.addEventListener('click', () => {
        dashboardLayout.classList.toggle('sidebar-open');
    });

    loadRegistrations();
    document.getElementById('registrationTableBody').addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' && e.target.classList.contains('action-btn')) {
            showDetails(e.target.getAttribute('data-idx'));
        }
    });
    document.querySelector('.close').addEventListener('click', closeModal);
    window.onclick = function(event) {
        const modal = document.getElementById('detailsModal');
        if (event.target == modal) {
            closeModal();
        }
    };
});

// Load registration data from localStorage and display in table
function loadRegistrations() {
    const tableBody = document.getElementById('registrationTableBody');
    tableBody.innerHTML = '';
    fetch('http://localhost:3000/registrations')
      .then(res => res.json())
      .then(registrations => {
        registrations.forEach((reg, idx) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${reg.name}</td>
            <td>${reg.email}</td>
            <td>${reg.phone}</td>
            <td><button class="action-btn" data-idx="${idx}">View</button></td>
          `;
          tableBody.appendChild(row);
        });
      });
}

// Show modal with registration details
function showDetails(idx) {
    fetch('http://localhost:3000/registrations')
      .then(res => res.json())
      .then(registrations => {
        const reg = registrations[idx];
        const modal = document.getElementById('detailsModal');
        const details = document.getElementById('modalDetails');
        details.innerHTML = `
            <h2>Details</h2>
            <p><strong>Name:</strong> ${reg.name}</p>
            <p><strong>Email:</strong> ${reg.email}</p>
            <p><strong>Phone:</strong> ${reg.phone}</p>
            <p><strong>Address:</strong> ${reg.address || 'N/A'}</p>
            <p><strong>Other Info:</strong> ${reg.other || 'N/A'}</p>
        `;
        modal.style.display = 'flex';
      });
}

// Close modal
function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}
