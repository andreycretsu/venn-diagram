/**
 * Core Canvas class for business card visualization
 * Handles canvas operations, rendering, and interaction management
 */
export class Canvas {
  constructor(canvasElement, config = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.config = {
      cardSize: 80,
      borderRadius: 12,
      exportScale: 2,
      ...config
    };
    
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.selectedCards = [];
    this.hoveredCard = null;
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * pixelRatio;
    this.canvas.height = rect.height * pixelRatio;
    this.ctx.scale(pixelRatio, pixelRatio);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    
    // Window events
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const card = this.getCardAt(x, y);
    if (card) {
      this.isDragging = true;
      this.dragOffset = {
        x: x - card.x,
        y: y - card.y
      };
      
      if (!this.selectedCards.includes(card)) {
        if (!e.ctrlKey && !e.metaKey) {
          this.selectedCards = [];
        }
        this.selectedCards.push(card);
      }
    }
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Move all selected cards
    this.selectedCards.forEach(card => {
      card.x = x - this.dragOffset.x;
      card.y = y - this.dragOffset.y;
    });
    
    this.render();
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleClick(e) {
    if (this.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.emit('canvasClick', { x, y });
  }

  handleContextMenu(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const card = this.getCardAt(x, y);
    if (card) {
      this.emit('cardContextMenu', { card, x: e.clientX, y: e.clientY });
    }
  }

  handleResize() {
    setTimeout(() => {
      this.resizeCanvas();
      this.render();
    }, 0);
  }

  getCardAt(x, y) {
    const halfSize = this.config.cardSize / 2;
    
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];
      if (x >= card.x - halfSize && x <= card.x + halfSize &&
          y >= card.y - halfSize && y <= card.y + halfSize) {
        return card;
      }
    }
    return null;
  }

  drawCard(card) {
    try {
      if (!card || typeof card.x !== 'number' || typeof card.y !== 'number') {
        return;
      }

      const { cardSize } = this.config;
      const borderRadius = Math.max(4, cardSize * 0.15);
      const x = card.x - cardSize / 2;
      const y = card.y - cardSize / 2;
      const isSelected = this.selectedCards && this.selectedCards.includes(card);
      const isHovered = this.hoveredCard === card;

      this.ctx.save();

      // Shadow (light shadow for unselected, no shadow for selected)
      if (!isSelected) {
        this.drawCardShadow(card, isSelected, isHovered);
      }
      
      // Background
      this.drawCardBackground(card, x, y, cardSize, borderRadius);
      
      // Border (only if selected)
      if (isSelected) {
        this.drawCardBorder(card, x, y, cardSize, borderRadius, isSelected, isHovered);
      }
      
      // Content
      this.drawCardContent(card, cardSize);

      this.ctx.restore();
    } catch (error) {
      console.error('Error drawing card:', error, card);
    }
  }

  drawCardShadow(card, isSelected, isHovered) {
    // Light subtle shadow for unselected cards only
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 2;
  }

  drawCardBackground(card, x, y, cardSize, borderRadius) {
    this.ctx.beginPath();
    this.roundRect(x, y, cardSize, cardSize, borderRadius);
    
    // Clean white background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
  }

  drawCardBorder(card, x, y, cardSize, borderRadius, isSelected, isHovered) {
    // Only blue border for selected items, no padding
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.roundRect(x, y, cardSize, cardSize, borderRadius);
    this.ctx.stroke();
  }

  drawCardContent(card, cardSize) {
    if (card.logoUrl && card.logoLoaded) {
      this.drawLogo(card, cardSize);
    } else {
      this.drawInitials(card, cardSize);
    }
  }

  drawLogo(card, cardSize) {
    const logoSize = cardSize * 0.7;
    const padding = cardSize * 0.15;
    
    this.ctx.save();
    this.ctx.beginPath();
    this.roundRect(
      card.x - cardSize/2 + padding,
      card.y - cardSize/2 + padding,
      cardSize - (padding * 2),
      cardSize - (padding * 2),
      8
    );
    this.ctx.clip();
    
    this.ctx.drawImage(
      card.logoImage,
      card.x - logoSize/2,
      card.y - logoSize/2,
      logoSize,
      logoSize
    );
    this.ctx.restore();
  }

  drawInitials(card, cardSize) {
    this.ctx.fillStyle = '#1e293b';
    this.ctx.font = `bold ${Math.max(14, cardSize * 0.25)}px Inter, system-ui, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const initials = this.getCompanyInitials(card.company);
    this.ctx.fillText(initials, card.x, card.y);
  }

  drawCategoryIndicator(card, x, y, cardSize) {
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
    
    const categoryColor = categoryColors[card.category] || '#84cc16';
    const indicatorRadius = Math.max(6, cardSize * 0.1);
    const indicatorX = x + cardSize - 12;
    const indicatorY = y + 12;
    
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetY = 2;
    
    this.ctx.fillStyle = categoryColor;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.arc(indicatorX, indicatorY, indicatorRadius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  roundRect(x, y, width, height, radius) {
    if (this.ctx.roundRect) {
      this.ctx.roundRect(x, y, width, height, radius);
    } else {
      this.ctx.moveTo(x + radius, y);
      this.ctx.lineTo(x + width - radius, y);
      this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.ctx.lineTo(x + width, y + height - radius);
      this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      this.ctx.lineTo(x + radius, y + height);
      this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.ctx.lineTo(x, y + radius);
      this.ctx.quadraticCurveTo(x, y, x + radius, y);
    }
  }

  getCompanyInitials(company) {
    return company
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');
  }

  render() {
    try {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw background
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
      
      // Draw circles if enabled
      if (this.showCircles) {
        this.drawCircles();
      }
      
      // Draw cards
      if (this.cards && Array.isArray(this.cards)) {
        this.cards.forEach(card => {
          if (card && typeof card === 'object') {
            this.drawCard(card);
          }
        });
      }
      
      // Draw selection indicators
      this.drawSelectionIndicators();
    } catch (error) {
      console.error('Canvas render error:', error);
    }
  }

  drawCircles() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    const offset = radius * 0.6;

    // Circle positions for Venn diagram
    const circles = [
      { x: centerX - offset, y: centerY - offset/2, label: 'HRIS', color: 'rgba(59, 130, 246, 0.1)' },
      { x: centerX + offset, y: centerY - offset/2, label: 'Payroll', color: 'rgba(16, 185, 129, 0.1)' },
      { x: centerX, y: centerY + offset, label: 'Expense', color: 'rgba(239, 68, 68, 0.1)' }
    ];

    // Draw circles
    circles.forEach(circle => {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = circle.color;
      this.ctx.strokeStyle = circle.color.replace('0.1', '0.6');
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      this.ctx.arc(circle.x, circle.y, radius, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();

      // Draw labels
      this.ctx.fillStyle = '#374151';
      this.ctx.font = 'bold 16px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(circle.label, circle.x, circle.y - radius - 30);
    });
  }

  drawSelectionIndicators() {
    // Selection is now handled directly in drawCard() method
    // No additional selection indicators needed
  }

  // Event emitter functionality
  emit(event, data) {
    if (this.eventHandlers && this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(data));
    }
  }

  on(event, handler) {
    if (!this.eventHandlers) this.eventHandlers = {};
    if (!this.eventHandlers[event]) this.eventHandlers[event] = [];
    this.eventHandlers[event].push(handler);
  }

  // Public API
  setCards(cards) {
    this.cards = cards;
    this.render();
  }

  setConfig(config) {
    this.config = { ...this.config, ...config };
    this.render();
  }

  exportCanvas() {
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    
    const scale = this.config.exportScale;
    exportCanvas.width = this.canvas.clientWidth * scale;
    exportCanvas.height = this.canvas.clientHeight * scale;
    
    exportCtx.scale(scale, scale);
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    
    const originalCtx = this.ctx;
    this.ctx = exportCtx;
    
    if (this.showCircles) this.drawCircles();
    if (this.cards) this.cards.forEach(card => this.drawCard(card));
    
    this.ctx = originalCtx;
    
    return exportCanvas;
  }
} 