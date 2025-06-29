
import { Product, CartItem } from '@/types';

export interface UserBehavior {
  userId: string;
  productId: string;
  action: 'view' | 'cart' | 'purchase';
  timestamp: Date;
  rating?: number;
}

export interface ProductSimilarity {
  productId1: string;
  productId2: string;
  similarity: number;
}

export class MLRecommendationEngine {
  private userBehaviors: UserBehavior[] = [];
  private productSimilarities: Map<string, ProductSimilarity[]> = new Map();

  // Calcul de similarité basé sur le contenu (tags, catégorie, prix)
  calculateContentSimilarity(product1: Product, product2: Product): number {
    let similarity = 0;
    let factors = 0;

    // Similarité de catégorie (poids: 40%)
    if (product1.category_id === product2.category_id) {
      similarity += 0.4;
    }
    factors += 0.4;

    // Similarité de prix (poids: 30%)
    const priceDiff = Math.abs(product1.price - product2.price);
    const maxPrice = Math.max(product1.price, product2.price);
    const priceRatio = 1 - (priceDiff / maxPrice);
    similarity += priceRatio * 0.3;
    factors += 0.3;

    // Similarité des tags (poids: 30%)
    const commonTags = product1.tags?.filter(tag => 
      product2.tags?.includes(tag)
    ) || [];
    const totalTags = new Set([...(product1.tags || []), ...(product2.tags || [])]).size;
    if (totalTags > 0) {
      const tagSimilarity = commonTags.length / totalTags;
      similarity += tagSimilarity * 0.3;
    }
    factors += 0.3;

    return similarity / factors;
  }

  // Calcul de similarité collaborative (basé sur les comportements utilisateurs)
  calculateCollaborativeSimilarity(product1Id: string, product2Id: string): number {
    const users1 = this.getUsersWhoInteractedWith(product1Id);
    const users2 = this.getUsersWhoInteractedWith(product2Id);
    
    if (users1.length === 0 || users2.length === 0) return 0;

    const intersection = users1.filter(user => users2.includes(user));
    const union = new Set([...users1, ...users2]);
    
    return intersection.length / union.size; // Jaccard similarity
  }

  private getUsersWhoInteractedWith(productId: string): string[] {
    return [...new Set(
      this.userBehaviors
        .filter(behavior => behavior.productId === productId)
        .map(behavior => behavior.userId)
    )];
  }

  // Système de scoring hybride
  calculateHybridScore(
    contentSimilarity: number,
    collaborativeSimilarity: number,
    product: Product
  ): number {
    const contentWeight = 0.6;
    const collaborativeWeight = 0.3;
    const popularityWeight = 0.1;

    // Score de popularité basé sur les avis et le stock
    const popularityScore = (product.rating / 5) * 0.7 + 
                           (product.reviews / 100) * 0.3;

    return (contentSimilarity * contentWeight) + 
           (collaborativeSimilarity * collaborativeWeight) + 
           (popularityScore * popularityWeight);
  }

  // Génération de recommandations avec ML (filtré par catégorie)
  generateMLRecommendations(
    cartItems: CartItem[],
    allProducts: Product[],
    userId?: string,
    limit: number = 6
  ): Product[] {
    console.log('MLRecommendationEngine: Generating ML recommendations for', cartItems.length, 'cart items');
    
    // Extraire les catégories des produits dans le panier
    const cartCategories = new Set(
      cartItems
        .map(item => item.product.category_id)
        .filter(categoryId => categoryId !== null && categoryId !== undefined)
    );

    console.log('MLRecommendationEngine: Cart categories:', Array.from(cartCategories));

    // Filtrer les produits candidats par catégorie
    const candidateProducts = allProducts.filter(product => 
      cartCategories.has(product.category_id) && 
      !cartItems.some(item => item.product.id === product.id)
    );

    console.log('MLRecommendationEngine: Candidate products after category filtering:', candidateProducts.length);

    const recommendations: Array<{ product: Product; score: number }> = [];
    
    // Pour chaque produit dans le panier
    for (const cartItem of cartItems) {
      const sourceProduct = cartItem.product;
      
      // Calculer les scores pour les produits candidats de la même catégorie
      for (const candidate of candidateProducts) {
        // Vérifier que le candidat est dans la même catégorie que le produit source
        if (candidate.category_id !== sourceProduct.category_id) {
          continue;
        }
        
        // Calculer les similarités
        const contentSim = this.calculateContentSimilarity(sourceProduct, candidate);
        const collaborativeSim = this.calculateCollaborativeSimilarity(
          sourceProduct.id, 
          candidate.id
        );
        
        // Score hybride
        const hybridScore = this.calculateHybridScore(
          contentSim,
          collaborativeSim,
          candidate
        );
        
        console.log(`MLRecommendationEngine: Product ${candidate.name} (${candidate.category}) - Content: ${contentSim.toFixed(3)}, Collaborative: ${collaborativeSim.toFixed(3)}, Hybrid: ${hybridScore.toFixed(3)}`);
        
        recommendations.push({
          product: candidate,
          score: hybridScore
        });
      }
    }
    
    // Supprimer les doublons et trier par score
    const uniqueRecommendations = recommendations
      .filter((rec, index, self) => 
        index === self.findIndex(r => r.product.id === rec.product.id)
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    console.log('MLRecommendationEngine: Top recommendations (same category):', 
      uniqueRecommendations.map(r => `${r.product.name} (${r.product.category}) - Score: ${r.score.toFixed(3)}`)
    );
    
    return uniqueRecommendations.map(rec => rec.product);
  }

  // Apprentissage à partir des comportements utilisateurs
  learnFromBehavior(behavior: UserBehavior) {
    this.userBehaviors.push(behavior);
    console.log('MLRecommendationEngine: Learning from behavior:', behavior);
  }

  // Mise à jour des similarités entre produits (à exécuter périodiquement)
  updateProductSimilarities(products: Product[]) {
    console.log('MLRecommendationEngine: Updating product similarities matrix');
    
    for (let i = 0; i < products.length; i++) {
      const similarities: ProductSimilarity[] = [];
      
      for (let j = 0; j < products.length; j++) {
        if (i !== j) {
          const contentSim = this.calculateContentSimilarity(products[i], products[j]);
          const collaborativeSim = this.calculateCollaborativeSimilarity(
            products[i].id, 
            products[j].id
          );
          
          similarities.push({
            productId1: products[i].id,
            productId2: products[j].id,
            similarity: (contentSim + collaborativeSim) / 2
          });
        }
      }
      
      // Trier par similarité et garder les top 10
      similarities.sort((a, b) => b.similarity - a.similarity);
      this.productSimilarities.set(products[i].id, similarities.slice(0, 10));
    }
  }
}

// Instance globale du moteur de recommandation
export const mlEngine = new MLRecommendationEngine();
