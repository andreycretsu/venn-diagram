// Initial company data based on the image
const initialCompanies = [
    // HRIS section (left circle)
    { name: 'Culture Amp', x: 250, y: 220, category: 'hris', portfolio: true },
    { name: 'Lattice', x: 180, y: 300, category: 'hris', portfolio: false },
    { name: 'bob', x: 320, y: 180, category: 'hris', portfolio: false },
    { name: 'Personio', x: 200, y: 400, category: 'hris', portfolio: true },
    { name: 'factorial', x: 280, y: 450, category: 'hris', portfolio: false },
    
    // Payroll & Benefits section (right circle)
    { name: 'Remote', x: 950, y: 180, category: 'payroll', portfolio: true },
    { name: 'Justworks', x: 1000, y: 240, category: 'payroll', portfolio: true },
    { name: 'Gusto', x: 870, y: 260, category: 'payroll', portfolio: false },
    { name: 'Paychex', x: 1040, y: 300, category: 'payroll', portfolio: false },
    { name: 'Swile', x: 1020, y: 200, category: 'payroll', portfolio: true },
    { name: 'ADP', x: 890, y: 400, category: 'payroll', portfolio: false },
    { name: 'Deel', x: 1000, y: 450, category: 'payroll', portfolio: false },
    
    // Expense Management & Finance section (bottom circle)
    { name: 'Spendesk', x: 420, y: 750, category: 'expense', portfolio: true },
    { name: 'Pleo', x: 660, y: 800, category: 'expense', portfolio: false },
    { name: 'Ramp', x: 740, y: 750, category: 'expense', portfolio: false },
    { name: 'Brex', x: 380, y: 820, category: 'expense', portfolio: false },
    { name: 'Mercury', x: 700, y: 850, category: 'expense', portfolio: false },
    { name: 'Revolut', x: 620, y: 720, category: 'expense', portfolio: true },
    { name: 'Expensify', x: 740, y: 800, category: 'expense', portfolio: false },
    
    // Intersection areas (center where all three meet)
    { name: 'Paycom', x: 540, y: 380, category: 'intersection', portfolio: false },
    { name: 'Paylocity', x: 660, y: 410, category: 'intersection', portfolio: false },
    { name: 'Rippling', x: 600, y: 450, category: 'intersection', portfolio: false },
];

let companies = [...initialCompanies];
let draggedElement = null;
let dragOffset = { x: 0, y: 0 };

// Circle configuration - will be dynamically calculated based on screen size
let circleConfig = {
    radius: 250,
    centerDistance: 250,
    centers: {
        hris: { x: 300, y: 250 },
        payroll: { x: 600, y: 250 },
        expense: { x: 450, y: 450 }
    }
};

// Get responsive dimensions - FIT TO SCREEN 100% by default
function getResponsiveDimensions() {
    const container = document.querySelector('.venn-container');
    if (!container) return getDefaultDimensions();
    
    const containerRect = container.getBoundingClientRect();
    const availableWidth = containerRect.width;
    const availableHeight = containerRect.height;
    
    // Use MAXIMUM possible space - fit circles to 100% screen
    const maxRadius = Math.min(
        (availableWidth - 160) / 2.5, // Fit horizontally with minimal margin
        (availableHeight - 100) / 2.2  // Fit vertically with minimal margin
    );
    
    const radius = Math.max(150, maxRadius); // Minimum 150px for readability
    const centerDistance = radius * 1.4; // Closer for better screen fit
    
    // Center everything in available space
    const svgWidth = availableWidth;
    const svgHeight = availableHeight;
    
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    
    // Equilateral triangle positioning - MAXIMIZE screen usage
    const halfDistance = centerDistance / 2;
    const triangleHeight = centerDistance * Math.sin(Math.PI / 3);
    
    return {
        radius: radius,
        centerDistance: centerDistance,
        svgWidth: svgWidth,
        svgHeight: svgHeight,
        centers: {
            hris: { x: centerX - halfDistance, y: centerY - triangleHeight / 3 },
            payroll: { x: centerX + halfDistance, y: centerY - triangleHeight / 3 },
            expense: { x: centerX, y: centerY + (2 * triangleHeight) / 3 }
        }
    };
}

// Fallback dimensions if container not ready
function getDefaultDimensions() {
    return {
        radius: 200,
        centerDistance: 320,
        svgWidth: 800,
        svgHeight: 600,
        centers: {
            hris: { x: 200, y: 200 },
            payroll: { x: 600, y: 200 },
            expense: { x: 400, y: 450 }
        }
    };
}

// Firebase will be initialized from firebase-config.js if available
let db = null;
let isFirebaseEnabled = false;

// Check if Firebase is available and initialized
function initializeFirebase() {
    if (window.firebaseDB && window.isFirebaseEnabled) {
        db = window.firebaseDB;
        isFirebaseEnabled = true;
        updateStatus('Connected', 'saved');
        return true;
    } else {
        updateStatus('Local Mode', 'error');
        return false;
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    initializeLayout();
});

function renderCompanies() {
    const container = document.getElementById('companies-container');
    container.innerHTML = '';
    
    companies.forEach((company, index) => {
        // Ensure company positions are within the new responsive layout
        const adjusted = adjustCompanyPosition(company);
        const logoElement = createCompanyLogo(adjusted, index);
        container.appendChild(logoElement);
    });
}

// Adjust company positions to fit within the responsive layout
function adjustCompanyPosition(company) {
    // Get current responsive dimensions
    const responsive = getResponsiveDimensions();
    
    // Scale positions proportionally if they're outside the new bounds
    let adjustedX = company.x;
    let adjustedY = company.y;
    
    // If positions are way off, relocate them to appropriate areas
    if (company.x > responsive.svgWidth || company.y > responsive.svgHeight) {
        const center = responsive.centers[company.category];
        if (center) {
            // Place near the appropriate circle center with some randomness
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * (responsive.radius * 0.6);
            adjustedX = center.x + Math.cos(angle) * distance;
            adjustedY = center.y + Math.sin(angle) * distance;
        } else {
            // Default to center of SVG
            adjustedX = responsive.svgWidth / 2;
            adjustedY = responsive.svgHeight / 2;
        }
    }
    
    return {
        ...company,
        x: adjustedX,
        y: adjustedY
    };
}

function createCompanyLogo(company, index) {
    const logoDiv = document.createElement('div');
    logoDiv.className = `company-logo ${company.portfolio ? 'portfolio' : ''}`;
    logoDiv.style.left = `${company.x}px`;
    logoDiv.style.top = `${company.y}px`;
    logoDiv.setAttribute('data-index', index);
    logoDiv.setAttribute('data-name', company.name);
    
    // Create company initials for the logo
    const initials = getCompanyInitials(company.name);
    logoDiv.innerHTML = initials;
    
    // Add drag event listeners
    logoDiv.addEventListener('mousedown', startDrag);
    logoDiv.addEventListener('dragstart', e => e.preventDefault());
    
    return logoDiv;
}

function getCompanyInitials(name) {
    // Handle special cases and common company name patterns
    const cleanName = name.replace(/\s+(Inc|LLC|Corp|Ltd)\.?$/i, ''); // Remove corporate suffixes
    
    const words = cleanName.split(/[\s&]+/).filter(word => word.length > 0);
    
    if (words.length === 1) {
        // Single word - take first 2-3 letters
        const word = words[0];
        if (word.length <= 3) return word.toUpperCase();
        return word.substring(0, 2).toUpperCase();
    } else {
        // Multiple words - take first letter of each word, max 3
        return words.slice(0, 3).map(word => word[0].toUpperCase()).join('');
    }
}

function setupEventListeners() {
    // Wait for elements to be ready
    setTimeout(() => {
        // Modal functionality
        const modal = document.getElementById('add-company-modal');
        const addBtn = document.getElementById('add-company-btn');
        const closeBtn = document.querySelector('.close');
        const form = document.getElementById('add-company-form');
        
        if (addBtn) addBtn.addEventListener('click', () => modal.style.display = 'block');
        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
        
        if (form) form.addEventListener('submit', handleAddCompany);
        
        // Control functionality - ENSURE CONTROLS WORK
        const radiusControl = document.getElementById('radius-control');
        const distanceControl = document.getElementById('distance-control');
        const perfectAlignmentBtn = document.getElementById('perfect-alignment-btn');
        const radiusValue = document.getElementById('radius-value');
        const distanceValue = document.getElementById('distance-value');
        
        console.log('Setting up controls:', { radiusControl, distanceControl, perfectAlignmentBtn });
        
        if (radiusControl) {
            radiusControl.addEventListener('input', (e) => {
                console.log('Radius changed:', e.target.value);
                circleConfig.radius = parseInt(e.target.value);
                if (radiusValue) radiusValue.textContent = `${circleConfig.radius}px`;
                updateCircles();
                autoSave();
            });
        }
        
        if (distanceControl) {
            distanceControl.addEventListener('input', (e) => {
                console.log('Distance changed:', e.target.value);
                circleConfig.centerDistance = parseInt(e.target.value);
                if (distanceValue) distanceValue.textContent = `${circleConfig.centerDistance}px`;
                updateCirclePositions();
                updateCircles();
                autoSave();
            });
        }
        
        if (perfectAlignmentBtn) {
            perfectAlignmentBtn.addEventListener('click', (e) => {
                console.log('Perfect alignment clicked');
                e.preventDefault();
                // Apply the perfect geometric formula: d = r × √3 ≈ r × 1.732
                const perfectDistance = Math.round(circleConfig.radius * 1.732);
                circleConfig.centerDistance = perfectDistance;
                if (distanceControl) distanceControl.value = perfectDistance;
                if (distanceValue) distanceValue.textContent = `${perfectDistance}px`;
                updateCirclePositions();
                updateCircles();
                autoSave();
                showNotification('Perfect geometric alignment applied!');
            });
        }
        
        // Global mouse events for dragging
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', endDrag);
        
        // Drop zone event listeners
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.addEventListener('mouseenter', handleDropZoneEnter);
            zone.addEventListener('mouseleave', handleDropZoneLeave);
        });
    }, 100);
}

function startDrag(e) {
    e.preventDefault();
    draggedElement = e.target;
    draggedElement.classList.add('dragging');
    
    const rect = draggedElement.getBoundingClientRect();
    const containerRect = document.getElementById('companies-container').getBoundingClientRect();
    
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    // Bring to front
    draggedElement.style.zIndex = '1000';
}

function handleDrag(e) {
    if (!draggedElement) return;
    
    const containerRect = document.getElementById('companies-container').getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;
    
    // Keep within bounds
    const maxX = containerRect.width - 40;
    const maxY = containerRect.height - 40;
    const clampedX = Math.max(0, Math.min(x, maxX));
    const clampedY = Math.max(0, Math.min(y, maxY));
    
    draggedElement.style.left = `${clampedX}px`;
    draggedElement.style.top = `${clampedY}px`;
    
    // Update company position in data
    const index = parseInt(draggedElement.getAttribute('data-index'));
    companies[index].x = clampedX;
    companies[index].y = clampedY;
    autoSave();
    
    // Check if over drop zones
    checkDropZones(e.clientX, e.clientY);
}

function endDrag(e) {
    if (!draggedElement) return;
    
    draggedElement.classList.remove('dragging');
    draggedElement.style.zIndex = '';
    
    // Clear all drop zone highlights
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drag-over');
    });
    
    // Update category based on final position
    updateCompanyCategory(draggedElement);
    
    draggedElement = null;
}

function checkDropZones(clientX, clientY) {
    const svgRect = document.querySelector('.venn-diagram').getBoundingClientRect();
    const relativeX = clientX - svgRect.left;
    const relativeY = clientY - svgRect.top;
    
    // Get current responsive dimensions
    const responsive = getResponsiveDimensions();
    
    // Convert to SVG coordinates
    const svgX = (relativeX / svgRect.width) * responsive.svgWidth;
    const svgY = (relativeY / svgRect.height) * responsive.svgHeight;
    
    // Clear all highlights first
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drag-over');
    });
    
    // Check which circle the cursor is over
    const circles = [
        { id: 'hris-zone', cx: circleConfig.centers.hris.x, cy: circleConfig.centers.hris.y, r: circleConfig.radius },
        { id: 'payroll-zone', cx: circleConfig.centers.payroll.x, cy: circleConfig.centers.payroll.y, r: circleConfig.radius },
        { id: 'expense-zone', cx: circleConfig.centers.expense.x, cy: circleConfig.centers.expense.y, r: circleConfig.radius }
    ];
    
    circles.forEach(circle => {
        const distance = Math.sqrt((svgX - circle.cx) ** 2 + (svgY - circle.cy) ** 2);
        if (distance <= circle.r) {
            document.getElementById(circle.id).classList.add('drag-over');
        }
    });
}

function updateCompanyCategory(element) {
    const rect = element.getBoundingClientRect();
    const svgRect = document.querySelector('.venn-diagram').getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 - svgRect.left;
    const centerY = rect.top + rect.height / 2 - svgRect.top;
    
    // Get current responsive dimensions
    const responsive = getResponsiveDimensions();
    
    // Convert to SVG coordinates
    const svgX = (centerX / svgRect.width) * responsive.svgWidth;
    const svgY = (centerY / svgRect.height) * responsive.svgHeight;
    
    const index = parseInt(element.getAttribute('data-index'));
    
    // Check which circles contain the center point
    const inHRIS = isPointInCircle(svgX, svgY, circleConfig.centers.hris.x, circleConfig.centers.hris.y, circleConfig.radius);
    const inPayroll = isPointInCircle(svgX, svgY, circleConfig.centers.payroll.x, circleConfig.centers.payroll.y, circleConfig.radius);
    const inExpense = isPointInCircle(svgX, svgY, circleConfig.centers.expense.x, circleConfig.centers.expense.y, circleConfig.radius);
    
    // Determine category
    let newCategory = 'none';
    if (inHRIS && inPayroll && inExpense) {
        newCategory = 'all';
    } else if (inHRIS && inPayroll) {
        newCategory = 'hris-payroll';
    } else if (inHRIS && inExpense) {
        newCategory = 'hris-expense';
    } else if (inPayroll && inExpense) {
        newCategory = 'payroll-expense';
    } else if (inHRIS) {
        newCategory = 'hris';
    } else if (inPayroll) {
        newCategory = 'payroll';
    } else if (inExpense) {
        newCategory = 'expense';
    }
    
    companies[index].category = newCategory;
}

function isPointInCircle(x, y, cx, cy, r) {
    const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    return distance <= r;
}

function handleDropZoneEnter(e) {
    if (draggedElement) {
        e.target.classList.add('drag-over');
    }
}

function handleDropZoneLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleAddCompany(e) {
    e.preventDefault();
    console.log('Add company form submitted');
    
    const name = document.getElementById('company-name').value.trim();
    const logoUrl = document.getElementById('company-logo').value.trim();
    const isPortfolio = document.getElementById('is-portfolio').checked;
    
    console.log('Company data:', { name, logoUrl, isPortfolio });
    
    if (!name) {
        console.log('No name provided');
        return;
    }
    
    // Add new company at center using responsive positioning
    const responsive = getResponsiveDimensions();
    const centerX = responsive.svgWidth / 2;
    const centerY = responsive.svgHeight / 2;
    
    const newCompany = {
        name: name,
        logo: logoUrl || null,
        x: centerX,
        y: centerY,
        category: 'none',
        portfolio: isPortfolio
    };
    
    console.log('Adding company:', newCompany);
    companies.push(newCompany);
    renderCompanies();
    autoSave();
    
    // Reset form and close modal
    e.target.reset();
    document.getElementById('add-company-modal').style.display = 'none';
    
    // Show success feedback
    showNotification(`${name} added successfully!`);
    console.log('Company added, total companies:', companies.length);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Status indicator functions
function updateStatus(text, type = '') {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    statusText.textContent = text;
    statusIndicator.className = `status-indicator ${type}`;
}

// Firebase save/load functionality with localStorage fallback
async function saveData() {
    const data = {
        companies: companies,
        circleConfig: circleConfig,
        timestamp: Date.now()
    };
    
    updateStatus('Saving...', 'saving');
    
    try {
        if (isFirebaseEnabled && db) {
            await db.collection('dashboards').doc('main').set(data);
            updateStatus('Saved', 'saved');
        } else {
            throw new Error('Firebase not available');
        }
    } catch (error) {
        console.log('Saving to localStorage instead:', error);
        localStorage.setItem('vennDashboardData', JSON.stringify(data));
        updateStatus('Saved locally', 'error');
    }
    
    // Hide status after 2 seconds
    setTimeout(() => {
        updateStatus('Connected', isFirebaseEnabled ? 'saved' : 'error');
    }, 2000);
}

async function loadData() {
    updateStatus('Loading...', 'saving');
    
    try {
        if (isFirebaseEnabled && db) {
            const doc = await db.collection('dashboards').doc('main').get();
            if (doc.exists) {
                const data = doc.data();
                companies = data.companies || [...initialCompanies];
                circleConfig = { ...circleConfig, ...(data.circleConfig || {}) };
                
                // Update UI with loaded config
                document.getElementById('radius-control').value = circleConfig.radius;
                document.getElementById('distance-control').value = circleConfig.centerDistance;
                document.getElementById('radius-value').textContent = `${circleConfig.radius}px`;
                document.getElementById('distance-value').textContent = `${circleConfig.centerDistance}px`;
                
                updateCirclePositions();
                updateCircles();
                renderCompanies();
                updateStatus('Loaded', 'saved');
                return;
            }
        }
        throw new Error('No Firebase data or Firebase not available');
    } catch (error) {
        console.log('Loading from localStorage instead:', error);
        const saved = localStorage.getItem('vennDashboardData');
        if (saved) {
            const data = JSON.parse(saved);
            companies = data.companies || data; // Handle old format
            if (data.circleConfig) {
                circleConfig = { ...circleConfig, ...data.circleConfig };
                
                // Update UI
                document.getElementById('radius-control').value = circleConfig.radius;
                document.getElementById('distance-control').value = circleConfig.centerDistance;
                document.getElementById('radius-value').textContent = `${circleConfig.radius}px`;
                document.getElementById('distance-value').textContent = `${circleConfig.centerDistance}px`;
                
                updateCirclePositions();
                updateCircles();
            }
            renderCompanies();
        }
        updateStatus('Loaded locally', 'error');
    }
    
    // Hide status after 2 seconds
    setTimeout(() => {
        updateStatus(isFirebaseEnabled ? 'Connected' : 'Local Mode', isFirebaseEnabled ? 'saved' : 'error');
    }, 2000);
}

// Auto-save with debouncing
let saveTimeout;
function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveData, 1000); // Save after 1 second of inactivity
}

// Real-time listeners for Firebase
function setupRealtimeListener() {
    if (isFirebaseEnabled && db) {
        db.collection('dashboards').doc('main').onSnapshot((doc) => {
            if (doc.exists && !draggedElement) { // Don't update while dragging
                const data = doc.data();
                if (data.timestamp > (lastUpdateTimestamp || 0)) {
                    companies = data.companies || [...initialCompanies];
                    circleConfig = { ...circleConfig, ...(data.circleConfig || {}) };
                    
                    // Update UI
                    document.getElementById('radius-control').value = circleConfig.radius;
                    document.getElementById('distance-control').value = circleConfig.centerDistance;
                    document.getElementById('radius-value').textContent = `${circleConfig.radius}px`;
                    document.getElementById('distance-value').textContent = `${circleConfig.centerDistance}px`;
                    
                    updateCirclePositions();
                    updateCircles();
                    renderCompanies();
                    lastUpdateTimestamp = data.timestamp;
                }
            }
        });
    }
}

let lastUpdateTimestamp = 0;

// Load saved data on startup
window.addEventListener('load', () => {
    // Initialize responsive layout immediately
    initializeLayout();
    
    // Small delay to allow firebase-config.js to load
    setTimeout(() => {
        initializeFirebase();
        loadData();
        setupRealtimeListener();
    }, 100);
});

// Handle window resize
window.addEventListener('resize', () => {
    initializeLayout();
});

// Initialize or reinitialize the entire layout - FIT TO SCREEN by default
function initializeLayout() {
    console.log('Initializing layout...');
    
    // Force responsive update
    updateCirclePositions();
    updateCircles();
    
    // Create company cards by default
    if (companies.length === 0) {
        companies = [...initialCompanies];
    }
    
    renderCompanies();
    
    // Set up controls after layout is ready
    setTimeout(() => {
        setupEventListeners();
    }, 50);
    
    console.log('Layout initialized with', companies.length, 'companies');
}

// Update circle positions and SVG dimensions
function updateCirclePositions() {
    const responsive = getResponsiveDimensions();
    
    // Update configuration with responsive values
    circleConfig.radius = responsive.radius;
    circleConfig.centerDistance = responsive.centerDistance;
    circleConfig.centers = responsive.centers;
    
    // Update SVG viewBox to fit content
    const svg = document.querySelector('.venn-diagram');
    if (svg) {
        svg.setAttribute('viewBox', `0 0 ${responsive.svgWidth} ${responsive.svgHeight}`);
    }
    
    // Update controls to reflect new values - FORCE UPDATE
    setTimeout(() => {
        const radiusControl = document.getElementById('radius-control');
        const distanceControl = document.getElementById('distance-control');
        const radiusValue = document.getElementById('radius-value');
        const distanceValue = document.getElementById('distance-value');
        
        if (radiusControl) {
            radiusControl.min = 150;
            radiusControl.max = 500;
            radiusControl.value = Math.round(circleConfig.radius);
        }
        if (distanceControl) {
            distanceControl.min = 200;
            distanceControl.max = 800;
            distanceControl.value = Math.round(circleConfig.centerDistance);
        }
        if (radiusValue) radiusValue.textContent = `${circleConfig.radius}px`;
        if (distanceValue) distanceValue.textContent = `${circleConfig.centerDistance}px`;
    }, 10);
}

// Update circle elements in the SVG
function updateCircles() {
    const svg = document.querySelector('.venn-diagram');
    
    // Update visible circles
    const hrisCircle = document.getElementById('hris-circle');
    const payrollCircle = document.getElementById('payroll-circle');
    const expenseCircle = document.getElementById('expense-circle');
    
    // Update drop zones
    const hrisZone = document.getElementById('hris-zone');
    const payrollZone = document.getElementById('payroll-zone');
    const expenseZone = document.getElementById('expense-zone');
    
    // Update circle attributes
    [hrisCircle, hrisZone].forEach(circle => {
        circle.setAttribute('cx', circleConfig.centers.hris.x);
        circle.setAttribute('cy', circleConfig.centers.hris.y);
        circle.setAttribute('r', circleConfig.radius);
    });
    
    [payrollCircle, payrollZone].forEach(circle => {
        circle.setAttribute('cx', circleConfig.centers.payroll.x);
        circle.setAttribute('cy', circleConfig.centers.payroll.y);
        circle.setAttribute('r', circleConfig.radius);
    });
    
    [expenseCircle, expenseZone].forEach(circle => {
        circle.setAttribute('cx', circleConfig.centers.expense.x);
        circle.setAttribute('cy', circleConfig.centers.expense.y);
        circle.setAttribute('r', circleConfig.radius);
    });
    
    // Update labels - place outside circles in available space
    const labels = svg.querySelectorAll('.category-label');
    if (labels.length >= 3) {
        // HRIS label - LEFT OUTSIDE
        labels[0].setAttribute('x', Math.max(50, circleConfig.centers.hris.x - circleConfig.radius - 20));
        labels[0].setAttribute('y', circleConfig.centers.hris.y - 20);
        labels[0].setAttribute('text-anchor', 'middle');
        
        // Payroll & Benefits label - RIGHT OUTSIDE  
        const responsive = getResponsiveDimensions();
        labels[1].setAttribute('x', Math.min(responsive.svgWidth - 50, circleConfig.centers.payroll.x + circleConfig.radius + 20));
        labels[1].setAttribute('y', circleConfig.centers.payroll.y - 20);
        labels[1].setAttribute('text-anchor', 'middle');
        if (labels[1].querySelector('tspan')) {
            labels[1].querySelector('tspan').setAttribute('x', Math.min(responsive.svgWidth - 50, circleConfig.centers.payroll.x + circleConfig.radius + 20));
        }
        
        // Expense Management & Finance label - BOTTOM OUTSIDE
        labels[2].setAttribute('x', circleConfig.centers.expense.x);
        labels[2].setAttribute('y', Math.min(responsive.svgHeight - 20, circleConfig.centers.expense.y + circleConfig.radius + 30));
        labels[2].setAttribute('text-anchor', 'middle');
    }
} 