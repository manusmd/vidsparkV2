import { useState } from 'react';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contenttypes/generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      if (data.output) {
        setImage(data.output[0]);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your image prompt"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={generateImage}
          disabled={loading || !prompt}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {image && (
        <div className="aspect-square w-full relative">
          <img
            src={image}
            alt="Generated"
            className="rounded-lg shadow-lg w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
} 