
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Trash2, Wand2, Scissors } from 'lucide-react';
import { toast } from 'sonner';

interface AIImageEnhancerProps {
  onImagesProcessed: (images: string[]) => void;
}

export const AIImageEnhancer: React.FC<AIImageEnhancerProps> = ({
  onImagesProcessed
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const newImages: string[] = [];
      
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} n'est pas une image valide`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} est trop volumineux (max 10MB)`);
          continue;
        }

        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push(imageUrl);
      }

      setUploadedImages([...uploadedImages, ...newImages]);
      toast.success(`${newImages.length} image(s) uploadée(s) avec succès !`);
    } catch (error) {
      toast.error('Erreur lors de l\'upload des images');
    }
  };

  const removeBackground = async (imageUrl: string) => {
    setIsProcessing(true);
    try {
      // Simulation de Remove.bg
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Pour la démo, on utilise une version modifiée de l'image
      const processedImageUrl = `${imageUrl}?bg=removed&timestamp=${Date.now()}`;
      
      const newProcessedImages = [...processedImages, processedImageUrl];
      setProcessedImages(newProcessedImages);
      onImagesProcessed(newProcessedImages);
      
      toast.success('Arrière-plan supprimé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'arrière-plan');
    } finally {
      setIsProcessing(false);
    }
  };

  const enhanceImage = async (imageUrl: string) => {
    setIsProcessing(true);
    try {
      // Simulation de l'amélioration d'image (Remini AI style)
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Pour la démo, on utilise une version améliorée de l'image
      const enhancedImageUrl = `${imageUrl}?enhanced=true&timestamp=${Date.now()}`;
      
      const newProcessedImages = [...processedImages, enhancedImageUrl];
      setProcessedImages(newProcessedImages);
      onImagesProcessed(newProcessedImages);
      
      toast.success('Image améliorée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'amélioration de l\'image');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image téléchargée !');
  };

  const removeImage = (imageUrl: string, isProcessed: boolean = false) => {
    if (isProcessed) {
      const newProcessedImages = processedImages.filter(url => url !== imageUrl);
      setProcessedImages(newProcessedImages);
      onImagesProcessed(newProcessedImages);
    } else {
      setUploadedImages(uploadedImages.filter(url => url !== imageUrl));
    }
    toast.success('Image supprimée');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <span>Retouche d'Images IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload & Traitement</TabsTrigger>
            <TabsTrigger value="results">Images Traitées</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Zone d'upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload-enhancer"
              />
              <label htmlFor="image-upload-enhancer" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Uploadez vos images à retoucher
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG (max 10MB par image)
                  </p>
                </div>
              </label>
            </div>

            {/* Images uploadées avec outils */}
            {uploadedImages.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Images à traiter :</h4>
                <div className="grid grid-cols-2 gap-4">
                  {uploadedImages.map((imageUrl, index) => (
                    <Card key={index} className="relative group">
                      <CardContent className="p-3">
                        <div className="aspect-square rounded overflow-hidden mb-3">
                          <img 
                            src={imageUrl} 
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Outils de retouche */}
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            onClick={() => removeBackground(imageUrl)}
                            disabled={isProcessing}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <Scissors className="w-3 h-3 mr-1" />
                            Supprimer fond
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => enhanceImage(imageUrl)}
                            disabled={isProcessing}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            Améliorer qualité
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(imageUrl)}
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isProcessing && (
                  <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-700">Traitement en cours...</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {processedImages.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Images traitées :</h4>
                <div className="grid grid-cols-2 gap-4">
                  {processedImages.map((imageUrl, index) => (
                    <Card key={index} className="relative group">
                      <CardContent className="p-3">
                        <div className="aspect-square rounded overflow-hidden mb-3">
                          <img 
                            src={imageUrl} 
                            alt={`Image traitée ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => downloadImage(imageUrl, `image-traitee-${index + 1}.png`)}
                            className="flex-1"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Télécharger
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(imageUrl, true)}
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wand2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune image traitée pour le moment</p>
                <p className="text-sm">Utilisez les outils de retouche pour traiter vos images</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-xs text-gray-500 mt-4 space-y-1">
          <p>🎨 <strong>Suppression de fond :</strong> Retire automatiquement l'arrière-plan pour un rendu professionnel</p>
          <p>✨ <strong>Amélioration qualité :</strong> Augmente la résolution et la netteté de vos images</p>
        </div>
      </CardContent>
    </Card>
  );
};
