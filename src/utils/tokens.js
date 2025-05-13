// Estimate tokens: 1 token ≈ 4 characters
export function estimateTokens(text) {
  return Math.ceil((text || "").length / 4);
}
