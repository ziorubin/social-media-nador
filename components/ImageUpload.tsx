import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageUploadProps {
  selectedImage: ImageFile | null;
  onImageSelect: (image: ImageFile | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ selectedImage, onImageSelect }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix to get raw base64
        const base64Data = base64String.split(',')[1];
        
        onImageSelect({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: base64Data
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleClear = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.previewUrl);
      onImageSelect(null);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Visual Asset
      </label>
      
      {!selectedImage ? (
        <div className="relative group">
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 transition-all duration-300 ease-in-out group-hover:border-indigo-500 group-hover:bg-slate-800/50 bg-slate-800/20 text-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-slate-700 rounded-full group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
                <Upload size={24} />
              </div>
              <div className="text-sm text-slate-400">
                <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-600 shadow-lg group">
          <img
            src={selectedImage.previewUrl}
            alt="Preview"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleClear}
              className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-transform transform hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 flex items-center space-x-2 text-xs text-white">
            <ImageIcon size={14} />
            <span className="truncate">{selectedImage.file.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
