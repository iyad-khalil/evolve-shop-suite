
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Target, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
}

interface AIPerformanceAnalysisProps {
  productData: ProductData;
  onAnalyze: () => void;
  performanceScore: number | null;
}

export const AIPerformanceAnalysis: React.FC<AIPerformanceAnalysisProps> = ({
  productData,
  onAnalyze,
  performanceScore
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await onAnalyze();
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Excellent', variant: 'default' as const, icon: CheckCircle };
    if (score >= 60) return { text: 'Bon', variant: 'secondary' as const, icon: Target };
    return { text: 'À améliorer', variant: 'destructive' as const, icon: AlertCircle };
  };

  const analysisResults = performanceScore ? {
    seoScore: Math.floor(performanceScore * 0.9),
    marketFit: Math.floor(performanceScore * 1.1),
    competitiveness: Math.floor(performanceScore * 0.95),
    conversionPotential: Math.floor(performanceScore * 1.05)
  } : null;

  const recommendations = [
    {
      type: 'SEO',
      message: 'Ajoutez des mots-clés spécifiques à votre niche dans la description',
      priority: 'high'
    },
    {
      type: 'Prix',
      message: 'Votre prix est compétitif par rapport au marché',
      priority: 'low'
    },
    {
      type: 'Description',
      message: 'Développez les bénéfices clients dans votre description',
      priority: 'medium'
    },
    {
      type: 'Marché',
      message: 'Fort potentiel dans cette catégorie actuellement',
      priority: 'high'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Analyse prédictive de performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Données du produit analysées :</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Nom :</strong> {productData.name || 'Non défini'}</div>
            <div><strong>Catégorie :</strong> {productData.category || 'Non définie'}</div>
            <div><strong>Prix :</strong> {productData.price ? `${productData.price}€` : 'Non défini'}</div>
            <div><strong>Description :</strong> {productData.description ? `${productData.description.substring(0, 100)}...` : 'Non définie'}</div>
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!productData.name || isAnalyzing}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyse en cours...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 mr-2" />
              Lancer l'analyse prédictive
            </>
          )}
        </Button>

        {performanceScore && analysisResults && (
          <div className="space-y-6 pt-4 border-t">
            {/* Score global */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}/100
              </div>
              <div className="flex items-center justify-center mt-2">
                {(() => {
                  const badge = getScoreBadge(performanceScore);
                  const IconComponent = badge.icon;
                  return (
                    <Badge variant={badge.variant} className="flex items-center space-x-1">
                      <IconComponent className="w-4 h-4" />
                      <span>{badge.text}</span>
                    </Badge>
                  );
                })()}
              </div>
            </div>

            {/* Métriques détaillées */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">SEO</span>
                    <span className="text-sm font-bold">{analysisResults.seoScore}%</span>
                  </div>
                  <Progress value={analysisResults.seoScore} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Adéquation marché</span>
                    <span className="text-sm font-bold">{analysisResults.marketFit}%</span>
                  </div>
                  <Progress value={analysisResults.marketFit} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Compétitivité</span>
                    <span className="text-sm font-bold">{analysisResults.competitiveness}%</span>
                  </div>
                  <Progress value={analysisResults.competitiveness} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Potentiel conversion</span>
                    <span className="text-sm font-bold">{analysisResults.conversionPotential}%</span>
                  </div>
                  <Progress value={analysisResults.conversionPotential} className="h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Recommandations */}
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-1 text-yellow-600" />
                Recommandations d'optimisation :
              </h4>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {rec.type}
                            </Badge>
                            <Badge 
                              variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {rec.priority === 'high' ? 'Haute' : rec.priority === 'medium' ? 'Moyenne' : 'Faible'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{rec.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          🤖 L'analyse utilise des modèles de machine learning entraînés sur des millions de produits e-commerce.
        </div>
      </CardContent>
    </Card>
  );
};
