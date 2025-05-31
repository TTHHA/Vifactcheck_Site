# ViFactCheck Leaderboard

A web application for tracking and displaying model performance on the ViFactCheck benchmark dataset for Vietnamese fact-checking.

## Features

- Real-time leaderboard for model performance tracking
- Support for both full context and gold evidence metrics
- Automatic sorting and ranking of submissions
- Support for both Node.js server and static GitHub Pages deployment
- File upload system for submitting results
- Responsive design for all devices

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vifactcheck.git
cd vifactcheck
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Deployment

The website is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment process:

1. Builds the static version of the site
2. Deploys to the `gh-pages` branch
3. Makes the site available at `https://yourusername.github.io/vifactcheck`

### Manual Deployment

To manually trigger a deployment:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Project Structure

```
vifactcheck/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow
├── image/                  # Image assets
├── index.html             # Main HTML file
├── script.js              # Client-side JavaScript
├── server.js              # Node.js server
├── server.static.js       # Static version for GitHub Pages
├── styles.css             # CSS styles
└── package.json           # Project configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- ViFactCheck Team
- University of Information Technology
- Vietnam National University, Ho Chi Minh City 