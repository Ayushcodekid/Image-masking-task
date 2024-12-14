//done



import SaveIcon from '@mui/icons-material/Save';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { Box, Button, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { useDropzone } from 'react-dropzone';
import './App.css';

const App = () => {
  const [image, setImage] = useState(null);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('white'); // New state for brush color
  const [canvasRef, setCanvasRef] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedImage = localStorage.getItem('image');
    const savedMaskImage = localStorage.getItem('maskImage');
    const savedCanvasData = localStorage.getItem('canvasData');

    if (savedImage) setImage(savedImage);
    if (savedMaskImage) setMaskImage(savedMaskImage);
    if (canvasRef && savedCanvasData) {
      canvasRef.loadSaveData(savedCanvasData, true);
    }
  }, [canvasRef]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
      localStorage.removeItem('image');
      setMaskImage(null);
      clearCanvas();
      localStorage.removeItem('maskImage');

      setImage(imageData);
      localStorage.setItem('image', imageData);
    };
    reader.readAsDataURL(file);
  };

  const exportMask = () => {
    if (canvasRef && image) {
      const canvas = canvasRef.canvas.drawing;
      const context = canvas.getContext('2d');

      // Create a new canvas for the mask
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskContext = maskCanvas.getContext('2d');

      // Draw the original image onto the mask canvas
      const img = new Image();
      img.src = image;
      img.onload = () => {
        maskContext.drawImage(img, 0, 0, maskCanvas.width, maskCanvas.height); // Draw the image on the mask canvas

        // Draw the drawing from the canvasRef onto the mask canvas
        maskContext.drawImage(canvas, 0, 0); // Draw the drawing onto the mask context

        // Get the mask as a data URL
        const maskDataUrl = maskCanvas.toDataURL('image/png');
        setMaskImage(maskDataUrl);
        localStorage.setItem('maskImage', maskDataUrl); // Save to localStorage
      };
    }
  };

  const clearCanvas = () => {
    if (canvasRef) {
      canvasRef.clear();
    }
  };

  const resetAll = () => {
    setImage(null);
    setMaskImage(null);
    if (canvasRef) {
      canvasRef.clear();
      localStorage.clear(); // Clear all stored data
    }
  };

  const saveCanvas = () => {
    if (canvasRef && image) {
      const canvas = canvasRef.canvas.drawing;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'image_with_drawing.png';

      // Draw the image and all drawings onto a new canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const finalContext = finalCanvas.getContext('2d');

      const img = new Image();
      img.src = image;
      img.onload = () => {
        finalContext.drawImage(img, 0, 0, canvas.width, canvas.height);
        finalContext.drawImage(canvas, 0, 0);

        link.href = finalCanvas.toDataURL('image/png');
        link.click();
      };
    }
  };

  const zoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.2, 2));
  const zoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.2, 0.5));

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/jpeg, image/png',
  });

  return (
    <div className="App">
      <header className="app-header">
        <Typography variant="h3">Image Masking Application</Typography>
      </header>

      <main className="app-main">
        <Box {...getRootProps()} className="dropzone" sx={{ padding: 2, border: '1px dashed', borderRadius: 2 }}>
          <input {...getInputProps()} />
          {image ? (
            <Typography variant="body1">Image uploaded successfully! Ready for masking.</Typography>
          ) : (
            <Typography variant="body1">Drag & drop an image here, or click to select one</Typography>
          )}
        </Box>

        {image && (
          <Box className="canvas-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CanvasDraw
              ref={setCanvasRef}
              imgSrc={image}
              canvasWidth={800}
              canvasHeight={600}
              brushColor={brushColor} // Use brushColor state
              lazyRadius={0}
              brushRadius={brushSize}
              style={{ transform: `scale(${zoom})` }}
            />
            <Box className="controls" sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="contained" onClick={() => setBrushSize(brushSize + 1)}>Increase Brush</Button>
              <Button variant="contained" onClick={() => setBrushSize(brushSize - 1)}>Decrease Brush</Button>
              <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={exportMask}>Save</Button>
              <Button variant="contained" color="secondary" style={{ backgroundColor: 'red' }} onClick={clearCanvas}>Clear</Button>
              <Button variant="contained" color="secondary" style={{ backgroundColor: 'red' }} onClick={resetAll}>Reset</Button>

              <Tooltip title="Zoom In">
                <IconButton onClick={zoomIn}><ZoomInIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <IconButton onClick={zoomOut}><ZoomOutIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Save Image with Drawing">
                <IconButton onClick={saveCanvas}><SaveIcon /></IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
              <Typography variant="body1">Brush Color:</Typography>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
              />
            </Box>
          </Box>
        )}

        {maskImage && (
          <Box className="image-output" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
            <Box className='generated' sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
              <Box className='generated' sx={{ width: '50%', textAlign: 'center' }}>
                <Typography variant="h4">Generated Mask</Typography>
                <img src={maskImage} alt="mask" className="output-image" style={{ width: '100%', height: '70vh' }} />
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: 'grey.800', borderWidth: 0.8 }} />

              <Box className='generated' sx={{ width: '50%', textAlign: 'center' }}>
                <Typography variant="h4">Original Image</Typography>
                <img src={image} alt="original" className="output-image" style={{ width: '100%', height: '70vh' }} />
              </Box>
            </Box>
          </Box>
        )}
      </main>

      <footer className="app-footer">
        <Typography variant="body2">&copy; 2024 Image Masking App. All rights reserved.</Typography>
      </footer>
    </div>
  );
};

export default App;