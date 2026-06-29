# RedBeardGPT Node ROI Calculator

RedBeardGPT Node ROI Calculator is an economic modeling tool designed for assessing the Return on Investment (ROI) of local GPU clusters and hybrid compute rental nodes.

## Features

- **Hardware Selection:** Choose from a list of predefined compute nodes (e.g., RTX 4090, RTX 6000 Ada, dual setups) to see system specifications and VRAM availability.
- **CapEx & OpEx Modeling:** Configure Capital Expenditure (CapEx) for your system components and GPU, alongside Operational Expenditure (OpEx) inputs like electricity rates, and power draw (load vs. idle).
- **Market Rates & Utilization:** Estimate net rental rates and adjust node occupancy across different operational models:
  - **Scenario A (Dedicated 24/7 Hosting):** High occupancy for non-stop compute availability.
  - **Scenario B (Hybrid Nightly):** Fractional usage during off-hours, providing flexibility.
- **Daytime Revenue & Savings:** Account for personal AI subscription savings or revenue from friends and family access.
- **Dynamic Node Capabilities:** Uses a built-in algorithm to estimate the optimal model size and context window that fits within the selected node's VRAM constraints, and suggests top open-source models (e.g., Llama 3, Gemma, DeepSeek, Qwen).
- **Interactive Financial Visualizations:** View a cumulative cash flow chart over a 5-year period for both dedicated and hybrid scenarios, helping you visualize the payback period and 5-Year ROI.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide React for icons
- **Charts:** Recharts for dynamic data visualization
- **Linting:** Oxlint for fast, modern code linting

## Getting Started

### Prerequisites

- Node.js (version 18+ recommended)
- npm or an equivalent package manager

### Installation

1. Clone the repository and navigate into the project directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Development

To start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

### Building for Production

To build the application for production:

```bash
npm run build
```
This command runs the TypeScript compiler and uses Vite to bundle the application into the `dist` folder.

### Linting

To run the linter and ensure code quality:

```bash
npm run lint
```

## Preview

After building, you can preview the production build locally:

```bash
npm run preview
```
