import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, RefreshCw, ShoppingCart, SlidersHorizontal, PenTool, MousePointer2, Eraser, Trash2, Undo } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';

export const CustomMirror: React.FC = () => {
  const { addToCart } = useCart();

  // Input Mode
  const [mode, setMode] = useState<'config' | 'draw'>('config');

  // Configuration State
  const [shape, setShape] = useState('Rectangle');
  const [width, setWidth] = useState(80);
  const [height, setHeight] = useState(120);
  const [frameType, setFrameType] = useState('Métal Fin');
  const [frameColor, setFrameColor] = useState('Noir Mat');
  const [room, setRoom] = useState('Salle de Bain Moderne');

  // Drawing State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(3);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [price, setPrice] = useState(0);

  // Constants for Pricing (Simplified)
  const BASE_PRICE_M2 = 800; // MAD
  const FRAME_PRICE_FACTOR: Record<string, number> = {
    'Sans Cadre': 1,
    'Métal Fin': 1.2,
    'Bois Massif': 1.4,
    'Rétroéclairage LED': 1.8,
    'Orné / Baroque': 1.6
  };

  // Calculate Price on Change
  useEffect(() => {
    const area = (width * height) / 10000; // m2
    const factor = FRAME_PRICE_FACTOR[frameType] || 1;
    const estimated = Math.round(area * BASE_PRICE_M2 * factor);
    setPrice(estimated < 300 ? 300 : estimated); // Min price
  }, [width, height, frameType]);

  // Initialize Canvas
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw a faint guide grid
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
        for (let i = 0; i < canvas.height; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
      }
    }
  }, [mode]);

  // Drawing Handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Redraw grid
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
      for (let i = 0; i < canvas.height; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Try different common environment variable names for the API key
      const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY ||
        import.meta.env.VITE_API_KEY;

      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error("Clé API manquante. Veuillez configurer VITE_GOOGLE_GENAI_API_KEY dans votre fichier .env");
      }

      const ai = new GoogleGenAI({ apiKey });
      let contents;

      const basePrompt = `A realistic high-quality photo of a mirror. 
      Frame style: ${frameType} in ${frameColor}. 
      Context: Hanging on a wall in a ${room}. 
      Lighting: Soft, natural, elegant reflection. 
      Style: Interior design photography, architectural digest style.`;

      if (mode === 'draw' && canvasRef.current) {
        const base64Data = canvasRef.current.toDataURL('image/png').split(',')[1];
        contents = {
          parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: `${basePrompt} IMPORTANT: Create a mirror that EXACTLY matches the shape drawn in the input image.` }
          ]
        };
      } else {
        contents = `${basePrompt} Shape: ${shape}, dimensions approx ${width}x${height}cm.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64String = part.inlineData.data;
            setGeneratedImage(`data:image/png;base64,${base64String}`);
            break;
          }
        }
      }

    } catch (error: any) {
      console.error("AI Generation Error:", error);
      alert(`Erreur lors de la génération: ${error.message || 'Veuillez vérifier votre clé API.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCart = () => {
    if (!generatedImage) return;

    const customProduct: Product = {
      id: 'custom-ai-' + Date.now(),
      name: `Miroir Sur Mesure (${mode === 'draw' ? 'Forme Libre' : shape})`,
      description: `Miroir ${mode === 'draw' ? 'Dessiné' : shape} ${width}x${height}cm, Cadre ${frameType} ${frameColor}.`,
      price_per_m2: 0,
      stock: 999,
      thickness: 6,
      category_id: 'custom',
      is_customizable: true,
      image_url: null
    };

    addToCart(
      customProduct,
      1,
      width,
      height,
      price,
      generatedImage,
      { shape: mode === 'draw' ? 'Dessin Libre' : shape, frameType, frameColor, room }
    );

    alert("Votre miroir personnalisé a été ajouté au panier !");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-widest mb-4 inline-block">
            Studio IA
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6">
            Créez l'Impossible
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
            Utilisez nos suggestions de formes ou dessinez votre propre vision. L'IA transformera votre concept en réalité.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              {/* Mode Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
                <button
                  onClick={() => setMode('config')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${mode === 'config' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                >
                  <MousePointer2 size={16} /> Suggestions
                </button>
                <button
                  onClick={() => setMode('draw')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${mode === 'draw' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                >
                  <PenTool size={16} /> Dessin Libre
                </button>
              </div>

              {/* Configuration Inputs */}
              <div className="space-y-6">
                {mode === 'config' && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-3">Forme Suggérée</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Rectangle', 'Rond', 'Ovale', 'Organique', 'Arche', 'Diamant'].map(s => (
                        <button
                          key={s}
                          onClick={() => setShape(s)}
                          className={`py-3 px-2 text-xs font-medium border rounded transition-all truncate ${shape === s ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400 text-gray-700'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Largeur (cm)</label>
                    <div className="relative">
                      <input type="number" min="30" max="300" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full p-3 bg-gray-50 border-none rounded font-mono font-medium focus:ring-2 focus:ring-black outline-none" />
                      <span className="absolute right-3 top-3 text-xs text-gray-400">cm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Hauteur (cm)</label>
                    <div className="relative">
                      <input type="number" min="30" max="300" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full p-3 bg-gray-50 border-none rounded font-mono font-medium focus:ring-2 focus:ring-black outline-none" />
                      <span className="absolute right-3 top-3 text-xs text-gray-400">cm</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Finition Cadre</label>
                  <select value={frameType} onChange={e => setFrameType(e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded font-medium focus:ring-2 focus:ring-black outline-none cursor-pointer">
                    <option>Sans Cadre (Bords Polis)</option>
                    <option>Métal Fin (Minimaliste)</option>
                    <option>Bois Massif (Naturel)</option>
                    <option>Rétroéclairage LED (Moderne)</option>
                    <option>Orné / Baroque (Classique)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Couleur</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Noir Mat', 'Doré', 'Argent', 'Bois Chêne', 'Blanc', 'Rose Gold'].map(c => (
                      <button
                        key={c}
                        onClick={() => setFrameColor(c)}
                        className={`px-3 py-2 rounded text-xs border transition-all ${frameColor === c ? 'border-black bg-gray-100 font-bold' : 'border-gray-200 text-gray-600'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Contexte</label>
                  <select value={room} onChange={e => setRoom(e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded font-medium focus:ring-2 focus:ring-black outline-none cursor-pointer">
                    <option>Salle de Bain Moderne</option>
                    <option>Salon Minimaliste</option>
                    <option>Entrée Chic</option>
                    <option>Chambre Cosy</option>
                    <option>Dressing de Luxe</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-black text-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 text-sm">Prix Estimé</span>
                <span className="text-3xl font-serif font-medium">{price} MAD</span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 rounded-lg disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
                {isGenerating ? 'Génération en cours...' : 'Générer le Rendu'}
              </button>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-8 space-y-6">

            {/* Drawing Canvas (Visible only in draw mode) */}
            {mode === 'draw' && !generatedImage && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><PenTool size={16} /> Zone de Dessin</h3>
                  <div className="flex gap-2">
                    <button onClick={clearCanvas} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded" title="Effacer tout"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="relative w-full h-[500px] border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-white cursor-crosshair touch-none">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-full object-contain"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!isDrawing && (
                    <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 text-xs text-gray-400 rounded pointer-events-none">
                      Dessinez la forme désirée
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 justify-center">
                  <span>Épaisseur Trait:</span>
                  <input type="range" min="1" max="10" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="accent-black" />
                </div>
              </div>
            )}

            {/* Generated Result or Placeholder */}
            <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${mode === 'draw' && !generatedImage ? 'hidden' : 'min-h-[600px]'}`}>
              {isGenerating ? (
                <div className="text-center p-12">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-black rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-black animate-pulse" size={24} />
                  </div>
                  <h3 className="text-xl font-serif text-gray-900 mb-2">L'IA Imagine votre Miroir</h3>
                  <p className="text-gray-400 text-sm">Analyse de la forme et application des matériaux...</p>
                </div>
              ) : generatedImage ? (
                <div className="relative w-full h-full group animate-fade-in-up">
                  <img src={generatedImage} alt="Miroir Généré par IA" className="w-full h-auto max-h-[700px] object-contain mx-auto rounded-lg shadow-2xl" />

                  {/* Action Overlay */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <button
                      onClick={() => { setGeneratedImage(null); if (mode === 'draw') setTimeout(clearCanvas, 100); }}
                      className="px-6 py-3 bg-white text-black font-bold uppercase text-xs rounded-full shadow-lg hover:bg-gray-100 flex items-center gap-2"
                    >
                      <RefreshCw size={14} /> Recommencer
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="px-8 py-3 bg-black text-white font-bold uppercase text-xs rounded-full shadow-lg hover:bg-gray-900 flex items-center gap-2"
                    >
                      <ShoppingCart size={14} /> Commander ce Design
                    </button>
                  </div>
                </div>
              ) : mode === 'config' ? (
                <div className="text-center text-gray-400 max-w-md p-12">
                  <Sparkles size={64} className="mx-auto mb-6 text-gray-200" strokeWidth={1} />
                  <h3 className="text-2xl font-serif text-gray-900 mb-3">Studio de Visualisation</h3>
                  <p className="leading-relaxed">Sélectionnez vos préférences à gauche et cliquez sur "Générer" pour voir une photo réaliste de votre futur miroir.</p>
                </div>
              ) : null}
            </div>

            {/* Disclaimer */}
            <div className="bg-[#f0f0f0] p-6 rounded-xl border border-gray-200 flex gap-4">
              <div className="p-2 bg-white rounded-full h-fit shadow-sm text-gray-500">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1 text-sm">Note sur la production artisanale</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  L'image générée est une simulation visuelle basée sur l'intelligence artificielle pour valider le concept esthétique.
                  La fabrication finale dans nos ateliers à Témara respectera scrupuleusement les dimensions ({width}x{height}cm) et les matériaux choisis.
                  {mode === 'draw' && " Pour les formes dessinées, nos artisans lisseront les courbes pour un rendu professionnel."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};