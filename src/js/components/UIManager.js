/**
 * UIManager - Handles all user interface interactions and state management
 */
export class UIManager {
  constructor(cardService, canvas) {
    this.cardService = cardService;
    this.canvas = canvas;
    this.clickPosition = { x: 0, y: 0 };
    this.contextMenuCard = null;
    
    this.config = {
      circleRadius: 180,
      circleSpacing: 310,
      circleOpacity: 30,
      cardSize: 80,
      showCircles: true,
      showGrid: false,
      showGuides: true
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupSliders();
    this.updateCanvasConfig();
    this.loadFromStorage();
  }

  setupEventListeners() {
    // Canvas events
    this.canvas.on('canvasClick', (data) => {
      this.clickPosition = data;
      this.updatePositionDisplay();
    });

    this.canvas.on('cardContextMenu', (data) => {
      this.contextMenuCard = data.card;
      this.showContextMenu(data.x, data.y);
    });

    // Form events
    this.setupFormHandlers();
    
    // Button events
    this.setupButtonHandlers();
    
    // Global events
    document.addEventListener('click', () => this.hideContextMenu());
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  setupFormHandlers() {
    const companyNameInput = document.getElementById('companyName');
    const categorySelect = document.getElementById('cardCategory');

    if (companyNameInput) {
      companyNameInput.addEventListener('input', this.updatePreview.bind(this));
      companyNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addBusinessCard();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', this.updatePreview.bind(this));
    }
  }

  setupButtonHandlers() {
    // Global function binding for onclick attributes
    window.openAddCardModal = () => this.openModal('addCardModal');
    window.openSettingsModal = () => this.openModal('settingsModal');
    window.exportCanvas = () => this.exportCanvas();
    window.addBusinessCard = () => this.addBusinessCard();
    window.populateCanvas = () => this.populateCanvas();
    window.clearAndPopulate = () => this.clearAndPopulate();
    window.clearAllCards = () => this.clearAllCards();
    window.selectAllCards = () => this.selectAllCards();
    window.deselectAllCards = () => this.deselectAllCards();
    window.toggleCircles = () => this.toggleCircles();
    window.toggleGrid = () => this.toggleGrid();
    window.setOptimalSpacing = () => this.setOptimalSpacing();
    window.closeModal = (modalId) => this.closeModal(modalId);
    window.editCard = () => this.editCard();
    window.duplicateCard = () => this.duplicateCard();
    window.deleteCardFromContext = () => this.deleteCardFromContext();
  }

  setupSliders() {
    const sliders = [
      { id: 'circleRadius', property: 'circleRadius', suffix: 'px', valueId: 'radiusValue' },
      { id: 'circleSpacing', property: 'circleSpacing', suffix: 'px', valueId: 'spacingValue' },
      { id: 'circleOpacity', property: 'circleOpacity', suffix: '%', valueId: 'opacityValue' },
      { id: 'cardSize', property: 'cardSize', suffix: 'px', valueId: 'cardSizeValue' }
    ];

    sliders.forEach(({ id, property, suffix, valueId }) => {
      const slider = document.getElementById(id);
      const valueDisplay = document.getElementById(valueId);

      if (slider && valueDisplay) {
        slider.value = this.config[property];
        valueDisplay.textContent = this.config[property] + suffix;

        slider.addEventListener('input', () => {
          this.config[property] = parseInt(slider.value);
          valueDisplay.textContent = this.config[property] + suffix;
          this.updateCanvasConfig();
          this.saveToStorage();
        });
      }
    });
  }

  updateCanvasConfig() {
    this.canvas.setConfig({
      cardSize: this.config.cardSize
    });
    
    this.canvas.showCircles = this.config.showCircles;
    this.canvas.render();
  }

  // Modal management
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      if (modalId === 'addCardModal') {
        this.updatePreview();
      }
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // Card operations
  addBusinessCard() {
    const companyName = document.getElementById('companyName')?.value.trim();
    const category = document.getElementById('cardCategory')?.value || 'technology';
    const logoUrl = document.getElementById('logoUrl')?.value.trim();

    if (!companyName) {
      this.showNotification('Please enter a company name', 'error');
      return;
    }

    if (this.clickPosition.x === 0 && this.clickPosition.y === 0) {
      this.showNotification('Please click on the canvas to set a position first', 'warning');
      return;
    }

    const card = this.cardService.createCard({
      company: companyName,
      category,
      x: this.clickPosition.x,
      y: this.clickPosition.y,
      logoUrl
    });

    this.canvas.setCards(this.cardService.getAllCards());
    this.closeModal('addCardModal');
    this.showNotification(`Added ${companyName} to canvas`, 'success');
    this.saveToStorage();
    
    // Clear form
    document.getElementById('companyName').value = '';
    if (document.getElementById('logoUrl')) {
      document.getElementById('logoUrl').value = '';
    }
  }

  populateCanvas() {
    const rect = this.canvas.canvas.getBoundingClientRect();
    const addedCount = this.cardService.populateWithCompanies(
      rect.width,
      rect.height,
      {
        radius: this.config.circleRadius,
        spacing: this.config.circleSpacing
      }
    );

    this.canvas.setCards(this.cardService.getAllCards());
    this.showNotification(`Added ${addedCount} companies to canvas`, 'success');
    this.saveToStorage();
  }

  clearAndPopulate() {
    this.cardService.clearAllCards();
    this.populateCanvas();
  }

  clearAllCards() {
    this.cardService.clearAllCards();
    this.canvas.setCards([]);
    this.showNotification('All cards cleared', 'info');
    this.saveToStorage();
  }

  selectAllCards() {
    this.canvas.selectedCards = [...this.cardService.getAllCards()];
    this.canvas.render();
  }

  deselectAllCards() {
    this.canvas.selectedCards = [];
    this.canvas.render();
  }

  // View controls
  toggleCircles() {
    this.config.showCircles = !this.config.showCircles;
    this.updateCanvasConfig();
    this.saveToStorage();
  }

  toggleGrid() {
    this.config.showGrid = !this.config.showGrid;
    this.updateCanvasConfig();
    this.saveToStorage();
  }

  setOptimalSpacing() {
    this.config.circleSpacing = 310;
    this.config.circleRadius = 180;
    
    const spacingSlider = document.getElementById('circleSpacing');
    const radiusSlider = document.getElementById('circleRadius');
    
    if (spacingSlider) spacingSlider.value = this.config.circleSpacing;
    if (radiusSlider) radiusSlider.value = this.config.circleRadius;
    
    this.updateSliderDisplays();
    this.updateCanvasConfig();
    this.saveToStorage();
  }

  updateSliderDisplays() {
    const radiusValue = document.getElementById('radiusValue');
    const spacingValue = document.getElementById('spacingValue');
    
    if (radiusValue) radiusValue.textContent = this.config.circleRadius + 'px';
    if (spacingValue) spacingValue.textContent = this.config.circleSpacing + 'px';
  }

  // Context menu
  showContextMenu(x, y) {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
      contextMenu.style.left = x + 'px';
      contextMenu.style.top = y + 'px';
      contextMenu.style.display = 'block';
    }
  }

  hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
      contextMenu.style.display = 'none';
    }
  }

  // Context menu actions
  editCard() {
    if (this.contextMenuCard) {
      this.showNotification('Edit functionality coming soon', 'info');
    }
  }

  duplicateCard() {
    if (this.contextMenuCard) {
      const duplicated = this.cardService.duplicateCard(this.contextMenuCard.id);
      if (duplicated) {
        this.canvas.setCards(this.cardService.getAllCards());
        this.showNotification(`Duplicated ${duplicated.company}`, 'success');
        this.saveToStorage();
      }
    }
  }

  deleteCardFromContext() {
    if (this.contextMenuCard) {
      const deleted = this.cardService.deleteCard(this.contextMenuCard.id);
      if (deleted) {
        this.canvas.setCards(this.cardService.getAllCards());
        this.showNotification('Card deleted', 'info');
        this.saveToStorage();
      }
    }
  }

  // Export functionality
  exportCanvas() {
    const exportCanvas = this.canvas.exportCanvas();
    
    exportCanvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      link.download = `business-cards-${timestamp}@2x.png`;
      link.click();
      URL.revokeObjectURL(url);
      
      this.showNotification('Canvas exported at 2x resolution!', 'success');
    });
  }

  // UI updates
  updatePositionDisplay() {
    const posDisplay = document.getElementById('selectedPosition');
    if (posDisplay) {
      posDisplay.textContent = `${Math.round(this.clickPosition.x)}, ${Math.round(this.clickPosition.y)}`;
    }
  }

  updatePreview() {
    const companyName = document.getElementById('companyName')?.value || 'Preview';
    const category = document.getElementById('cardCategory')?.value || 'technology';
    
    const preview = document.getElementById('cardPreview');
    if (preview) {
      const categoryColors = {
        technology: '#3b82f6',
        finance: '#10b981',
        healthcare: '#ef4444',
        education: '#8b5cf6',
        retail: '#f59e0b',
        manufacturing: '#6b7280',
        services: '#06b6d4',
        other: '#84cc16'
      };

      const initials = companyName
        .split(' ')
        .filter(word => word.length > 0)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join('');

      preview.innerHTML = `
        <div class="preview-card" style="
          background: linear-gradient(135deg, #1f2937, #111827);
          color: #ffffff;
          border: 2px solid #374151;
          position: relative;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          font-weight: bold;
        ">
          ${initials}
          <div style="
            position: absolute;
            top: 4px;
            right: 4px;
            width: 8px;
            height: 8px;
            background: ${categoryColors[category]};
            border-radius: 50%;
            border: 1px solid white;
          "></div>
        </div>
      `;
    }
  }

  // Keyboard shortcuts
  handleKeyDown(e) {
    if (e.key === 'Delete' && this.canvas.selectedCards.length > 0) {
      this.canvas.selectedCards.forEach(card => {
        this.cardService.deleteCard(card.id);
      });
      this.canvas.selectedCards = [];
      this.canvas.setCards(this.cardService.getAllCards());
      this.saveToStorage();
    }

    if (e.key === 'Escape') {
      this.deselectAllCards();
      this.hideContextMenu();
    }

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'a':
          e.preventDefault();
          this.selectAllCards();
          break;
        case 'e':
          e.preventDefault();
          this.exportCanvas();
          break;
      }
    }
  }

  // Notifications
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'error' ? 'exclamation-circle' : 
                           type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Storage
  saveToStorage() {
    const data = {
      config: this.config,
      cards: this.cardService.exportData(),
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem('businessCardCanvas', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('businessCardCanvas');
      if (data) {
        const parsed = JSON.parse(data);
        
        if (parsed.config) {
          this.config = { ...this.config, ...parsed.config };
          this.updateCanvasConfig();
        }
        
        if (parsed.cards) {
          this.cardService.importData(parsed.cards);
          this.canvas.setCards(this.cardService.getAllCards());
        }
        
        // Update UI with loaded values
        this.updateSliderValues();
      } else {
        // First visit - populate with some example companies
        this.populateWithExampleCompanies();
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  populateWithExampleCompanies() {
    // Add a few example companies on first visit
    const exampleCompanies = [
      { company: 'Workday', category: 'technology', x: 200, y: 150 },
      { company: 'Gusto', category: 'technology', x: 400, y: 150 },
      { company: 'Expensify', category: 'finance', x: 300, y: 300 },
      { company: 'ADP', category: 'technology', x: 250, y: 200 },
      { company: 'Concur', category: 'finance', x: 350, y: 250 }
    ];

    exampleCompanies.forEach(cardData => {
      this.cardService.createCard(cardData);
    });

    this.canvas.setCards(this.cardService.getAllCards());
    this.saveToStorage();
    
    // Show a welcome message
    setTimeout(() => {
      this.showNotification('Welcome! These are example companies. Click "Populate with Companies" for more or add your own!', 'info');
    }, 1000);
  }

  updateSliderValues() {
    const sliders = [
      { id: 'circleRadius', property: 'circleRadius', valueId: 'radiusValue', suffix: 'px' },
      { id: 'circleSpacing', property: 'circleSpacing', valueId: 'spacingValue', suffix: 'px' },
      { id: 'circleOpacity', property: 'circleOpacity', valueId: 'opacityValue', suffix: '%' },
      { id: 'cardSize', property: 'cardSize', valueId: 'cardSizeValue', suffix: 'px' }
    ];

    sliders.forEach(({ id, property, valueId, suffix }) => {
      const slider = document.getElementById(id);
      const valueDisplay = document.getElementById(valueId);

      if (slider && valueDisplay) {
        slider.value = this.config[property];
        valueDisplay.textContent = this.config[property] + suffix;
      }
    });
  }
} 