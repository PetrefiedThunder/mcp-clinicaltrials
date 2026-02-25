#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "https://clinicaltrials.gov/api/v2";
const USER_AGENT = "mcp-clinicaltrials/1.0.0 (https://github.com/PetrefiedThunder/mcp-clinicaltrials)";
const RATE_LIMIT_MS = 500;

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<any> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ClinicalTrials.gov API error: ${res.status} ${res.statusText} — ${body.slice(0, 500)}`);
  }
  return res.json();
}

const server = new McpServer({
  name: "mcp-clinicaltrials",
  version: "1.0.0",
});

server.tool(
  "search_studies",
  "Search ClinicalTrials.gov for clinical studies by condition, intervention, or keyword.",
  {
    query: z.string().describe("Search terms (condition, drug, keyword)"),
    status: z.enum([
      "RECRUITING", "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING",
      "COMPLETED", "TERMINATED", "WITHDRAWN", "SUSPENDED",
      "ENROLLING_BY_INVITATION", "UNKNOWN",
    ]).optional().describe("Filter by study status"),
    phase: z.enum(["EARLY_PHASE1", "PHASE1", "PHASE2", "PHASE3", "PHASE4", "NA"]).optional(),
    studyType: z.enum(["INTERVENTIONAL", "OBSERVATIONAL", "EXPANDED_ACCESS"]).optional(),
    pageSize: z.number().min(1).max(100).default(10),
    pageToken: z.string().optional().describe("Token for next page of results"),
  },
  async ({ query, status, phase, studyType, pageSize, pageToken }) => {
    const params = new URLSearchParams({
      "query.term": query,
      pageSize: String(pageSize),
      format: "json",
    });
    if (status) params.set("filter.overallStatus", status);
    if (phase) params.set("filter.phase", phase);
    if (studyType) params.set("filter.studyType", studyType);
    if (pageToken) params.set("pageToken", pageToken);

    const data = await rateLimitedFetch(`${BASE_URL}/studies?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_study",
  "Get detailed information about a specific clinical study by NCT ID.",
  {
    nctId: z.string().describe("NCT identifier (e.g. 'NCT05678901')"),
  },
  async ({ nctId }) => {
    const cleanId = nctId.toUpperCase().trim();
    const data = await rateLimitedFetch(`${BASE_URL}/studies/${cleanId}?format=json`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_study_results",
  "Get results/outcomes for a completed clinical study.",
  {
    nctId: z.string().describe("NCT identifier"),
  },
  async ({ nctId }) => {
    const cleanId = nctId.toUpperCase().trim();
    // Results are part of the full study record
    const data = await rateLimitedFetch(
      `${BASE_URL}/studies/${cleanId}?format=json&fields=resultsSection`
    );
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "search_by_location",
  "Search clinical trials by geographic location.",
  {
    query: z.string().describe("Search terms (condition, drug)"),
    locationStr: z.string().describe("Location (city, state, or country)"),
    distance: z.string().optional().describe("Distance from location (e.g. '50mi')"),
    status: z.enum([
      "RECRUITING", "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING",
      "COMPLETED", "ENROLLING_BY_INVITATION",
    ]).optional(),
    pageSize: z.number().min(1).max(100).default(10),
  },
  async ({ query, locationStr, distance, status, pageSize }) => {
    const params = new URLSearchParams({
      "query.term": query,
      "query.locn": distance ? `${locationStr},${distance}` : locationStr,
      pageSize: String(pageSize),
      format: "json",
    });
    if (status) params.set("filter.overallStatus", status);

    const data = await rateLimitedFetch(`${BASE_URL}/studies?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_study_sizes",
  "Get aggregate statistics about studies matching a query (counts by status, phase, etc.).",
  {
    query: z.string().describe("Search terms"),
  },
  async ({ query }) => {
    const params = new URLSearchParams({
      "query.term": query,
      countTotal: "true",
      pageSize: "1",
      format: "json",
    });

    const data = await rateLimitedFetch(`${BASE_URL}/studies?${params}`);
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ totalCount: data.totalCount, nextPageToken: data.nextPageToken }, null, 2),
      }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
