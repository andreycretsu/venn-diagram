/**
 * Main Application Entry Point
 * Business Card Canvas - Executive Edition
 */

import { Canvas } from './core/Canvas.js';
import { CardService } from './services/CardService.js';
import { UIManager } from './components/UIManager.js';

/**
 * Main Application Class
 */
class BusinessCardApp {
  constructor() {
    this.version = '2.0.0';
    this.initialized = false;
    
    console.log(`🚀 Business Card Canvas v${this.version} - Executive Edition`);
    
    this.init();
  }

  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize core components
      this.initializeComponents();
      
      // Setup global error handling
      this.setupErrorHandling();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();
      
      this.initialized = true;
      console.log('✅ Application initialized successfully');
      
      // Show welcome message
      this.showWelcomeMessage();
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.showErrorMessage('Failed to initialize application');
    }
  }

  initializeComponents() {
    // Get canvas element
    const canvasElement = document.getElementById('canvas');
    if (!canvasElement) {
      throw new Error('Canvas element not found');
    }

    // Initialize services and components
    this.cardService = new CardService();
    this.canvas = new Canvas(canvasElement, {
      cardSize: 80,
      borderRadius: 12,
      exportScale: 2
    });
    this.uiManager = new UIManager(this.cardService, this.canvas);

    // Setup component communication
    this.setupComponentCommunication();
  }

  setupComponentCommunication() {
    // Canvas events
    this.canvas.on('cardUpdate', () => {
      this.uiManager.saveToStorage();
    });

    // Service events
    this.cardService.on = this.cardService.on || (() => {});
    
    // Global app events
    window.addEventListener('beforeunload', () => {
      this.uiManager.saveToStorage();
    });
  }

  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError(event.error);
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
    });
  }

  setupPerformanceMonitoring() {
    // Monitor canvas rendering performance
    let frameCount = 0;
    let lastTime = performance.now();
    
    const originalRender = this.canvas.render.bind(this.canvas);
    this.canvas.render = () => {
      const startTime = performance.now();
      originalRender();
      const endTime = performance.now();
      
      frameCount++;
      if (frameCount % 60 === 0) {
        const avgFrameTime = (endTime - lastTime) / 60;
        if (avgFrameTime > 16.67) { // More than 60fps
          console.warn(`⚠️ Rendering performance: ${avgFrameTime.toFixed(2)}ms avg frame time`);
        }
        lastTime = endTime;
      }
    };
  }

  handleError(error) {
    // Don't show error notifications for minor issues
    const minorErrors = [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured'
    ];

    const isMinorError = minorErrors.some(minor => 
      error.message && error.message.includes(minor)
    );

    if (!isMinorError && this.uiManager) {
      this.uiManager.showNotification(
        'An error occurred. Please refresh the page if issues persist.',
        'error'
      );
    }
  }

  showWelcomeMessage() {
    // Show subtle welcome notification
    setTimeout(() => {
      if (this.uiManager && this.cardService.getAllCards().length === 0) {
        this.uiManager.showNotification(
          'Welcome! Click "Populate with Companies" to get started or add cards manually.',
          'info'
        );
      }
    }, 1000);
  }

  showErrorMessage(message) {
    // Fallback error display if UI manager isn't available
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 16px;
      border-radius: 8px;
      z-index: 10000;
      font-family: system-ui, sans-serif;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Public API for debugging and extension
  getStats() {
    if (!this.initialized) return null;
    
    return {
      version: this.version,
      cards: this.cardService.getStatistics(),
      canvas: {
        width: this.canvas.canvas.clientWidth,
        height: this.canvas.canvas.clientHeight,
        selectedCards: this.canvas.selectedCards.length
      },
      performance: {
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
        } : 'Not available'
      }
    };
  }

  // Development helpers
  dev = {
    addTestCards: (count = 5) => {
      const testCompanies = ['TestCorp', 'DevCo', 'CodeInc', 'TechLtd', 'DataCorp'];
      const categories = ['technology', 'finance', 'healthcare'];
      
      for (let i = 0; i < count; i++) {
        this.cardService.createCard({
          company: testCompanies[i % testCompanies.length] + ` ${i + 1}`,
          category: categories[i % categories.length],
          x: 100 + (i * 100),
          y: 100 + (i * 50)
        });
      }
      
      this.canvas.setCards(this.cardService.getAllCards());
      console.log(`Added ${count} test cards`);
    },

    clearAll: () => {
      this.cardService.clearAllCards();
      this.canvas.setCards([]);
      console.log('Cleared all cards');
    },

    exportData: () => {
      const data = this.cardService.exportData();
      console.log('Export data:', data);
      return data;
    },

    importData: (data) => {
      const success = this.cardService.importData(data);
      if (success) {
        this.canvas.setCards(this.cardService.getAllCards());
        console.log('Data imported successfully');
      } else {
        console.error('Failed to import data');
      }
      return success;
    }
  };
}

// Initialize application
const app = new BusinessCardApp();

// Expose to global scope for debugging
if (typeof window !== 'undefined') {
  window.businessCardApp = app;
  
  // Development console helpers available
  console.log('🔧 Business Card Canvas v2.0.0 ready');
  console.log('📊 Use businessCardApp.getStats() to view application statistics');
}

export { BusinessCardApp }; 