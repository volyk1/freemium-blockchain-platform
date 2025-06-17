export class RFMDAnalysis {
  constructor(transactions) {
    this.transactions = transactions;
    this.now = Date.now();
  }

  calculateMetrics() {
    if (!this.transactions.length) {
      return {
        recency: 0,
        frequency: 0,
        monetary: 0,
        diversity: 0
      };
    }

    // Recency - days since last purchase (normalized to 0-1)
    const lastPurchaseDate = Math.max(...this.transactions.map(t => t.timestamp));
    const daysSinceLastPurchase = (this.now - lastPurchaseDate) / (1000 * 60 * 60 * 24);
    const recency = Math.max(0, 1 - (daysSinceLastPurchase / 365)); // Normalize to 1 year

    // Frequency - number of transactions (normalized to 0-1)
    const frequency = Math.min(1, this.transactions.length / 10); // Normalize to 10 transactions

    // Monetary - total spent (normalized to 0-1)
    const totalSpent = this.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const monetary = Math.min(1, totalSpent / 5); // Normalize to 5 ETH

    // Diversity - unique products purchased (normalized to 0-1)
    const uniqueProducts = new Set(
      this.transactions.flatMap(t => t.products.map(p => p.name))
    ).size;
    const diversity = Math.min(1, uniqueProducts / 6); // Normalize to 6 products

    return {
      recency,
      frequency,
      monetary,
      diversity
    };
  }

  calculateCohort() {
    const metrics = this.calculateMetrics();
    const score = (
      metrics.recency * 0.3 + 
      metrics.frequency * 0.25 + 
      metrics.monetary * 0.25 + 
      metrics.diversity * 0.2
    );

    if (score >= 0.8) return 'PREMIUM';
    if (score >= 0.6) return 'GOLD';
    if (score >= 0.4) return 'SILVER';
    if (score >= 0.2) return 'BRONZE';
    return 'STANDARD';
  }

  calculateDiscount() {
    const cohort = this.calculateCohort();
    const discounts = {
      'PREMIUM': 0.25, // 25% discount
      'GOLD': 0.20,    // 20% discount
      'SILVER': 0.15,  // 15% discount
      'BRONZE': 0.10,  // 10% discount
      'STANDARD': 0.05 // 5% discount
    };
    return discounts[cohort];
  }
}


