// Enhanced Business Card Canvas Pro - Main Application
class BusinessCardCanvas {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Application state
        this.cards = [];
        this.selectedCards = [];
        this.cardIdCounter = 0;
        this.hoveredCard = null;
        this.contextCard = null;
        
        // Interaction state
        this.isDragging = false;
        this.dragCard = null;
        this.dragOffset = { x: 0, y: 0 };
        this.clickPosition = { x: 0, y: 0 };
        
        // UI state
        this.showCircles = true;
        this.showGrid = false;
        this.showGuides = true;
        this.snapToGrid = true;
        
        // Settings
        this.settings = {
            circleRadius: 180,
            circleSpacing: 310,
            circleOpacity: 30,
            gridSize: 20,
            cardSize: 80
        };
        
        // Executive template only
        this.templates = {
            executive: {
                name: 'Executive',
                description: 'Premium dark theme',
                background: 'linear-gradient(135deg, #1f2937, #111827)',
                secondaryBackground: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
                textColor: '#ffffff',
                borderColor: '#374151',
                shadow: 'glow',
                pattern: 'grid'
            }
        };
        
        // Category colors
        this.categoryColors = {
            technology: '#3b82f6',
            finance: '#10b981',
            healthcare: '#ef4444',
            education: '#8b5cf6',
            retail: '#f59e0b',
            manufacturing: '#6b7280',
            services: '#06b6d4',
            other: '#84cc16'
        };
        
        // Pre-populate with popular companies (all using executive template)
        this.popularCompanies = {
            hris: [
                { name: 'BambooHR', category: 'technology', template: 'executive' },
                { name: 'Workday', category: 'technology', template: 'executive' },
                { name: 'ADP', category: 'technology', template: 'executive' },
                { name: 'Namely', category: 'technology', template: 'executive' },
                { name: 'Rippling', category: 'technology', template: 'executive' },
                { name: 'Lattice', category: 'technology', template: 'executive' },
                { name: 'Culture Amp', category: 'technology', template: 'executive' },
                { name: 'BreatheHR', category: 'technology', template: 'executive' },
                { name: 'Personio', category: 'technology', template: 'executive' },
                { name: 'HiBob', category: 'technology', template: 'executive' }
            ],
            payroll: [
                { name: 'Gusto', category: 'finance', template: 'executive' },
                { name: 'Justworks', category: 'finance', template: 'executive' },
                { name: 'Paychex', category: 'finance', template: 'executive' },
                { name: 'TriNet', category: 'finance', template: 'executive' },
                { name: 'Paylocity', category: 'finance', template: 'executive' },
                { name: 'UKG', category: 'finance', template: 'executive' },
                { name: 'Remote', category: 'finance', template: 'executive' },
                { name: 'Deel', category: 'finance', template: 'executive' },
                { name: 'Sage', category: 'finance', template: 'executive' },
                { name: 'Zenefits', category: 'finance', template: 'executive' }
            ],
            expense: [
                { name: 'Expensify', category: 'finance', template: 'executive' },
                { name: 'Ramp', category: 'finance', template: 'executive' },
                { name: 'Brex', category: 'finance', template: 'executive' },
                { name: 'Pleo', category: 'finance', template: 'executive' },
                { name: 'Spendesk', category: 'finance', template: 'executive' },
                { name: 'Divvy', category: 'finance', template: 'executive' },
                { name: 'Concur', category: 'finance', template: 'executive' },
                { name: 'Coupa', category: 'finance', template: 'executive' },
                { name: 'Airbase', category: 'finance', template: 'executive' },
                { name: 'Mesh', category: 'finance', template: 'executive' }
            ]
        };

        this.logoCache = new Map();
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.setupSliders();
        this.loadFromStorage();
        this.renderTemplates();
        this.updateStatus('Ready');
        this.redraw();
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        
        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('click', this.hideContextMenu.bind(this));
        
        // Form events
        const companyNameInput = document.getElementById('companyName');
        const categorySelect = document.getElementById('cardCategory');
        const templateSelect = document.getElementById('cardTemplate');
        
        if (companyNameInput) {
            companyNameInput.addEventListener('input', this.updatePreview.bind(this));
            companyNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addBusinessCard();
            });
        }
        
        if (categorySelect) {
            categorySelect.addEventListener('change', this.updatePreview.bind(this));
        }
        
        if (templateSelect) {
            templateSelect.addEventListener('change', this.updatePreview.bind(this));
        }
    }
    
    setupSliders() {
        const sliders = [
            { id: 'circleRadius', property: 'circleRadius', suffix: 'px' },
            { id: 'circleSpacing', property: 'circleSpacing', suffix: 'px' },
            { id: 'circleOpacity', property: 'circleOpacity', suffix: '%' },
            { id: 'gridSize', property: 'gridSize', suffix: 'px' },
            { id: 'cardSize', property: 'cardSize', suffix: 'px' }
        ];
        
        sliders.forEach(({ id, property, suffix }) => {
            const slider = document.getElementById(id);
            const valueId = property === 'circleRadius' ? 'radiusValue' : 
                           property === 'circleSpacing' ? 'spacingValue' :
                           property === 'circleOpacity' ? 'opacityValue' : 
                           property === 'gridSize' ? 'gridSizeValue' : 'cardSizeValue';
            const valueDisplay = document.getElementById(valueId);
            
            if (slider && valueDisplay) {
                slider.value = this.settings[property];
                valueDisplay.textContent = this.settings[property] + suffix;
                
                slider.addEventListener('input', () => {
                    this.settings[property] = parseInt(slider.value);
                    valueDisplay.textContent = this.settings[property] + suffix;
                    this.redraw();
                    this.saveToStorage();
                });
            }
        });
    }
    
    handleCanvasClick(e) {
        if (this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.clickPosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        this.updatePositionDisplay();
        
        const card = this.getCardAt(this.clickPosition.x, this.clickPosition.y);
        
        if (!e.ctrlKey && !e.metaKey) {
            this.selectedCards = [];
        }
        
        if (card) {
            const index = this.selectedCards.indexOf(card);
            if (index === -1) {
                this.selectedCards.push(card);
            } else if (e.ctrlKey || e.metaKey) {
                this.selectedCards.splice(index, 1);
            }
        }
        
        this.updateQuickToolbar();
        this.redraw();
    }
    
    handleMouseDown(e) {
        if (e.button !== 0) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const card = this.getCardAt(x, y);
        
        if (card) {
            if (!this.selectedCards.includes(card)) {
                if (!e.ctrlKey && !e.metaKey) {
                    this.selectedCards = [card];
                } else {
                    this.selectedCards.push(card);
                }
            }
            
            this.isDragging = true;
            this.dragCard = card;
            this.dragOffset = {
                x: x - card.x,
                y: y - card.y
            };
            
            this.canvas.style.cursor = 'grabbing';
        } else if (!e.ctrlKey && !e.metaKey) {
            this.selectedCards = [];
            this.updateQuickToolbar();
        }
        
        this.redraw();
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.isDragging && this.dragCard) {
            const newX = x - this.dragOffset.x;
            const newY = y - this.dragOffset.y;
            
            const deltaX = newX - this.dragCard.x;
            const deltaY = newY - this.dragCard.y;
            
            this.selectedCards.forEach(card => {
                let targetX = card.x + deltaX;
                let targetY = card.y + deltaY;
                
                if (this.snapToGrid) {
                    targetX = Math.round(targetX / this.settings.gridSize) * this.settings.gridSize;
                    targetY = Math.round(targetY / this.settings.gridSize) * this.settings.gridSize;
                }
                
                card.x = targetX;
                card.y = targetY;
            });
            
            this.redraw();
            this.saveToStorage();
        } else {
            const card = this.getCardAt(x, y);
            
            if (card !== this.hoveredCard) {
                this.hoveredCard = card;
                
                if (card) {
                    this.canvas.style.cursor = 'grab';
                    this.showTooltip(card, e.clientX, e.clientY);
                } else {
                    this.canvas.style.cursor = 'crosshair';
                    this.hideTooltip();
                }
                
                this.redraw();
            }
            
            if (this.hoveredCard && !this.isDragging) {
                this.showTooltip(this.hoveredCard, e.clientX, e.clientY);
            }
        }
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.dragCard = null;
        this.canvas.style.cursor = this.hoveredCard ? 'grab' : 'crosshair';
        
        if (this.selectedCards.length > 0) {
            this.saveToStorage();
        }
    }
    
    handleMouseLeave() {
        this.hoveredCard = null;
        this.hideTooltip();
        this.redraw();
    }
    
    handleContextMenu(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const card = this.getCardAt(x, y);
        
        if (card) {
            this.contextCard = card;
            this.showContextMenu(e.clientX, e.clientY);
        }
    }
    
    handleResize() {
        // Instant canvas resize without debouncing
        setTimeout(() => {
            this.resizeCanvas();
            this.redraw();
        }, 0);
    }
    
    handleKeyDown(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            this.deleteSelected();
        } else if (e.key === 'Escape') {
            this.closeAllModals();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            this.selectAllCards();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.duplicateSelected();
        }
    }
    
    // Drawing methods
    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.showGrid) {
            this.drawGrid();
        }
        
        if (this.showCircles) {
            this.drawCircles();
        }
        
        if (this.showGuides && this.selectedCards.length > 0) {
            this.drawAlignmentGuides();
        }
        
        this.cards.forEach(card => this.drawCard(card));
        
        if (this.selectedCards.length > 0) {
            this.drawSelectionIndicators();
        }
    }
    
    drawGrid() {
        const gridSize = this.settings.gridSize;
        const canvasWidth = this.canvas.clientWidth;
        const canvasHeight = this.canvas.clientHeight;
        
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.5;
        
        for (let x = 0; x <= canvasWidth; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, canvasHeight);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= canvasHeight; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(canvasWidth, y);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    drawCircles() {
        const centerX = this.canvas.clientWidth / 2;
        const centerY = this.canvas.clientHeight / 2;
        const radius = this.settings.circleRadius;
        const spacing = this.settings.circleSpacing;
        const opacity = this.settings.circleOpacity / 100;
        
        const height = spacing * Math.sqrt(3) / 2;
        const positions = [
            { x: centerX, y: centerY - height * 2/3 },
            { x: centerX - spacing/2, y: centerY + height/3 },
            { x: centerX + spacing/2, y: centerY + height/3 }
        ];
        
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = opacity;
        
        positions.forEach(pos => {
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawAlignmentGuides() {
        if (this.selectedCards.length === 0) return;
        
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.globalAlpha = 0.7;
        
        const canvasWidth = this.canvas.clientWidth;
        const canvasHeight = this.canvas.clientHeight;
        
        this.selectedCards.forEach(card => {
            this.ctx.beginPath();
            this.ctx.moveTo(card.x, 0);
            this.ctx.lineTo(card.x, canvasHeight);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, card.y);
            this.ctx.lineTo(canvasWidth, card.y);
            this.ctx.stroke();
        });
        
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1;
    }
    
    drawCard(card) {
        const template = this.templates[card.template] || this.templates.executive;
        const cardSize = this.settings.cardSize; // Dynamic card size from settings
        const borderRadius = Math.max(4, cardSize * 0.15); // Proportional border radius
        const x = card.x - cardSize / 2; // Top-left x coordinate
        const y = card.y - cardSize / 2; // Top-left y coordinate
        const isSelected = this.selectedCards.includes(card);
        const isHovered = this.hoveredCard === card;
        
        this.ctx.save();
        
        // Enhanced shadow system
        this.drawCardShadow(template, card.x, card.y, cardSize, borderRadius, isSelected, isHovered);
        
        // Draw pattern background if specified
        if (template.pattern) {
            this.drawCardPattern(template, x, y, cardSize, borderRadius);
        }
        
        // Main card background
        this.drawCardBackground(template, x, y, cardSize, borderRadius);
        
        // Secondary overlay background
        if (template.secondaryBackground) {
            this.drawSecondaryBackground(template, x, y, cardSize, borderRadius);
        }
        
        // Border with enhanced styling
        this.drawCardBorder(template, card, x, y, cardSize, borderRadius, isSelected, isHovered);
        
        // Company content (logo or initials)
        this.drawCardContent(template, card, card.x, card.y, cardSize);
        
        // Category indicator
        this.drawCategoryIndicator(card, x, y, cardSize);
        
        this.ctx.restore();
    }
    
    drawCardShadow(template, centerX, centerY, cardSize, borderRadius, isSelected, isHovered) {
        const shadowConfig = {
            modern: { color: 'rgba(102, 126, 234, 0.25)', blur: 20, offset: 8 },
            executive: { color: 'rgba(0, 0, 0, 0.4)', blur: 25, offset: 12 },
            classic: { color: 'rgba(100, 116, 139, 0.25)', blur: 15, offset: 6 },
            soft: { color: 'rgba(0, 0, 0, 0.15)', blur: 12, offset: 4 },
            colorful: { color: 'rgba(240, 147, 251, 0.35)', blur: 18, offset: 8 },
            neon: { color: 'rgba(0, 255, 255, 0.5)', blur: 30, offset: 0 },
            elegant: { color: 'rgba(51, 65, 85, 0.2)', blur: 14, offset: 6 },
            corporate: { color: 'rgba(30, 64, 175, 0.3)', blur: 16, offset: 8 },
            glow: { color: 'rgba(102, 126, 234, 0.4)', blur: 35, offset: 0 }
        };
        
        const config = shadowConfig[template.shadow] || shadowConfig.soft;
        
        // Enhance shadow for interaction states
        let shadowIntensity = 1;
        if (isSelected) shadowIntensity = 1.5;
        else if (isHovered) shadowIntensity = 1.2;
        
        this.ctx.shadowColor = config.color;
        this.ctx.shadowBlur = config.blur * shadowIntensity;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = config.offset * shadowIntensity;
    }
    
    drawCardPattern(template, x, y, cardSize, borderRadius) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.08;
        
        // Create clipping path for rectangle
        this.ctx.beginPath();
        this.roundRect(x + 1, y + 1, cardSize - 2, cardSize - 2, borderRadius - 1);
        this.ctx.clip();
        
        switch (template.pattern) {
            case 'dots':
                this.drawDotsPattern(x, y, cardSize);
                break;
            case 'grid':
                this.drawGridPattern(x, y, cardSize);
                break;
            case 'waves':
                this.drawWavesPattern(x, y, cardSize);
                break;
            case 'circuit':
                this.drawCircuitPattern(x, y, cardSize);
                break;
            case 'lines':
                this.drawLinesPattern(x, y, cardSize);
                break;
            case 'subtle':
                this.drawSubtlePattern(x, y, cardSize);
                break;
        }
        
        this.ctx.restore();
    }
    
    drawDotsPattern(x, y, cardSize) {
        this.ctx.fillStyle = '#ffffff';
        const spacing = 8;
        const halfSize = cardSize / 2;
        
        for (let dx = -halfSize + spacing; dx < halfSize; dx += spacing) {
            for (let dy = -halfSize + spacing; dy < halfSize; dy += spacing) {
                this.ctx.beginPath();
                this.ctx.arc(x + halfSize + dx, y + halfSize + dy, 1.5, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }
    
    drawGridPattern(x, y, cardSize) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 0.8;
        const spacing = 8;
        
        // Vertical lines
        for (let dx = spacing; dx < cardSize; dx += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + dx, y);
            this.ctx.lineTo(x + dx, y + cardSize);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let dy = spacing; dy < cardSize; dy += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + dy);
            this.ctx.lineTo(x + cardSize, y + dy);
            this.ctx.stroke();
        }
    }
    
    drawWavesPattern(x, y, cardSize) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        const waves = 5;
        
        for (let i = 0; i < waves; i++) {
            this.ctx.beginPath();
            const amplitude = cardSize / 10;
            const frequency = 0.03;
            const offsetY = (i - waves/2) * (cardSize / waves);
            
            for (let dx = 0; dx <= cardSize; dx += 2) {
                const waveY = y + cardSize/2 + offsetY + Math.sin((x + dx) * frequency) * amplitude;
                if (dx === 0) {
                    this.ctx.moveTo(x + dx, waveY);
                } else {
                    this.ctx.lineTo(x + dx, waveY);
                }
            }
            this.ctx.stroke();
        }
    }
    
    drawCircuitPattern(x, y, cardSize) {
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 1;
        
        const quarter = cardSize / 4;
        const half = cardSize / 2;
        const threeQuarter = cardSize * 3 / 4;
        
        // Draw circuit-like lines adapted for rectangle
        const lines = [
            { x1: quarter, y1: quarter, x2: threeQuarter, y2: quarter },
            { x1: threeQuarter, y1: quarter, x2: threeQuarter, y2: threeQuarter },
            { x1: threeQuarter, y1: threeQuarter, x2: quarter, y2: threeQuarter },
            { x1: quarter, y1: threeQuarter, x2: quarter, y2: half },
            { x1: quarter, y1: half, x2: half, y2: half },
            { x1: half, y1: half, x2: half, y2: quarter + 10 }
        ];
        
        lines.forEach(line => {
            this.ctx.beginPath();
            this.ctx.moveTo(x + line.x1, y + line.y1);
            this.ctx.lineTo(x + line.x2, y + line.y2);
            this.ctx.stroke();
            
            // Add connection points
            this.ctx.fillStyle = '#00ffff';
            this.ctx.beginPath();
            this.ctx.arc(x + line.x2, y + line.y2, 1.5, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }
    
    drawLinesPattern(x, y, cardSize) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 0.8;
        const spacing = 8;
        
        // Draw diagonal lines across the rectangle
        for (let offset = -cardSize; offset <= cardSize; offset += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + offset, y);
            this.ctx.lineTo(x + offset + cardSize, y + cardSize);
            this.ctx.stroke();
        }
    }
    
    drawSubtlePattern(x, y, cardSize) {
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 0.5;
        
        const concentric = 4;
        const centerX = x + cardSize / 2;
        const centerY = y + cardSize / 2;
        const maxRadius = cardSize / 3;
        
        for (let i = 1; i <= concentric; i++) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, (maxRadius * i) / concentric, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
    }
    
    drawCardBackground(template, x, y, cardSize, borderRadius) {
        this.ctx.beginPath();
        this.roundRect(x, y, cardSize, cardSize, borderRadius);
        
        if (template.background.includes('gradient')) {
            const gradient = this.ctx.createLinearGradient(
                x, y,
                x + cardSize, y + cardSize
            );
            
            // Parse colors from gradient string
            const colorMatches = template.background.match(/#[a-fA-F0-9]{6}/g);
            if (colorMatches && colorMatches.length >= 2) {
                gradient.addColorStop(0, colorMatches[0]);
                gradient.addColorStop(1, colorMatches[1]);
            } else {
                // Fallback colors
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
            }
            
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = template.background;
        }
        
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    drawSecondaryBackground(template, x, y, cardSize, borderRadius) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.6;
        
        this.ctx.beginPath();
        this.roundRect(x, y, cardSize, cardSize, borderRadius);
        
        // Create linear gradient overlay for rectangular cards
        const gradient = this.ctx.createLinearGradient(
            x, y,
            x + cardSize, y + cardSize
        );
        gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
        gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawCardBorder(template, card, x, y, cardSize, borderRadius, isSelected, isHovered) {
        this.ctx.strokeStyle = isSelected ? '#667eea' : 
                             (isHovered ? '#764ba2' : template.borderColor);
        this.ctx.lineWidth = isSelected ? 3 : (isHovered ? 2.5 : 2);
        
        if (card.isPortfolio) {
            // Animated dashed border for portfolio companies
            this.ctx.setLineDash([6, 4]);
        } else {
            this.ctx.setLineDash([]);
        }
        
        this.ctx.beginPath();
        this.roundRect(x, y, cardSize, cardSize, borderRadius);
        this.ctx.stroke();
        
        // Add inner highlight for premium templates
        if (['executive', 'neon', 'corporate'].includes(template.shadow)) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.4;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([]);
            this.ctx.beginPath();
            this.roundRect(x + 2, y + 2, cardSize - 4, cardSize - 4, borderRadius - 1);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
    
    drawCardContent(template, card, x, y, cardSize) {
        if (card.logoUrl && card.logoLoaded) {
            // Draw logo with better sizing for rectangular cards
            const logoSize = cardSize * 0.7; // 70% of card size for logo
            const padding = cardSize * 0.15; // 15% padding from edges
            
            this.ctx.save();
            
            // Create rounded rectangular clipping for logo
            this.ctx.beginPath();
            this.roundRect(
                x - cardSize/2 + padding, 
                y - cardSize/2 + padding, 
                cardSize - (padding * 2), 
                cardSize - (padding * 2), 
                8
            );
            this.ctx.clip();
            
            this.ctx.drawImage(
                card.logoImage,
                x - logoSize/2,
                y - logoSize/2,
                logoSize,
                logoSize
            );
            this.ctx.restore();
        } else {
            // Enhanced initials with better typography
            this.ctx.fillStyle = template.textColor;
            this.ctx.font = 'bold 20px Inter, system-ui, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Add text shadow for better contrast
            if (template.textColor === '#ffffff' || template.shadow === 'neon') {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                this.ctx.shadowBlur = 3;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 1;
            } else if (template.textColor !== '#ffffff') {
                this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                this.ctx.shadowBlur = 2;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 1;
            }
            
            const initials = this.getCompanyInitials(card.company);
            this.ctx.fillText(initials, x, y);
            
            // Reset text shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        }
    }
    
    drawCategoryIndicator(card, x, y, cardSize) {
        // Enhanced category color indicator for rectangular cards
        const categoryColor = this.categoryColors[card.category] || '#84cc16';
        const indicatorRadius = 8;
        const indicatorX = x + cardSize - 12; // Position near top-right corner
        const indicatorY = y + 12; // Position near top-right corner
        
        this.ctx.save();
        
        // Shadow for indicator
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 0;
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
    
    drawSelectionIndicators() {
        this.selectedCards.forEach(card => {
            const cardSize = this.settings.cardSize;
            const padding = Math.max(6, cardSize * 0.1);
            const halfSize = cardSize / 2;
            
            // Draw selection rectangle with dashed border
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([8, 4]);
            this.ctx.beginPath();
            this.roundRect(
                card.x - halfSize - padding,
                card.y - halfSize - padding,
                cardSize + padding * 2,
                cardSize + padding * 2,
                8
            );
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Enhanced selection handles at corners and midpoints
            this.ctx.fillStyle = '#667eea';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            
            const handleSize = 4;
            const handlePositions = [
                // Corners
                { x: card.x - halfSize - padding, y: card.y - halfSize - padding },
                { x: card.x + halfSize + padding, y: card.y - halfSize - padding },
                { x: card.x + halfSize + padding, y: card.y + halfSize + padding },
                { x: card.x - halfSize - padding, y: card.y + halfSize + padding },
                // Midpoints
                { x: card.x, y: card.y - halfSize - padding },
                { x: card.x + halfSize + padding, y: card.y },
                { x: card.x, y: card.y + halfSize + padding },
                { x: card.x - halfSize - padding, y: card.y }
            ];
            
            handlePositions.forEach(pos => {
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, handleSize, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
            });
        });
    }
    
    // Helper method for drawing rounded rectangles
    roundRect(x, y, width, height, radius) {
        if (this.ctx.roundRect) {
            // Use native method if available
            this.ctx.roundRect(x, y, width, height, radius);
        } else {
            // Fallback implementation
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

    // Utility methods
    getCompanyInitials(company) {
        return company
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 3)
            .join('');
    }
    
    getCardAt(x, y) {
        const cardSize = this.settings.cardSize;
        const halfSize = cardSize / 2;
        
        for (let i = this.cards.length - 1; i >= 0; i--) {
            const card = this.cards[i];
            
            // Check if point is within rectangular bounds
            if (x >= card.x - halfSize && x <= card.x + halfSize &&
                y >= card.y - halfSize && y <= card.y + halfSize) {
                return card;
            }
        }
        return null;
    }
    
    // UI methods
    showTooltip(card, x, y) {
        const tooltip = document.getElementById('tooltip');
        tooltip.textContent = `${card.company} (${card.category})`;
        tooltip.style.left = x + 10 + 'px';
        tooltip.style.top = y - 30 + 'px';
        tooltip.classList.add('show');
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        tooltip.classList.remove('show');
    }
    
    showContextMenu(x, y) {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.style.display = 'block';
    }
    
    hideContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'none';
    }
    
    updatePositionDisplay() {
        const posDisplay = document.getElementById('selectedPosition');
        if (posDisplay) {
            posDisplay.textContent = `${Math.round(this.clickPosition.x)}, ${Math.round(this.clickPosition.y)}`;
        }
    }
    
    updatePreview() {
        const companyName = document.getElementById('companyName')?.value || 'Preview';
        const category = document.getElementById('cardCategory')?.value || 'technology';
        const template = document.getElementById('cardTemplate')?.value || 'modern';
        
        const preview = document.getElementById('cardPreview');
        if (preview) {
            const templateData = this.templates[template];
            const initials = this.getCompanyInitials(companyName);
            const categoryColor = this.categoryColors[category];
            
            preview.innerHTML = `
                <div class="preview-card" style="
                    background: ${templateData.background};
                    color: ${templateData.textColor};
                    border-color: ${templateData.borderColor};
                    box-shadow: ${templateData.shadow ? 'var(--shadow-lg)' : 'var(--shadow-sm)'};
                    position: relative;
                ">
                    ${initials}
                    <div style="
                        position: absolute;
                        top: 4px;
                        right: 4px;
                        width: 8px;
                        height: 8px;
                        background: ${categoryColor};
                        border-radius: 50%;
                    "></div>
                </div>
            `;
        }
    }
    
    updateQuickToolbar() {
        const toolbar = document.getElementById('quickToolbar');
        if (this.selectedCards.length > 1) {
            toolbar.style.display = 'flex';
        } else {
            toolbar.style.display = 'none';
        }
    }
    
    updateStatus(message, type = 'ready') {
        const indicator = document.getElementById('statusIndicator');
        const span = indicator.querySelector('span');
        
        span.textContent = message;
        indicator.className = `status-indicator ${type}`;
        
        if (type === 'busy') {
            setTimeout(() => this.updateStatus('Ready'), 2000);
        }
    }
    
    updateCardsGrid() {
        const grid = document.getElementById('cardsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (this.cards.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 40px;">No cards added yet</div>';
            return;
        }
        
        this.cards.forEach(card => {
            const isSelected = this.selectedCards.includes(card);
            
            const cardElement = document.createElement('div');
            cardElement.className = `card-item ${isSelected ? 'selected' : ''}`;
            cardElement.innerHTML = `
                <div class="card-name">${card.company}</div>
                <div class="card-info">
                    <span>${card.category}</span>
                    <span>(${Math.round(card.x)}, ${Math.round(card.y)})</span>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn edit" onclick="editCard(${card.id})">Edit</button>
                    <button class="card-action-btn delete" onclick="deleteCard(${card.id})">Delete</button>
                </div>
            `;
            
            cardElement.addEventListener('click', () => {
                const index = this.selectedCards.indexOf(card);
                if (index === -1) {
                    this.selectedCards.push(card);
                } else {
                    this.selectedCards.splice(index, 1);
                }
                this.updateCardsGrid();
                this.updateQuickToolbar();
                this.redraw();
            });
            
            grid.appendChild(cardElement);
        });
    }
    
    renderTemplates() {
        const grid = document.getElementById('templatesGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        Object.entries(this.templates).forEach(([key, template]) => {
            const templateElement = document.createElement('div');
            templateElement.className = 'template-item';
            templateElement.setAttribute('data-template', key);
            templateElement.innerHTML = `
                <div class="template-preview">📄</div>
                <div class="template-name">${template.name}</div>
                <div class="template-description">${template.description}</div>
            `;
            
            templateElement.addEventListener('click', () => {
                const templateSelect = document.getElementById('cardTemplate');
                if (templateSelect) {
                    templateSelect.value = key;
                    this.updatePreview();
                }
            });
            
            grid.appendChild(templateElement);
        });
    }
    
    // Card management methods
    addBusinessCard() {
        const companyName = document.getElementById('companyName')?.value.trim();
        const category = document.getElementById('cardCategory')?.value || 'technology';
        const template = document.getElementById('cardTemplate')?.value || 'modern';
        const logoUrl = document.getElementById('logoUrl')?.value.trim();
        
        if (!companyName) {
            this.showNotification('Please enter a company name', 'error');
            return;
        }
        
        if (this.clickPosition.x === 0 && this.clickPosition.y === 0) {
            this.showNotification('Please click on the canvas to set a position first', 'warning');
            return;
        }
        
        let x = this.clickPosition.x;
        let y = this.clickPosition.y;
        
        // Removed grid snapping - cards can now be placed at any coordinates
        
        const card = {
            id: this.cardIdCounter++,
            x: x,
            y: y,
            company: companyName,
            category: category,
            template: template,
            logo: logoUrl || null,
            createdAt: new Date().toISOString()
        };
        
        this.cards.push(card);
        this.selectedCards = [card];
        
        document.getElementById('companyName').value = '';
        document.getElementById('logoUrl').value = '';
        this.clickPosition = { x: 0, y: 0 };
        this.updatePositionDisplay();
        
        this.closeModal('addCardModal');
        this.updateCardsGrid();
        this.updateQuickToolbar();
        this.redraw();
        this.saveToStorage();
        
        this.showNotification(`Added ${companyName} to canvas`, 'success');
    }
    
    deleteCard(id) {
        const cardIndex = this.cards.findIndex(card => card.id === id);
        if (cardIndex === -1) return;
        
        const card = this.cards[cardIndex];
        this.cards.splice(cardIndex, 1);
        
        const selectionIndex = this.selectedCards.indexOf(card);
        if (selectionIndex !== -1) {
            this.selectedCards.splice(selectionIndex, 1);
        }
        
        this.updateCardsGrid();
        this.updateQuickToolbar();
        this.redraw();
        this.saveToStorage();
        
        this.showNotification(`Deleted ${card.company}`, 'success');
    }
    
    deleteSelected() {
        if (this.selectedCards.length === 0) return;
        
        const count = this.selectedCards.length;
        
        this.selectedCards.forEach(card => {
            const index = this.cards.indexOf(card);
            if (index !== -1) {
                this.cards.splice(index, 1);
            }
        });
        
        this.selectedCards = [];
        this.updateCardsGrid();
        this.updateQuickToolbar();
        this.redraw();
        this.saveToStorage();
        
        this.showNotification(`Deleted ${count} card${count > 1 ? 's' : ''}`, 'success');
    }
    
    duplicateSelected() {
        if (this.selectedCards.length === 0) return;
        
        const newCards = [];
        
        this.selectedCards.forEach(card => {
            const newCard = {
                ...card,
                id: this.cardIdCounter++,
                x: card.x + 80,
                y: card.y + 20,
                company: card.company + ' Copy'
            };
            
            this.cards.push(newCard);
            newCards.push(newCard);
        });
        
        this.selectedCards = newCards;
        this.updateCardsGrid();
        this.redraw();
        this.saveToStorage();
        
        this.showNotification(`Duplicated ${newCards.length} card${newCards.length > 1 ? 's' : ''}`, 'success');
    }
    
    selectAllCards() {
        this.selectedCards = [...this.cards];
        this.updateCardsGrid();
        this.updateQuickToolbar();
        this.redraw();
    }
    
    deselectAllCards() {
        this.selectedCards = [];
        this.updateCardsGrid();
        this.updateQuickToolbar();
        this.redraw();
    }
    
    clearAllCards() {
        if (this.cards.length === 0) return;
        
        if (confirm('Are you sure you want to delete all cards? This action cannot be undone.')) {
            this.cards = [];
            this.selectedCards = [];
            this.cardIdCounter = 0;
            
            this.updateCardsGrid();
            this.updateQuickToolbar();
            this.redraw();
            this.saveToStorage();
            
            this.showNotification('All cards deleted', 'success');
        }
    }
    
    // Alignment methods
    alignLeft() {
        if (this.selectedCards.length < 2) return;
        
        const leftmost = Math.min(...this.selectedCards.map(card => card.x));
        this.selectedCards.forEach(card => card.x = leftmost);
        
        this.redraw();
        this.saveToStorage();
        this.showNotification('Cards aligned to left', 'success');
    }
    
    alignCenter() {
        if (this.selectedCards.length < 2) return;
        
        const centerX = this.canvas.clientWidth / 2;
        this.selectedCards.forEach(card => card.x = centerX);
        
        this.redraw();
        this.saveToStorage();
        this.showNotification('Cards aligned to center', 'success');
    }
    
    alignRight() {
        if (this.selectedCards.length < 2) return;
        
        const rightmost = Math.max(...this.selectedCards.map(card => card.x));
        this.selectedCards.forEach(card => card.x = rightmost);
        
        this.redraw();
        this.saveToStorage();
        this.showNotification('Cards aligned to right', 'success');
    }
    
    distributeHorizontal() {
        if (this.selectedCards.length < 3) return;
        
        this.selectedCards.sort((a, b) => a.x - b.x);
        const leftmost = this.selectedCards[0].x;
        const rightmost = this.selectedCards[this.selectedCards.length - 1].x;
        const spacing = (rightmost - leftmost) / (this.selectedCards.length - 1);
        
        this.selectedCards.forEach((card, index) => {
            card.x = leftmost + (spacing * index);
        });
        
        this.redraw();
        this.saveToStorage();
        this.showNotification('Cards distributed horizontally', 'success');
    }
    
    distributeVertical() {
        if (this.selectedCards.length < 3) return;
        
        this.selectedCards.sort((a, b) => a.y - b.y);
        const topmost = this.selectedCards[0].y;
        const bottommost = this.selectedCards[this.selectedCards.length - 1].y;
        const spacing = (bottommost - topmost) / (this.selectedCards.length - 1);
        
        this.selectedCards.forEach((card, index) => {
            card.y = topmost + (spacing * index);
        });
        
        this.redraw();
        this.saveToStorage();
        this.showNotification('Cards distributed vertically', 'success');
    }
    
    // Settings methods
    toggleCircles() {
        this.showCircles = !this.showCircles;
        this.redraw();
        this.saveToStorage();
    }
    
    toggleGrid() {
        this.showGrid = !this.showGrid;
        const gridToggle = document.getElementById('gridToggle');
        if (gridToggle) {
            gridToggle.classList.toggle('active', this.showGrid);
        }
        this.redraw();
        this.saveToStorage();
    }
    
    setOptimalSpacing() {
        const radius = this.settings.circleRadius;
        const optimalSpacing = Math.round(radius * Math.sqrt(3));
        
        this.settings.circleSpacing = optimalSpacing;
        
        const spacingSlider = document.getElementById('circleSpacing');
        const spacingValue = document.getElementById('spacingValue');
        
        if (spacingSlider) spacingSlider.value = optimalSpacing;
        if (spacingValue) spacingValue.textContent = optimalSpacing + 'px';
        
        this.redraw();
        this.saveToStorage();
        
        this.showNotification('Optimal spacing applied', 'success');
    }
    
    // Export methods
    exportCanvas() {
        this.updateStatus('Exporting canvas at 2x resolution...', 'busy');
        
        setTimeout(() => {
            const exportCanvas = document.createElement('canvas');
            const exportCtx = exportCanvas.getContext('2d');
            
            // Export at 2x resolution
            const scale = 2;
            exportCanvas.width = this.canvas.clientWidth * scale;
            exportCanvas.height = this.canvas.clientHeight * scale;
            
            // Scale the context for 2x rendering
            exportCtx.scale(scale, scale);
            
            // Dark background for Executive theme
            exportCtx.fillStyle = '#0f172a';
            exportCtx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
            
            const originalCtx = this.ctx;
            this.ctx = exportCtx;
            
            if (this.showCircles) this.drawCircles();
            this.cards.forEach(card => this.drawCard(card));
            
            this.ctx = originalCtx;
            
            exportCanvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
                link.download = `business-cards-${timestamp}@2x.png`;
                link.click();
                URL.revokeObjectURL(url);
                
                this.updateStatus('Canvas exported at 2x resolution!', 'success');
                setTimeout(() => this.updateStatus('Ready'), 2000);
            });
        }, 100);
    }
    
    // Storage methods
    saveToStorage() {
        const data = {
            cards: this.cards,
            settings: this.settings,
            showCircles: this.showCircles,
            showGrid: this.showGrid,
            showGuides: this.showGuides,
            snapToGrid: this.snapToGrid,
            cardIdCounter: this.cardIdCounter,
            lastSaved: new Date().toISOString()
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
                
                this.cards = parsed.cards || [];
                this.settings = { ...this.settings, ...parsed.settings };
                this.showCircles = parsed.showCircles !== false;
                this.showGrid = parsed.showGrid || false;
                this.showGuides = parsed.showGuides !== false;
                this.snapToGrid = parsed.snapToGrid !== false;
                this.cardIdCounter = parsed.cardIdCounter || 0;
                
                this.updateCardsGrid();
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }
    
    // Modal methods
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        console.log(`${type.toUpperCase()}: ${message}`);
        this.updateStatus(message, type === 'error' ? 'error' : (type === 'warning' ? 'busy' : 'ready'));
    }
    
    // Add method to populate canvas with companies
    async populateCanvas() {
        const canvasRect = this.canvas.getBoundingClientRect();
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;
        
        // Calculate Venn diagram positions
        const radius = this.settings.circleRadius;
        const spacing = this.settings.circleSpacing;
        
        // Calculate perfect triangle positions
        const height = spacing * Math.sqrt(3) / 2;
        const positions = {
            hris: { x: centerX, y: centerY - height / 2 },
            payroll: { x: centerX - spacing / 2, y: centerY + height / 2 },
            expense: { x: centerX + spacing / 2, y: centerY + height / 2 }
        };

        let addedCount = 0;

        // Add companies to each category
        for (const [category, companies] of Object.entries(this.popularCompanies)) {
            const categoryCenter = positions[category];
            const companiesPerCategory = Math.min(companies.length, 8); // Limit to 8 per category
            
            for (let i = 0; i < companiesPerCategory; i++) {
                const company = companies[i];
                
                // Calculate position around category center
                const angle = (i / companiesPerCategory) * 2 * Math.PI;
                const distance = radius * 0.6; // Place within the circle
                const x = categoryCenter.x + Math.cos(angle) * distance;
                const y = categoryCenter.y + Math.sin(angle) * distance;
                
                // Create card
                const card = {
                    id: ++this.cardIdCounter,
                    company: company.name,
                    category: company.category,
                    template: company.template,
                    x: x,
                    y: y,
                    logoUrl: company.logoUrl,
                    logoLoaded: false,
                    logoImage: null,
                    isPortfolio: Math.random() > 0.7 // 30% chance of being portfolio
                };
                
                // Attempt to load logo
                this.loadCardLogo(card);
                
                this.cards.push(card);
                addedCount++;
            }
        }
        
        // Add some companies in intersection areas
        this.addIntersectionCompanies(positions, radius);
        
        this.updateStatus(`Added ${addedCount} companies to canvas`, 'ready');
        this.redraw();
        this.saveToStorage();
    }
    
    // Add companies in intersection areas (companies that span multiple categories)
    addIntersectionCompanies(positions, radius) {
        const intersectionCompanies = [
            { name: 'Rippling', category: 'technology', template: 'modern', x: (positions.hris.x + positions.payroll.x) / 2, y: (positions.hris.y + positions.payroll.y) / 2 },
            { name: 'Workday', category: 'technology', template: 'corporate', x: (positions.hris.x + positions.expense.x) / 2, y: (positions.hris.y + positions.expense.y) / 2 },
            { name: 'BambooHR', category: 'technology', template: 'elegant', x: (positions.payroll.x + positions.expense.x) / 2, y: (positions.payroll.y + positions.expense.y) / 2 },
            { name: 'Justworks', category: 'finance', template: 'gradient', x: positions.hris.x, y: positions.hris.y + 20 }
        ];
        
        intersectionCompanies.forEach(company => {
            const card = {
                id: ++this.cardIdCounter,
                company: company.name,
                category: company.category,
                template: company.template,
                x: company.x,
                y: company.y,
                logoUrl: this.generateLogoUrl(company.name),
                logoLoaded: false,
                logoImage: null,
                isPortfolio: true // Intersection companies are often portfolio
            };
            
            this.loadCardLogo(card);
            this.cards.push(card);
        });
    }
    
    // Generate logo URL for company
    generateLogoUrl(companyName) {
        const name = companyName.toLowerCase().replace(/\s+/g, '');
        
        // Try multiple logo sources
        const logoSources = [
            `https://logo.clearbit.com/${name}.com`,
            `https://img.logo.dev/${name}.com?token=pk_-rKmAgEhQ6a4OBxJEmx3LQ`,
            `https://cdn.brandfetch.io/${name}.com/w/256/h/256`,
            `https://logo.uplead.com/${name}.com`,
            // Fallback to major logo databases
            `https://logos-world.net/wp-content/uploads/2021/04/${name}-Logo.png`,
            `https://1000logos.net/wp-content/uploads/2021/04/${name}-logo.png`
        ];
        
        return logoSources[0]; // Start with Clearbit as it's most reliable
    }
    
    // Enhanced logo loading with fallbacks
    async loadCardLogo(card) {
        if (!card.logoUrl) {
            card.logoUrl = this.generateLogoUrl(card.company);
        }
        
        // Check cache first
        if (this.logoCache.has(card.logoUrl)) {
            const cachedLogo = this.logoCache.get(card.logoUrl);
            if (cachedLogo) {
                card.logoImage = cachedLogo;
                card.logoLoaded = true;
                this.redraw();
            }
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            card.logoImage = img;
            card.logoLoaded = true;
            this.logoCache.set(card.logoUrl, img);
            this.redraw();
        };
        
        img.onerror = () => {
            // Try fallback URLs
            this.tryLogoFallbacks(card, 0);
        };
        
        img.src = card.logoUrl;
    }
    
    // Try fallback logo sources
    tryLogoFallbacks(card, fallbackIndex) {
        const name = card.company.toLowerCase().replace(/\s+/g, '');
        const fallbackSources = [
            `https://img.logo.dev/${name}.com?token=pk_-rKmAgEhQ6a4OBxJEmx3LQ`,
            `https://cdn.brandfetch.io/${name}.com/w/256/h/256`,
            `https://logo.uplead.com/${name}.com`,
            // Try common domain variations
            `https://logo.clearbit.com/${name}.io`,
            `https://logo.clearbit.com/${name}.co`,
            `https://logo.clearbit.com/get${name}.com`,
            // Generate generic logo
            `https://ui-avatars.com/api/?name=${encodeURIComponent(card.company)}&size=256&background=667eea&color=ffffff&bold=true`
        ];
        
        if (fallbackIndex >= fallbackSources.length) {
            // All fallbacks failed, use initials
            card.logoLoaded = false;
            card.logoImage = null;
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            card.logoImage = img;
            card.logoLoaded = true;
            this.logoCache.set(card.logoUrl, img);
            this.redraw();
        };
        
        img.onerror = () => {
            this.tryLogoFallbacks(card, fallbackIndex + 1);
        };
        
        img.src = fallbackSources[fallbackIndex];
        card.logoUrl = fallbackSources[fallbackIndex];
    }
    
    // Method to clear canvas and repopulate
    clearAndPopulate() {
        this.cards = [];
        this.selectedCards = [];
        this.cardIdCounter = 0;
        this.populateCanvas();
    }
}

// Context menu methods
function editCard() {
    if (app.contextCard) {
        console.log('Edit card:', app.contextCard);
    }
    app.hideContextMenu();
}

function duplicateCard() {
    if (app.contextCard) {
        const newCard = {
            ...app.contextCard,
            id: app.cardIdCounter++,
            x: app.contextCard.x + 80,
            y: app.contextCard.y + 20,
            company: app.contextCard.company + ' Copy'
        };
        
        app.cards.push(newCard);
        app.selectedCards = [newCard];
        app.updateCardsGrid();
        app.redraw();
        app.saveToStorage();
        app.showNotification(`Duplicated ${app.contextCard.company}`, 'success');
    }
    app.hideContextMenu();
}

function bringToFront() {
    if (app.contextCard) {
        const index = app.cards.indexOf(app.contextCard);
        if (index !== -1) {
            app.cards.splice(index, 1);
            app.cards.push(app.contextCard);
            app.redraw();
            app.saveToStorage();
        }
    }
    app.hideContextMenu();
}

function sendToBack() {
    if (app.contextCard) {
        const index = app.cards.indexOf(app.contextCard);
        if (index !== -1) {
            app.cards.splice(index, 1);
            app.cards.unshift(app.contextCard);
            app.redraw();
            app.saveToStorage();
        }
    }
    app.hideContextMenu();
}

function deleteCardFromContext() {
    if (app.contextCard) {
        app.deleteCard(app.contextCard.id);
    }
    app.hideContextMenu();
}

// Global functions
function openAddCardModal() {
    const modal = document.getElementById('addCardModal');
    if (modal) {
        modal.classList.add('show');
        setTimeout(() => {
            const input = document.getElementById('companyName');
            if (input) input.focus();
        }, 300);
    }
}

function openSettingsModal() {
    app.updateCardsGrid();
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('show');
}

function openTemplatesModal() {
    const modal = document.getElementById('templatesModal');
    if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function exportCanvas() {
    app.exportCanvas();
}

function toggleGrid() {
    app.toggleGrid();
}

function addBusinessCard() {
    app.addBusinessCard();
}

function deleteCard(id) {
    app.deleteCard(id);
}

function editCard(id) {
    console.log('Edit card:', id);
}

function toggleCircles() {
    app.toggleCircles();
}

function setOptimalSpacing() {
    app.setOptimalSpacing();
}

function selectAllCards() {
    app.selectAllCards();
}

function deselectAllCards() {
    app.deselectAllCards();
}

function clearAllCards() {
    app.clearAllCards();
}

function alignLeft() {
    app.alignLeft();
}

function alignCenter() {
    app.alignCenter();
}

function alignRight() {
    app.alignRight();
}

function distributeHorizontal() {
    app.distributeHorizontal();
}

function distributeVertical() {
    app.distributeVertical();
}

function deleteSelected() {
    app.deleteSelected();
}

function populateCanvas() {
    app.populateCanvas();
}

function clearAndPopulate() {
    app.clearAndPopulate();
}

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BusinessCardCanvas();
});

// Handle modal click-outside-to-close
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Handle checkbox changes
document.addEventListener('change', (e) => {
    if (e.target.id === 'snapToGrid') {
        app.snapToGrid = e.target.checked;
        app.saveToStorage();
    } else if (e.target.id === 'showGrid') {
        app.showGrid = e.target.checked;
        app.redraw();
        app.saveToStorage();
    } else if (e.target.id === 'showGuides') {
        app.showGuides = e.target.checked;
        app.redraw();
        app.saveToStorage();
    }
}); 