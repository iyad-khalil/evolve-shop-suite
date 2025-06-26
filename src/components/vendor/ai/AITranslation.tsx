
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Languages, Globe, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Translation {
  language: string;
  code: string;
  text: string;
}

interface AITranslationProps {
  originalText: string;
  onTranslationComplete: (translations: Translation[]) => void;
}

export const AITranslation: React.FC<AITranslationProps> = ({
  originalText,
  onTranslationComplete
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const targetLanguages = [
    { name: 'Anglais', code: 'en', flag: '🇺🇸' },
    { name: 'Espagnol', code: 'es', flag: '🇪🇸' },
    { name: 'Italien', code: 'it', flag: '🇮🇹' },
    { name: 'Allemand', code: 'de', flag: '🇩🇪' },
    { name: 'Portugais', code: 'pt', flag: '🇵🇹' },
    { name: 'Chinois', code: 'zh', flag: '🇨🇳' },
    { name: 'Japonais', code: 'ja', flag: '🇯🇵' },
    { name: 'Arabe', code: 'ar', flag: '🇸🇦' }
  ];

  const handleTranslate = async () => {
    if (!originalText.trim()) {
      toast.error('Veuillez d\'abord saisir une description');
      return;
    }

    setIsTranslating(true);
    try {
      // Simulation de traduction IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockTranslations: Translation[] = targetLanguages.map(lang => ({
        language: lang.name,
        code: lang.code,
        text: `[${lang.flag} ${lang.name}] ${originalText} - Traduction automatique générée par IA`
      }));

      setTranslations(mockTranslations);
      onTranslationComplete(mockTranslations);
      toast.success('Traductions générées avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copié dans le presse-papier !');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Languages className="w-5 h-5 text-blue-600" />
          <span>Traduction automatique</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Texte original (Français)
          </label>
          <Textarea
            value={originalText}
            readOnly
            placeholder="La description sera automatiquement récupérée..."
            className="min-h-[80px] bg-gray-50"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center">
            <Globe className="w-4 h-4 mr-1" />
            Langues cibles ({targetLanguages.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {targetLanguages.map((lang) => (
              <Badge key={lang.code} variant="outline">
                {lang.flag} {lang.name}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleTranslate}
          disabled={!originalText.trim() || isTranslating}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
        >
          {isTranslating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Traduction en cours...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-2" />
              Traduire en {targetLanguages.length} langues
            </>
          )}
        </Button>

        {translations.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-gray-900">Traductions générées :</h4>
            {translations.map((translation, index) => (
              <Card key={translation.code} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                      {translation.language}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(translation.text, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700">{translation.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          🌍 Les traductions sont optimisées pour chaque marché local et incluent les termes de recherche populaires.
        </div>
      </CardContent>
    </Card>
  );
};
