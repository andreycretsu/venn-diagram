/**
 * CardService - Handles business card data management and business logic
 */
export class CardService {
  constructor() {
    this.cards = [];
    this.cardIdCounter = 1;
    this.logoCache = new Map();
    
    this.companyData = {
      hris: [
        'BambooHR', 'Workday', 'ADP', 'Namely', 'Rippling',
        'Lattice', 'Culture Amp', 'BreatheHR', 'Personio', 'HiBob'
      ],
      payroll: [
        'Gusto', 'Justworks', 'Paychex', 'TriNet', 'Paylocity',
        'UKG', 'Remote', 'Deel', 'Sage', 'Zenefits'
      ],
      expense: [
        'Expensify', 'Ramp', 'Brex', 'Pleo', 'Spendesk',
        'Divvy', 'Concur', 'Coupa', 'Airbase', 'Mesh'
      ]
    };
  }

  /**
   * Create a new business card
   */
  createCard(data) {
    const card = {
      id: this.cardIdCounter++,
      company: data.company,
      category: data.category || 'technology',
      x: data.x || 0,
      y: data.y || 0,
      logoUrl: data.logoUrl || this.generateLogoUrl(data.company),
      logoLoaded: false,
      logoImage: null,
      isPortfolio: data.isPortfolio || false,
      created: new Date().toISOString()
    };

    this.cards.push(card);
    this.loadCardLogo(card);
    
    return card;
  }

  /**
   * Update an existing card
   */
  updateCard(id, updates) {
    const cardIndex = this.cards.findIndex(card => card.id === id);
    if (cardIndex === -1) return null;

    this.cards[cardIndex] = { ...this.cards[cardIndex], ...updates };
    return this.cards[cardIndex];
  }

  /**
   * Delete a card
   */
  deleteCard(id) {
    const cardIndex = this.cards.findIndex(card => card.id === id);
    if (cardIndex === -1) return false;

    this.cards.splice(cardIndex, 1);
    return true;
  }

  /**
   * Get all cards
   */
  getAllCards() {
    return [...this.cards];
  }

  /**
   * Get card by ID
   */
  getCard(id) {
    return this.cards.find(card => card.id === id);
  }

  /**
   * Clear all cards
   */
  clearAllCards() {
    this.cards = [];
    this.cardIdCounter = 1;
  }

  /**
   * Duplicate a card
   */
  duplicateCard(id) {
    const originalCard = this.getCard(id);
    if (!originalCard) return null;

    const duplicatedCard = {
      ...originalCard,
      id: this.cardIdCounter++,
      x: originalCard.x + 20,
      y: originalCard.y + 20,
      created: new Date().toISOString()
    };

    this.cards.push(duplicatedCard);
    return duplicatedCard;
  }

  /**
   * Populate canvas with predefined companies
   */
  populateWithCompanies(canvasWidth, canvasHeight, circleSettings) {
    this.clearAllCards();
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const { radius, spacing } = circleSettings;
    
    // Calculate Venn diagram positions
    const height = spacing * Math.sqrt(3) / 2;
    const positions = {
      hris: { x: centerX, y: centerY - height / 2 },
      payroll: { x: centerX - spacing / 2, y: centerY + height / 2 },
      expense: { x: centerX + spacing / 2, y: centerY + height / 2 }
    };

    let addedCount = 0;

    // Add companies to each category
    Object.entries(this.companyData).forEach(([category, companies]) => {
      const categoryCenter = positions[category];
      const companiesPerCategory = Math.min(companies.length, 8);
      
      companies.slice(0, companiesPerCategory).forEach((companyName, index) => {
        const angle = (index / companiesPerCategory) * 2 * Math.PI;
        const distance = radius * 0.6;
        const x = categoryCenter.x + Math.cos(angle) * distance;
        const y = categoryCenter.y + Math.sin(angle) * distance;
        
        this.createCard({
          company: companyName,
          category: this.getCategoryForCompany(category),
          x,
          y,
          isPortfolio: Math.random() > 0.7
        });
        
        addedCount++;
      });
    });

    return addedCount;
  }

  /**
   * Generate logo URL for a company
   */
  generateLogoUrl(companyName) {
    const cleanName = companyName.toLowerCase().replace(/\s+/g, '');
    const fallbacks = [
      `https://logo.clearbit.com/${cleanName}.com`,
      `https://img.logo.dev/${cleanName}.com?token=pk_X_YourTokenHere`,
      `https://logo.uplead.com/${cleanName}.com`,
      `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=128&background=1f2937&color=ffffff&bold=true`
    ];
    
    return fallbacks[0]; // Primary source
  }

  /**
   * Load logo for a card
   */
  async loadCardLogo(card) {
    if (this.logoCache.has(card.company)) {
      const cachedLogo = this.logoCache.get(card.company);
      card.logoImage = cachedLogo;
      card.logoLoaded = true;
      return true;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = () => {
        card.logoImage = img;
        card.logoLoaded = true;
        this.logoCache.set(card.company, img);
        resolve(true);
      };
      
      img.onerror = () => {
        this.tryLogoFallback(card, 1).then(resolve);
      };
      
      img.src = card.logoUrl;
    });
  }

  /**
   * Try fallback logo sources
   */
  async tryLogoFallback(card, fallbackIndex) {
    const fallbacks = [
      null, // Primary already tried
      `https://img.logo.dev/${card.company.toLowerCase().replace(/\s+/g, '')}.com?token=pk_fallback`,
      `https://logo.uplead.com/${card.company.toLowerCase().replace(/\s+/g, '')}.com`,
      `https://ui-avatars.com/api/?name=${encodeURIComponent(card.company)}&size=128&background=1f2937&color=ffffff&bold=true`
    ];

    if (fallbackIndex >= fallbacks.length) {
      card.logoLoaded = false;
      return false;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = () => {
        card.logoImage = img;
        card.logoLoaded = true;
        card.logoUrl = fallbacks[fallbackIndex];
        this.logoCache.set(card.company, img);
        resolve(true);
      };
      
      img.onerror = () => {
        this.tryLogoFallback(card, fallbackIndex + 1).then(resolve);
      };
      
      img.src = fallbacks[fallbackIndex];
    });
  }

  /**
   * Get category for company type
   */
  getCategoryForCompany(companyType) {
    const categoryMap = {
      hris: 'technology',
      payroll: 'finance',
      expense: 'finance'
    };
    
    return categoryMap[companyType] || 'technology';
  }

  /**
   * Export/Import functionality
   */
  exportData() {
    return {
      cards: this.cards,
      cardIdCounter: this.cardIdCounter,
      timestamp: new Date().toISOString()
    };
  }

  importData(data) {
    if (data.cards && Array.isArray(data.cards)) {
      this.cards = data.cards;
      this.cardIdCounter = data.cardIdCounter || this.cards.length + 1;
      
      // Reload logos for imported cards
      this.cards.forEach(card => {
        if (card.logoUrl) {
          this.loadCardLogo(card);
        }
      });
      
      return true;
    }
    return false;
  }

  /**
   * Search and filter cards
   */
  searchCards(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.cards.filter(card =>
      card.company.toLowerCase().includes(lowercaseQuery) ||
      card.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get cards by category
   */
  getCardsByCategory(category) {
    return this.cards.filter(card => card.category === category);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const categories = {};
    this.cards.forEach(card => {
      categories[card.category] = (categories[card.category] || 0) + 1;
    });

    return {
      totalCards: this.cards.length,
      categories,
      portfolioCompanies: this.cards.filter(card => card.isPortfolio).length,
      companiesWithLogos: this.cards.filter(card => card.logoLoaded).length
    };
  }
} 