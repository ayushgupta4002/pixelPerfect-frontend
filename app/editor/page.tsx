"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, HelpCircle, DownloadIcon, RefreshCw, FlipHorizontal, FlipVertical, RotateCcw, RotateCw, Contrast, Sun, Droplets, Image } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import ReactCrop, { Crop } from 'react-image-crop'
import dynamic from 'next/dynamic'
import Link from 'next/link';

// Import the component with dynamic import and disable SSR
const Cropper = dynamic(
  () => import('react-easy-crop'),
  { ssr: false }
)

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [processedImage, setProcessedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [borderWidth, setBorderWidth] = useState(5); // Default border width in pixels
const [borderColor, setBorderColor] = useState("#FF0000"); // 


  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    // Store crop data without logging it to avoid unnecessary renders
console.log("croppedarea") 

}, []);
  console.log("hi");

  const [sizeUnit, setSizeUnit] = useState("px");
  const [operation, setOperation] = useState("resize");
  const [flipOperation, setFlipOperation] = useState("flip_horizontal");
  const [editOperation, setEditOperation] = useState("contrast");
  const [editValue, setEditValue] = useState(50); // For slider values (0-100)


  // Track the original uploaded image
  const originalImageRef = useRef(null);
  
  // Store the last applied edit values to avoid reprocessing when unnecessary
  const lastAppliedEdit = useRef({
    operation: "",
    editOperation: "",
    editValue: 0,
    flipOperation: ""
  });

  // Get current image dimensions based on whether a processed image exists
  const currentImageDimensions = processedImage ? 
    (operation === "resize" ? dimensions : originalDimensions) : 
    originalDimensions;

  useEffect(() => {
    // Update dimensions when aspect ratio is locked
    if (lockAspectRatio && originalDimensions.width > 0) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;

      if (dimensions.width !== originalDimensions.width) {
        // Width was changed, adjust height
        setDimensions(prev => ({
          ...prev,
          height: Math.round(dimensions.width / aspectRatio)
        }));
      } else if (dimensions.height !== originalDimensions.height) {
        // Height was changed, adjust width
        setDimensions(prev => ({
          ...prev,
          width: Math.round(dimensions.height * aspectRatio)
        }));
      }
    }
  }, [dimensions.width, dimensions.height, lockAspectRatio, originalDimensions]);

  // Reset edit value when changing edit operation
  useEffect(() => {
    // Set appropriate default values for each edit operation
    switch (editOperation) {
      case "contrast":
        setEditValue(50);
        break;
      case "brightness":
        setEditValue(50);
        break;
      case "blur":
        setEditValue(0);
        break;
      case "unsharpen":
        setEditValue(0);
        break;
      default:
        setEditValue(50);
    }
    
    // Reset processed image when changing operation to start fresh
    if (operation === "edit" && lastAppliedEdit.current.editOperation !== editOperation) {
      setProcessedImage(null);
    }
  }, [editOperation, operation]);

  // Reset processed image when changing operation type
  useEffect(() => {
    if (operation !== lastAppliedEdit.current.operation && selectedImage) {
      setProcessedImage(null);
    }
  }, [operation, selectedImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      originalImageRef.current = file; // Store the original file
      setProcessedImage(null);

      // Reset the last applied edit
      lastAppliedEdit.current = {
        operation: "",
        editOperation: "",
        editValue: 0,
        flipOperation: ""
      };

      // Get original dimensions
      const img = new window.Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setDimensions({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value);
    setDimensions(prev => ({ ...prev, width: newWidth }));
  };

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value);
    setDimensions(prev => ({ ...prev, height: newHeight }));
  };
  
  const handleProcessImage = async () => {
    if (!selectedImage) return;
    setProcessing(true);

    try {
      const formData = new FormData();
      
      // Always use the original image when applying edits
      // This ensures we're not stacking edits on top of each other
      if (operation === "edit" || (operation === "flip" && flipOperation === "huerotate")) {
        formData.append("image", originalImageRef.current);
      } else {
        // For operations like resize, flip, rotate, and grayscale
        // We can use the processed image if available, otherwise use the original
        formData.append("image", selectedImage);
      }

      let endpoint = "http://localhost:5000/process";

      // Determine which operation to send
      let operationToSend = operation;
      if (operation === "flip") {
        operationToSend = flipOperation;
      } else if (operation === "edit") {
        operationToSend = editOperation;
        formData.append("value", editValue.toString());
      }

      formData.append("operation", operationToSend);

      if (operation === "resize") {
        formData.append("width", dimensions.width.toString());
        formData.append("height", dimensions.height.toString());
      }

      if (operation === "border") {
        formData.append("border_width", borderWidth.toString());
        // Remove the # from hex color and append
        formData.append("border_color", borderColor.replace('#', ''));
      }

      // Update last applied edit
      lastAppliedEdit.current = {
        operation,
        editOperation,
        editValue,
        flipOperation
      };

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process image: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Create and set the displayed image URL
      const imageUrl = URL.createObjectURL(blob);
      setProcessedImage(imageUrl);
      
      // Update dimensions if needed (e.g., for rotations)
      if (operationToSend === "rotate90" || operationToSend === "rotate270") {
        // Swap width and height for 90/270 degree rotations
        const img = new window.Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
        };
        img.src = imageUrl;
      }
      
      // Update the selectedImage to use for future operations like resize
      // But only for non-edit operations since we want to keep original for edits
      if (operation !== "edit" && operationToSend !== "huerotate") {
        const processedFile = new File(
          [blob], 
          selectedImage.name,
          { type: blob.type }
        );
        setSelectedImage(processedFile);
      }
      
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleUndoProcessing = () => {
    // Reset to original image
    setProcessedImage(null);
    setSelectedImage(originalImageRef.current);
    
    // Reset the last applied edit
    lastAppliedEdit.current = {
      operation: "",
      editOperation: "",
      editValue: 0,
      flipOperation: ""
    };
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `processed-${selectedImage?.name || 'image'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    originalImageRef.current = null;
    setDimensions({ width: 800, height: 600 });
    setOriginalDimensions({ width: 0, height: 0 });
    setOperation("resize");
    setSizeUnit("px");
    setLockAspectRatio(true);
    setFlipOperation("flip_horizontal");
    setEditOperation("contrast");
    setEditValue(50);
    
    // Reset the last applied edit
    lastAppliedEdit.current = {
      operation: "",
      editOperation: "",
      editValue: 0,
      flipOperation: ""
    };
  };

  const getOperationLabel = () => {
    switch (operation) {
      case "resize": return "Resize";
      case "grayscale": return "Convert to Grayscale";
      case "flip":
        switch (flipOperation) {
          case "flip_horizontal": return "Flip Horizontally";
          case "flip_vertical": return "Flip Vertically";
          case "huerotate": return "Hue Rotate";
          case "rotate180": return "Rotate 180°";
          case "rotate90": return "Rotate 90°";
          case "rotate270": return "Rotate 270°";
          default: return "Flip";
        }
      case "edit":
        switch (editOperation) {
          case "contrast": return "Adjust Contrast";
          case "brightness": return "Adjust Brightness";
          case "blur": return "Apply Blur";
          case "unsharpen": return "Unsharpen";
          default: return "Edit";
        }
      default: return "Process";
    }
  };

  const getEditLabel = () => {
    switch (editOperation) {
      case "contrast": return "Contrast";
      case "brightness": return "Brightness";
      case "blur": return "Blur Amount";
      case "unsharpen": return "Unsharpen Amount";
      default: return "Value";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-slate-200">
      {/* Top Navigation Bar */}
      <div className="bg-zinc-950 px-6 py-4 flex items-center justify-between shadow-lg border-b border-zinc-800">
      <Link href={"/"}>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-200 cursor-pointer to-slate-400 bg-clip-text text-transparent">PixelPerfect</h1>
      </Link>
        <div className="flex space-x-3">
          {processedImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndoProcessing}
              className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Undo</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!processedImage}
            className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-slate-300 disabled:bg-zinc-900 disabled:text-zinc-600"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Download</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-zinc-850 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 overflow-y-auto border-r border-zinc-800 shadow-lg">
          <div className="space-y-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="operation" className="text-slate-300 text-sm uppercase tracking-wider font-semibold mb-2 block">Operation</Label>
                <Select value={operation} onValueChange={setOperation}>
                  <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-slate-200 focus:ring-1 focus:ring-slate-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-slate-200">
                    <SelectItem value="resize">Resize</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="flip">Flip & Rotate</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="crop">Crop</SelectItem>
                    <SelectItem value="border">Border</SelectItem>

                  </SelectContent>
                </Select>
              </div>

              {operation === "resize" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="width" className="text-slate-300 text-sm mb-1 block">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        value={dimensions.width}
                        onChange={handleWidthChange}
                        className="bg-zinc-800 border-zinc-700 text-slate-200 focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-slate-300 text-sm mb-1 block">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        value={dimensions.height}
                        onChange={handleHeightChange}
                        className="bg-zinc-800 border-zinc-700 text-slate-200 focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Select value={sizeUnit} onValueChange={setSizeUnit}>
                      <SelectTrigger className="w-20 bg-zinc-800 border-zinc-700 text-slate-200 focus:ring-1 focus:ring-slate-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-slate-200">
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="aspectRatio"
                        checked={lockAspectRatio}
                        onCheckedChange={(checked) => setLockAspectRatio(checked)}
                        className="data-[state=checked]:bg-slate-400 border-zinc-600"
                      />
                      <Label htmlFor="aspectRatio" className="text-slate-300 text-sm">
                        Lock Aspect Ratio
                      </Label>
                    </div>
                  </div>
                </>
              )}

              {operation === "flip" && (
                <div className="space-y-4">
                  <Label className="text-slate-300 text-sm uppercase tracking-wider font-semibold mb-2 block">Flip & Rotate Options</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={flipOperation === "flip_horizontal" ? "default" : "outline"}
                      onClick={() => setFlipOperation("flip_horizontal")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${flipOperation === "flip_horizontal" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <FlipHorizontal className="w-6 h-6 mb-1" />
                      <span className="text-xs">Flip Horizontal</span>
                    </Button>
                    <Button
                      variant={flipOperation === "flip_vertical" ? "default" : "outline"}
                      onClick={() => setFlipOperation("flip_vertical")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${flipOperation === "flip_vertical" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <FlipVertical className="w-6 h-6 mb-1" />
                      <span className="text-xs">Flip Vertical</span>
                    </Button>
                    <Button
                      variant={flipOperation === "huerotate" ? "default" : "outline"}
                      onClick={() => setFlipOperation("huerotate")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${flipOperation === "huerotate" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <Contrast className="w-6 h-6 mb-1" />
                      <span className="text-xs">Hue Rotate</span>
                    </Button>
                    <Button
                      variant={flipOperation === "rotate180" ? "default" : "outline"}
                      onClick={() => setFlipOperation("rotate180")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${flipOperation === "rotate180" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <RotateCw className="w-6 h-6 mb-1 transform rotate-180" />
                      <span className="text-xs">Rotate 180°</span>
                    </Button>
                    <Button
                      variant={flipOperation === "rotate90" ? "default" : "outline"}
                      onClick={() => setFlipOperation("rotate90")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${flipOperation === "rotate90" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <RotateCw className="w-6 h-6 mb-1" />
                      <span className="text-xs">Rotate 90°</span>
                    </Button>
                    <Button
                      variant={flipOperation === "rotate270" ? "default" : "outline"}
                      onClick={() => setFlipOperation("rotate270")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${flipOperation === "rotate270" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <RotateCcw className="w-6 h-6 mb-1" />
                      <span className="text-xs">Rotate 270°</span>
                    </Button>
                  </div>

                  {flipOperation === "huerotate" && (
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between">
                        <Label className="text-slate-300 text-sm">{getEditLabel()}</Label>
                        <span className="text-sm text-slate-400">{editValue}</span>
                      </div>
                      <Slider
                        value={[editValue]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(values) => {
                          const value = values[0];
                          setEditValue(value);
                          setIsSliding(true);
                        }}
                        onValueCommit={(values) => {
                          setIsSliding(false);
                          // Process image when slider is released
                          handleProcessImage();
                        }}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {operation === "edit" && (
                <div className="space-y-4">
                  <Label className="text-slate-300 text-sm uppercase tracking-wider font-semibold mb-2 block">Editing Options</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={editOperation === "contrast" ? "default" : "outline"}
                      onClick={() => setEditOperation("contrast")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${editOperation === "contrast" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <Contrast className="w-6 h-6 mb-1" />
                      <span className="text-xs">Contrast</span>
                    </Button>
                    <Button
                      variant={editOperation === "brightness" ? "default" : "outline"}
                      onClick={() => setEditOperation("brightness")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${editOperation === "brightness" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <Sun className="w-6 h-6 mb-1" />
                      <span className="text-xs">Brightness</span>
                    </Button>
                    <Button
                      variant={editOperation === "blur" ? "default" : "outline"}
                      onClick={() => setEditOperation("blur")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${editOperation === "blur" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <Droplets className="w-6 h-6 mb-1" />
                      <span className="text-xs">Blur</span>
                    </Button>
                    <Button
                      variant={editOperation === "unsharpen" ? "default" : "outline"}
                      onClick={() => setEditOperation("unsharpen")}
                      className={`flex flex-col items-center justify-center p-3 h-auto ${editOperation === "unsharpen" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-slate-300"
                        }`}
                    >
                      <Image className="w-6 h-6 mb-1" />
                      <span className="text-xs">Unsharpen</span>
                    </Button>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between">
                      <Label className="text-slate-300 text-sm">{getEditLabel()}</Label>
                      <span className="text-sm text-slate-400">{editValue}</span>
                    </div>
                    <Slider
                      value={[editValue]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(values) => {
                        const value = values[0];
                        setEditValue(value);
                        setIsSliding(true);
                      }}
                      onValueCommit={(values) => {
                        setIsSliding(false);
                        // Process image when slider is released
                        handleProcessImage();
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              )}

{operation === "border" && (
  <div className="space-y-4">
    <Label className="text-slate-300 text-sm uppercase tracking-wider font-semibold mb-2 block">Border Options</Label>
    <div>
      <Label htmlFor="borderWidth" className="text-slate-300 text-sm mb-1 block">Width (px)</Label>
      <Input
        id="borderWidth"
        type="number"
        min="1"
        max="100"
        value={borderWidth}
        onChange={(e) => setBorderWidth(parseInt(e.target.value))}
        className="bg-zinc-800 border-zinc-700 text-slate-200 focus:ring-1 focus:ring-slate-400"
      />
    </div>
    <div>
      <Label htmlFor="borderColor" className="text-slate-300 text-sm mb-1 block">Color</Label>
      <div className="flex space-x-2">
        <Input
          id="borderColor"
          type="color"
          value={borderColor}
          onChange={(e) => setBorderColor(e.target.value)}
          className="bg-zinc-800 border-zinc-700 w-12 h-10 p-1"
        />
        <Input
          type="text"
          value={borderColor}
          onChange={(e) => setBorderColor(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-slate-200 focus:ring-1 focus:ring-slate-400 flex-1"
        />
      </div>
    </div>
  </div>
)}
              
              {operation !== "edit" && 
              <Button
                onClick={handleProcessImage}
                className="w-full bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white font-medium transition-all duration-200 shadow-md"
                disabled={!selectedImage || processing}
              >
                {processing ? "Processing..." : `${getOperationLabel()} Image`}
              </Button>}
            </div>
          </div>
        </div>



        {/* Main Content Area */}
        <div className="flex-1 bg-zinc-900 bg-[radial-gradient(ellipse_at_top_right,_rgba(30,30,40,0.4),_transparent_70%)] p-8 overflow-y-auto">
          {!selectedImage ? (
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center h-full flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-slate-500">
              <div className="max-w-xl mx-auto">
                <div className="p-4 rounded-full bg-zinc-800/80 inline-block mb-4">
                  <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                </div>
                <h3 className="mt-4 text-2xl font-medium text-slate-200">Select an Image</h3>
                <p className="mt-2 text-slate-400">Drag and drop an image or click below to browse files</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="secondary"
                  className="mt-6 px-6 py-2 bg-indigo-700 hover:bg-indigo-600 text-white"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  Select Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="flex flex-col items-center w-full">
                {/* Single Image Display (Original or Processed) */}
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-medium text-slate-200 mb-4">
                    {processing ? "Processing..." : 
                     processedImage ? "Processed Image" : "Original Image"}
                  </h2>
                  <div className="border border-zinc-700 rounded-lg p-4 relative bg-zinc-950/60 backdrop-blur-sm shadow-xl transition-all hover:border-zinc-600">
                    {processing ? (
                      <div className="flex items-center justify-center bg-zinc-900/70 w-full h-96 max-w-2xl rounded-md backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                          <RefreshCw className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                          <p className="text-slate-400">Processing image...</p>
                        </div>
                      </div>
                    ) : operation === "crop" && !processedImage ? (
                      <div className="flex flex-col gap-4 w-full">
                      <div style={{ position: 'relative', width: '100%', height: '300px', maxWidth: '2xl' }} className='rounded shadow-lg'>
                        <Cropper
                          image={URL.createObjectURL(selectedImage)}
                          crop={crop}
                          zoom={zoom}
                          aspect={4 / 3}
                          onCropChange={setCrop}
                          onCropComplete={onCropComplete}
                          onZoomChange={setZoom}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Zoom:</span>
                        <input
                          type="range"
                          value={zoom}
                          min={1}
                          max={3}
                          step={0.1}
                          aria-labelledby="Zoom"
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full max-w-xs"
                        />
                      </div>
                    </div>
                    ) : (
                      <img
                        src={processedImage ? processedImage : URL.createObjectURL(selectedImage)}
                        alt={processedImage ? "Processed" : "Original"}
                        className="max-h-96 max-w-2xl object-contain rounded shadow-lg"
                      />
                    )}

     
                  </div>
                  <div className="flex items-center space-x-2 mt-4 px-3 py-1 bg-zinc-800/60 rounded-full text-sm text-slate-300">
                    <span className="text-slate-400">Dimensions:</span>
                    <p>{currentImageDimensions.width} × {currentImageDimensions.height} px</p>
                  </div>
                </div>
              </div>
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
}