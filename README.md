# mcp-clinicaltrials

Search ClinicalTrials.gov for clinical studies, interventions, and outcomes.

> **Free API** — No API key required.

## Tools

| Tool | Description |
|------|-------------|
| `search_studies` | Search ClinicalTrials.gov for clinical studies by condition, intervention, or keyword. |
| `get_study` | Get detailed information about a specific clinical study by NCT ID. |
| `get_study_results` | Get results/outcomes for a completed clinical study. |
| `search_by_location` | Search clinical trials by geographic location. |
| `get_study_sizes` | Get aggregate statistics about studies matching a query (counts by status, phase, etc.). |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-clinicaltrials.git
cd mcp-clinicaltrials
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "clinicaltrials": {
      "command": "node",
      "args": ["/path/to/mcp-clinicaltrials/dist/index.js"]
    }
  }
}
```

## Usage with npx

```bash
npx mcp-clinicaltrials
```

## License

Apache-2.0
