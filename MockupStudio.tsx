import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  ShoppingBag,
  RotateCw,
  Maximize2,
  Move,
  Sparkles,
  Check,
  RefreshCw,
  Eye
} from 'lucide-react';
import { OFFICIAL_LOGO_PATH } from '../../lib/firebase';
import { useCart } from '../../context/CartContext';
import { CartItem } from '../../types';

type ProductMockupType = 't-shirt' | 'hoodie' | 'mug' | 'cap' | 'tote-bag';

interface ProductPreset {
  id: ProductMockupType;
  name: string;
  category: string;
  price: number;
  printArea: { x: number; y: number; width: number; height: number };
  aspectRatio: string;
}

const PRODUCTS: ProductPreset[] = [
  {
    id: 't-shirt',
    name: 'Heavyweight Streetwear T-Shirt',
    category: 'T-Shirts & Tops',
    price: 850,
    printArea: { x: 35, y: 30, width: 30, height: 35 },
    aspectRatio: '1/1'
  },
  {
    id: 'hoodie',
    name: 'Oversized Streetwear Fleece Hoodie',
    category: 'Hoodies & Sweatshirts',
    price: 1650,
    printArea: { x: 35, y: 36, width: 30, height: 32 },
    aspectRatio: '1/1'
  },
  {
    id: 'mug',
    name: 'Glossy Ceramic Coffee Mug (11oz)',
    category: 'Accessories & Merch',
    price: 450,
    printArea: { x: 28, y: 35, width: 35, height: 38 },
    aspectRatio: '1/1'
  },
  {
    id: 'cap',
    name: 'Structured Snapback Street Cap',
    category: 'Headwear',
    price: 650,
    printArea: { x: 38, y: 40, width: 24, height: 22 },
    aspectRatio: '1/1'
  },
  {
    id: 'tote-bag',
    name: 'Heavy Cotton Canvas Tote Bag',
    category: 'Bags & Accessories',
    price: 550,
    printArea: { x: 32, y: 40, width: 36, height: 35 },
    aspectRatio: '1/1'
  }
];

const COLOR_SWATCHES = [
  { name: 'Jet Black', hex: '#111111', textColor: '#ffffff' },
  { name: 'Crisp White', hex: '#ffffff', textColor: '#111111' },
  { name: 'Heather Gray', hex: '#4b5563', textColor: '#ffffff' },
  { name: 'Savage Crimson', hex: '#991b1b', textColor: '#ffffff' },
  { name: 'Khulna Olive', hex: '#374151', textColor: '#ffffff' },
  { name: 'Sand Cream', hex: '#e2d9c8', textColor: '#111111' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const MockupStudio: React.FC = () => {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<ProductPreset>(PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [logoImage, setLogoImage] = useState<string>(OFFICIAL_LOGO_PATH);
  const [logoScale, setLogoScale] = useState<number>(100);
  const [logoX, setLogoX] = useState<number>(0); // offset %
  const [logoY, setLogoY] = useState<number>(0); // offset %
  const [logoRotation, setLogoRotation] = useState<number>(0);
  const [blendMode, setBlendMode] = useState<'normal' | 'multiply'>('multiply');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle local user logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseOfficialLogo = () => {
    setLogoImage(OFFICIAL_LOGO_PATH);
    setLogoScale(100);
    setLogoX(0);
    setLogoY(0);
    setLogoRotation(0);
  };

  // Add customized mockup item to customer cart
  const handleAddToCart = () => {
    const cartItem: CartItem = {
      productId: `custom_${selectedProduct.id}_${Date.now()}`,
      name: `Custom Print: ${selectedProduct.name}`,
      slug: 'custom-merch',
      image: logoImage,
      price: selectedProduct.price,
      size: selectedProduct.id === 'mug' || selectedProduct.id === 'tote-bag' ? 'Standard' : selectedSize,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      quantity: 1,
      maxStock: 50,
      isCustomMockup: true,
      customMockupUrl: logoImage
    };

    addToCart(cartItem);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Export mockup as PNG
  const handleDownloadMockup = () => {
    setIsExporting(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `savage-${selectedProduct.id}-mockup.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsExporting(false);
  };

  // Render composite canvas mockup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Clean background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Subtle studio vignette
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 450);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(1, 'rgba(226, 232, 240, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Render Product Silhouette / Vector based on selection
    const renderSilhouette = () => {
      ctx.save();
      ctx.fillStyle = selectedColor.hex;
      ctx.strokeStyle = selectedColor.hex === '#ffffff' ? '#e2e8f0' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 2;

      // Soft product drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;

      if (selectedProduct.id === 't-shirt') {
        // T-Shirt Path
        ctx.beginPath();
        // Collar
        ctx.moveTo(330, 160);
        ctx.quadraticCurveTo(400, 210, 470, 160);
        // Right shoulder & sleeve
        ctx.lineTo(590, 230);
        ctx.lineTo(650, 340);
        ctx.lineTo(570, 380);
        ctx.lineTo(530, 310);
        // Right torso
        ctx.lineTo(530, 680);
        // Bottom hem
        ctx.quadraticCurveTo(400, 700, 270, 680);
        // Left torso
        ctx.lineTo(270, 310);
        // Left sleeve
        ctx.lineTo(230, 380);
        ctx.lineTo(150, 340);
        ctx.lineTo(210, 230);
        ctx.lineTo(330, 160);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Collar ring
        ctx.shadowColor = 'transparent';
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = selectedColor.hex === '#ffffff' ? '#cbd5e1' : 'rgba(0,0,0,0.25)';
        ctx.arc(400, 160, 70, 0.2 * Math.PI, 0.8 * Math.PI, false);
        ctx.stroke();

      } else if (selectedProduct.id === 'hoodie') {
        // Hoodie Path
        ctx.beginPath();
        // Hood
        ctx.moveTo(320, 180);
        ctx.quadraticCurveTo(400, 110, 480, 180);
        // Shoulders
        ctx.lineTo(600, 250);
        ctx.lineTo(660, 400);
        ctx.lineTo(580, 430);
        ctx.lineTo(540, 350);
        // Body
        ctx.lineTo(540, 690);
        ctx.lineTo(260, 690);
        ctx.lineTo(260, 350);
        ctx.lineTo(220, 430);
        ctx.lineTo(140, 400);
        ctx.lineTo(200, 250);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Kangaroo Pocket
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = selectedColor.hex === '#111111' ? '#18181b' : 'rgba(0,0,0,0.06)';
        ctx.beginPath();
        ctx.moveTo(310, 520);
        ctx.lineTo(490, 520);
        ctx.lineTo(510, 650);
        ctx.lineTo(290, 650);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else if (selectedProduct.id === 'mug') {
        // Coffee Mug Cylinder
        ctx.beginPath();
        ctx.roundRect(240, 240, 320, 380, [16, 16, 32, 32]);
        ctx.fill();
        ctx.stroke();

        // Mug Handle
        ctx.beginPath();
        ctx.lineWidth = 36;
        ctx.strokeStyle = selectedColor.hex;
        ctx.arc(570, 410, 80, -0.4 * Math.PI, 0.4 * Math.PI, false);
        ctx.stroke();

        // Rim highlight
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = selectedColor.hex === '#ffffff' ? '#e2e8f0' : 'rgba(255,255,255,0.2)';
        ctx.ellipse(400, 244, 156, 16, 0, 0, Math.PI * 2);
        ctx.stroke();

      } else if (selectedProduct.id === 'cap') {
        // Snapback Cap
        ctx.beginPath();
        // Crown dome
        ctx.moveTo(250, 430);
        ctx.quadraticCurveTo(270, 260, 400, 250);
        ctx.quadraticCurveTo(530, 260, 550, 430);
        // Visor Brim
        ctx.lineTo(630, 480);
        ctx.quadraticCurveTo(400, 550, 170, 480);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Seam stitch
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 2;
        ctx.moveTo(400, 250);
        ctx.lineTo(400, 440);
        ctx.stroke();

      } else if (selectedProduct.id === 'tote-bag') {
        // Tote Bag Body
        ctx.beginPath();
        ctx.roundRect(250, 290, 300, 390, 12);
        ctx.fill();
        ctx.stroke();

        // Handles
        ctx.shadowColor = 'transparent';
        ctx.beginPath();
        ctx.lineWidth = 20;
        ctx.strokeStyle = selectedColor.hex === '#ffffff' ? '#cbd5e1' : selectedColor.hex;
        ctx.moveTo(330, 290);
        ctx.lineTo(330, 170);
        ctx.quadraticCurveTo(400, 130, 470, 170);
        ctx.lineTo(470, 290);
        ctx.stroke();
      }

      ctx.restore();
    };

    renderSilhouette();

    // Now render the uploaded logo on the printable area
    if (logoImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = logoImage;
      img.onload = () => {
        ctx.save();

        const pArea = selectedProduct.printArea;
        // Center of print zone
        const centerX = (pArea.x + pArea.width / 2) * (width / 100) + logoX * 2;
        const centerY = (pArea.y + pArea.height / 2) * (height / 100) + logoY * 2;

        ctx.translate(centerX, centerY);
        ctx.rotate((logoRotation * Math.PI) / 180);

        // Blending for realism
        if (selectedColor.hex !== '#111111' && blendMode === 'multiply') {
          ctx.globalCompositeOperation = 'multiply';
        }

        const baseSize = 160;
        const scaleFactor = (logoScale / 100);
        const drawW = baseSize * scaleFactor;
        const drawH = (img.height / img.width) * drawW;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

        ctx.restore();

        // Add subtle fabric fold overlay highlight
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      };
    }
  }, [selectedProduct, selectedColor, logoImage, logoScale, logoX, logoY, logoRotation, blendMode]);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Studio Header */}
      <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-red-500 font-bold">SAVAGE Custom Lab</span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-300">Live Mockup Studio</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
            Visualize Your Logo on Apparel & Merch
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUseOfficialLogo}
            className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            Official Logo
          </button>
          <button
            onClick={handleDownloadMockup}
            disabled={isExporting}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white text-black hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export PNG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left: Interactive Canvas Viewport */}
        <div className="lg:col-span-7 bg-neutral-100/70 p-6 flex flex-col items-center justify-center relative min-h-[480px]">
          <div className="relative w-full max-w-[480px] aspect-square rounded-xl overflow-hidden shadow-sm border border-neutral-200 bg-white">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs text-neutral-500 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Real-time 800×800 Canvas Preview
            </span>
            <span>·</span>
            <span>BDT ৳{selectedProduct.price} base price</span>
          </div>
        </div>

        {/* Right: Customization Controls Panel */}
        <div className="lg:col-span-5 p-6 border-t lg:border-t-0 lg:border-l border-neutral-200 bg-white flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* 1. Product Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                1. Select Mockup Product
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRODUCTS.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                      selectedProduct.id === prod.id
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    <div className="truncate">{prod.name.split(' ')[0]} {prod.name.split(' ')[1]}</div>
                    <div className={`text-[10px] mt-0.5 ${selectedProduct.id === prod.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      ৳{prod.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Swatches */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  2. Garment / Base Color
                </label>
                <span className="text-xs font-medium text-neutral-500">{selectedColor.name}</span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.hex }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      selectedColor.name === color.name
                        ? 'border-red-600 scale-110 shadow-sm ring-2 ring-red-500/30'
                        : 'border-neutral-300 hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* 3. Logo Upload / Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                3. Your Logo / Artwork
              </label>
              <div className="flex gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-2.5 border-2 border-dashed border-neutral-300 hover:border-black rounded-xl text-xs font-semibold text-neutral-700 hover:text-black flex items-center justify-center gap-2 transition-colors bg-neutral-50"
                >
                  <Upload className="w-4 h-4" />
                  Upload Custom Image
                </button>
                <button
                  onClick={handleUseOfficialLogo}
                  className="px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* 4. Placement & Scale Sliders */}
            <div className="space-y-3.5 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div>
                <div className="flex justify-between text-xs text-neutral-700 font-medium mb-1">
                  <span>Logo Scale</span>
                  <span className="font-mono tabular-nums">{logoScale}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={logoScale}
                  onChange={(e) => setLogoScale(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs text-neutral-700 font-medium mb-1">
                    <span>Horizontal (X)</span>
                    <span className="font-mono tabular-nums">{logoX}</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={logoX}
                    onChange={(e) => setLogoX(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-neutral-700 font-medium mb-1">
                    <span>Vertical (Y)</span>
                    <span className="font-mono tabular-nums">{logoY}</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={logoY}
                    onChange={(e) => setLogoY(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-neutral-700 font-medium mb-1">
                  <span>Rotation</span>
                  <span className="font-mono tabular-nums">{logoRotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={logoRotation}
                  onChange={(e) => setLogoRotation(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              {/* Blend Mode Toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-200">
                <span className="text-xs text-neutral-600">Fabric Ink Blending</span>
                <button
                  onClick={() => setBlendMode(blendMode === 'multiply' ? 'normal' : 'multiply')}
                  className="text-xs font-semibold text-neutral-900 underline hover:text-black"
                >
                  {blendMode === 'multiply' ? 'Multiply (Realistic Ink)' : 'Normal (Opaque)'}
                </button>
              </div>
            </div>

            {/* 5. Size Selection (if garment) */}
            {selectedProduct.id !== 'mug' && selectedProduct.id !== 'tote-bag' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  5. Garment Size
                </label>
                <div className="flex gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA: Order Custom Mockup into Cart */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black hover:bg-neutral-800 text-white active:scale-[0.99]'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Added Custom Item to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Order Custom Print (৳{selectedProduct.price})
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-neutral-500 mt-2">
              Free customization preview · Cash on Delivery available across Bangladesh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
