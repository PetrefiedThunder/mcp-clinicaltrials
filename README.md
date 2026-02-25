# mcp-clinicaltrials

MCP server for [ClinicalTrials.gov](https://clinicaltrials.gov) API v2. Search and retrieve clinical study data. No API key required.

## Tools

| Tool | Description |
|------|-------------|
| `search_studies` | Search by condition, drug, keyword with status/phase/type filters |
| `get_study` | Get full details for a study by NCT ID |
| `get_study_results` | Get outcomes/results for completed studies |
| `search_by_location` | Find trials near a geographic location |
| `get_study_sizes` | Get total count of matching studies |

## Install

```bash
npm install
npm run build
```

## Usage with Claude Desktop

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

## Examples

- Find recruiting cancer trials: `search_studies(query: "lung cancer", status: "RECRUITING")`
- Phase 3 diabetes trials: `search_studies(query: "diabetes", phase: "PHASE3")`
- Trials near LA: `search_by_location(query: "alzheimer", locationStr: "Los Angeles", distance: "50mi")`
- Study details: `get_study(nctId: "NCT05678901")`

## License

MIT
