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
    fetch('/registrations')
      .then(res => res.json())
      .then(registrations => {
        registrations.forEach((reg, idx) => {
          const row = document.createElement('tr');
          // Apply status colors if approved/rejected
          let statusClass = '';
          if (reg.status === 'approved') {
            statusClass = 'status-approved';
          } else if (reg.status === 'rejected') {
            statusClass = 'status-rejected';
          }
          
          row.className = statusClass;
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
    fetch('/registrations')
      .then(res => res.json())
      .then(registrations => {
        const reg = registrations[idx];
        const modal = document.getElementById('detailsModal');
        const details = document.getElementById('modalDetails');
        
        // Calculate membership cycle info
        const membershipCycle = calculateMembershipCycle(reg.enrolledDate, reg.memberType);
        
        // Build file upload info
        const fileInfo = reg.paymentProof ? 
          `<p><strong>Payment Proof:</strong> <a href="${reg.paymentProof.filePath}" target="_blank" style="color: var(--primary-color); text-decoration: underline;">${reg.paymentProof.name}</a> (${reg.paymentProof.type}, ${(reg.paymentProof.size / 1024).toFixed(2)} KB) - Uploaded: ${new Date(reg.paymentProof.uploadedDate).toLocaleDateString()}</p>` :
          `<p><strong>Payment Proof:</strong> No file uploaded</p>`;
        
        // Build photo info
        const photoInfo = reg.photo ? 
          `<p><strong>Photo:</strong> <img src="${reg.photo}" alt="Profile Photo" style="max-width: 100px; max-height: 100px; display: block; margin: 10px 0;"></p>` :
          `<p><strong>Photo:</strong> No photo uploaded</p>`;
        
        details.innerHTML = `
            <h2>Registration Details</h2>
            <p><strong>Name:</strong> ${reg.name}</p>
            <p><strong>Email:</strong> ${reg.email}</p>
            <p><strong>Phone:</strong> ${reg.phone}</p>
            <p><strong>Category:</strong> ${reg.category || 'N/A'}</p>
            <p><strong>Member Type:</strong> ${reg.memberType || 'N/A'}</p>
            <p><strong>Enrolled Date:</strong> ${reg.enrolledDate || 'N/A'}</p>
            <p><strong>Membership Fee:</strong> $${reg.membershipFee || '0'}</p>
            <p><strong>Personal Email:</strong> ${reg.personalEmail || 'N/A'}</p>
            <p><strong>Registration Date:</strong> ${reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Membership Cycle:</strong> ${membershipCycle}</p>
            ${photoInfo}
            ${fileInfo}
            <p><strong>Current Status:</strong> ${reg.status || 'Pending'}</p>
            
            <div class="action-buttons" style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="approve-btn" onclick="updateStatus(${idx}, 'approved')" 
                        ${reg.status === 'approved' ? 'disabled' : ''}>
                    ${reg.status === 'approved' ? 'Approved ✓' : 'Approve'}
                </button>
                <button class="reject-btn" onclick="updateStatus(${idx}, 'rejected')" 
                        ${reg.status === 'rejected' ? 'disabled' : ''}>
                    ${reg.status === 'rejected' ? 'Rejected ✗' : 'Reject'}
                </button>
            </div>
        `;
        modal.style.display = 'flex';
      });
}

// Calculate membership cycle based on enrolled date and member type
function calculateMembershipCycle(enrolledDate, memberType) {
    if (!enrolledDate || memberType === 'passive') {
        return 'N/A (Passive membership has no cycle)';
    }
    
    const enrolled = new Date(enrolledDate);
    const currentYear = new Date().getFullYear();
    const enrolledYear = enrolled.getFullYear();
    const enrolledMonth = enrolled.getMonth();
    
    // Determine academic year cycle
    let cycleStart, cycleEnd;
    if (enrolledMonth >= 7) { // Fall semester (August - July cycle)
        cycleStart = new Date(enrolledYear, 7, 1); // August 1st
        cycleEnd = new Date(enrolledYear + 1, 6, 31); // July 31st next year
    } else { // Spring semester
        cycleStart = new Date(enrolledYear - 1, 7, 1); // August 1st previous year
        cycleEnd = new Date(enrolledYear, 6, 31); // July 31st current year
    }
    
    return `${cycleStart.getFullYear()}-${cycleEnd.getFullYear()} Academic Year (Expires: ${cycleEnd.toLocaleDateString()})`;
}

// Update registration status (approve/reject)
function updateStatus(idx, status) {
    fetch('/registrations')
      .then(res => res.json())
      .then(registrations => {
        registrations[idx].status = status;
        
        // Send updated data back to server
        fetch('/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ index: idx, status: status })
        })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            // Refresh the table and modal
            loadRegistrations();
            showDetails(idx); // Refresh modal content
          } else {
            alert('Failed to update status');
          }
        })
        .catch(err => {
          console.error('Error updating status:', err);
          alert('Error updating status');
        });
      });
}

// Close modal
function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}
