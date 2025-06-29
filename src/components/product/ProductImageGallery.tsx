
import React from 'react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedImage: number;
  onImageSelect: (index: number) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  selectedImage,
  onImageSelect
}) => {
  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg border w-80 h-80">
        <img
          src={images[selectedImage] || images[0]}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
      {images && images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onImageSelect(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${
                selectedImage === index ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
