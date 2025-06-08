# Business Card Canvas - Executive Edition

A sophisticated, modern web application for creating, managing, and visualizing business card layouts using a scalable canvas-based interface with an Executive dark theme.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd business-card-canvas

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Netlify
npm run deploy
```

## 🏗️ Modern Architecture

This project follows modern web development best practices with a scalable, modular architecture:

### Project Structure
```
business-card-canvas/
├── src/
│   ├── js/
│   │   ├── core/           # Core canvas functionality
│   │   │   └── Canvas.js
│   │   ├── components/     # UI components
│   │   │   └── UIManager.js
│   │   ├── services/       # Business logic
│   │   │   └── CardService.js
│   │   └── main.js        # Application entry point
│   ├── css/
│   │   ├── base/          # Reset, variables
│   │   ├── components/    # Component styles
│   │   ├── themes/        # Theme-specific styles
│   │   └── main.css       # Main stylesheet
│   └── assets/            # Images, icons
├── dist/                  # Built files (generated)
├── index.html            # Modern HTML5 entry point
├── package.json          # Dependencies and scripts
├── vite.config.js        # Build configuration
├── netlify.toml          # Deployment configuration
└── README.md
```

## ✨ Features

### Core Functionality
- **Executive Theme**: Professional dark theme with premium styling
- **Canvas-based Rendering**: High-performance HTML5 canvas with HiDPI support
- **Free-form Positioning**: Place cards anywhere on the canvas (no grid constraints)
- **Dynamic Card Sizing**: Adjustable card sizes from 40px to 150px
- **2x Export Resolution**: High-quality exports with automatic 2x scaling
- **Instant Resize**: Canvas automatically adjusts to window size changes

### Business Card Management
- **30+ Pre-loaded Companies**: HRIS, Payroll, and Expense management companies
- **Intelligent Logo Fetching**: Multiple API fallbacks (Clearbit, Logo.dev, UI Avatars)
- **Category-based Organization**: Color-coded categories with visual indicators
- **Drag & Drop Interface**: Intuitive card manipulation with visual feedback
- **Context Menu Actions**: Right-click for edit, duplicate, and delete options

### User Experience
- **Professional Notifications**: Toast-style notifications with animations
- **Keyboard Shortcuts**: Ctrl+A (select all), Ctrl+E (export), Delete (remove selected)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Local Storage**: Automatic saving and restoration of canvas state

## 🛠️ Technology Stack

### Frontend
- **ES6+ Modules**: Modern JavaScript with class-based architecture
- **HTML5 Canvas**: High-performance rendering with device pixel ratio support
- **CSS Custom Properties**: Scalable design system with CSS variables
- **Web APIs**: Local Storage, Canvas 2D, Intersection Observer

### Build Tools
- **Vite**: Lightning-fast development server and build tool
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automatic code formatting
- **PostCSS**: CSS processing and optimization

### Deployment
- **Netlify**: Continuous deployment with build optimization
- **Git-based Workflow**: Automatic deployments from repository updates

## 🎨 Design System

### Executive Theme
- **Color Palette**: Professional dark grays with blue accents
- **Typography**: Inter font family with multiple weights
- **Spacing**: Consistent 8px grid system
- **Shadows**: Layered depth with multiple shadow levels
- **Animations**: Smooth transitions with cubic-bezier easing

### Component Architecture
- **Modular CSS**: Organized by base, components, and themes
- **BEM Methodology**: Consistent naming conventions
- **CSS Variables**: Dynamic theming and easy customization
- **Responsive Breakpoints**: Mobile-first design approach

## 🚀 Development

### Prerequisites
- Node.js 16+ and npm
- Modern browser with ES6+ support
- Git for version control

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Run linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
- **ESLint Configuration**: Enforces modern JavaScript standards
- **Prettier Integration**: Automatic code formatting on save
- **Module System**: ES6 imports/exports for better dependency management
- **Error Handling**: Comprehensive error boundaries and logging

## 📱 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🔧 Configuration

### Environment Variables
```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

### Vite Configuration
The project uses Vite for development and building. Configuration is in `vite.config.js`:
- Hot Module Replacement (HMR)
- Asset optimization
- ES6+ transpilation
- CSS preprocessing

## 📦 Deployment

### Netlify (Recommended)
1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on git push

### Manual Deployment
```bash
# Build the project
npm run build

# Upload the dist/ folder to your hosting provider
```

## 🎯 Performance

### Optimizations
- **Canvas Rendering**: Efficient drawing with minimal redraws
- **Image Caching**: Logo images cached in memory
- **Debounced Events**: Optimized resize and input handling
- **Lazy Loading**: Components loaded on demand
- **Bundle Splitting**: Optimized JavaScript chunks

### Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Bundle Size**: < 100KB gzipped
- **Lighthouse Score**: 95+ across all categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write semantic commit messages
- Add JSDoc comments for public APIs
- Test across multiple browsers
- Maintain responsive design principles

## 📄 License

MIT License - Feel free to use for any purpose!

## 🙏 Acknowledgments

- **Inter Font**: Beautiful typography by Rasmus Andersson
- **Font Awesome**: Comprehensive icon library
- **Vite**: Next-generation frontend tooling
- **Netlify**: Seamless deployment platform

---

**Built with ❤️ by Andrey Cretsu** 