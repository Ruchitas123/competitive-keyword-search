/**
 * SEO Agent API Service
 * 
 * Backend Service Endpoints:
 * - GET  /health              - Health check
 * - GET  /api/products        - Get available products (Forms, Assets, Sites)
 * - POST /api/competitors     - Get competitors for a product
 * - POST /api/analyze         - Main: Analyze URL for keywords
 * - POST /api/rewrite-content - Rewrite content for SEO
 */

// Backend API Base URL
export const API_BASE_URL = 'http://127.0.0.1:8000'

/**
 * Health check
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`)
  return response.json()
}

/**
 * Get available products (Assets, Forms, Sites)
 */
export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`)
  return response.json()
}

/**
 * Get competitors for a product
 * @param {string} product - Product type (Assets, Forms, Sites)
 */
export async function getCompetitors(product) {
  const response = await fetch(`${API_BASE_URL}/api/competitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product })
  })
  return response.json()
}

/**
 * Main analysis: URL → Article Keywords, Competitor Keywords, Suggested Keywords
 * @param {string} url - URL to analyze
 * @param {string} product - Product type (Assets, Forms, Sites)
 * @param {string} timeRange - week, month, or year
 */
export async function analyzeUrl(url, product, timeRange = 'month') {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, product, time_range: timeRange })
  })
  return response.json()
}

/**
 * Rewrite content for SEO
 * @param {string} content - Original content
 * @param {string[]} targetKeywords - Keywords to optimize for (max 3)
 * @param {string} tone - professional, casual, technical
 */
export async function rewriteContent(content, targetKeywords, tone = 'professional') {
  const response = await fetch(`${API_BASE_URL}/api/rewrite-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, target_keywords: targetKeywords, tone })
  })
  return response.json()
}
