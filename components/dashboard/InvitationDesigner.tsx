'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  Palette, 
  Download, 
  Undo, 
  Redo,
  Trash2,
  Copy,
  Save,
  Eye,
  Settings,
  Plus,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  X,
  Maximize,
  Minimize,
  Triangle,
  Star,
  Heart,
  Upload,
  Shapes,
  Zap,
  Sun,
  Moon,
  Flower,
  Gift,
  RotateCw,
  RotateCcw,
  Move3D,
  Expand,
  RefreshCw,
  Monitor,
  Smartphone,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Keyboard,
  MousePointer,
  Clipboard,
  ClipboardPaste,
  Paintbrush,
  FolderOpen,
  FileText,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Declare fabric as any to bypass TypeScript issues
declare const fabric: any;

interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
}

interface InvitationDesignerProps {
  event?: Event;
  guestName?: string;
  onSave?: (designData: any) => void;
  onExport?: (imageUrl: string) => void;
}

const InvitationDesigner: React.FC<InvitationDesignerProps> = ({
  event,
  guestName,
  onSave,
  onExport
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [canvasRotation, setCanvasRotation] = useState(0);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, show: boolean, target: any}>({
    x: 0, y: 0, show: false, target: null
  });
  const [clipboard, setClipboard] = useState<any>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Draggable layers panel state
  const [layersPanel, setLayersPanel] = useState({
    isDraggable: false,
    position: { x: 100, y: 100 },
    isDragging: false,
    dragOffset: { x: 0, y: 0 }
  });

  // Project management state
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [showProjectDialog, setShowProjectDialog] = useState(false); // No longer used
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Text properties
  const [textProperties, setTextProperties] = useState({
    fontSize: 20,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: '',
    textAlign: 'left',
    fill: '#000000',
    backgroundColor: 'transparent'
  });

  // Background properties
  const [backgroundProperties, setBackgroundProperties] = useState({
    type: 'color',
    color: '#ffffff',
    gradient: {
      type: 'linear',
      start: '#ffffff',
      end: '#f0f0f0',
      direction: 'to-bottom',
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1
    }
  });

  // Shape properties
  const [shapeProperties, setShapeProperties] = useState({
    fill: '#3b82f6',
    fillType: 'color',
    gradient: {
      type: 'linear',
      start: '#3b82f6',
      end: '#1e40af',
      direction: 'to-bottom',
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1
    },
    stroke: '#1e40af',
    strokeWidth: 2,
    opacity: 1,
    width: 100,
    height: 100,
    radius: 50,
    scaleX: 1,
    scaleY: 1,
    angle: 0
  });

  // Available fonts
  const fonts = [
    'Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana',
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Tahoma'
  ];

  // Template data placeholders
  const dataPlaceholders = [
    { key: 'event.name', label: 'Event Name', value: event?.name || 'Your Event' },
    { key: 'event.date', label: 'Event Date', value: event?.date || 'Date TBD' },
    { key: 'event.time', label: 'Event Time', value: event?.time || 'Time TBD' },
    { key: 'event.location', label: 'Event Location', value: event?.location || 'Location TBD' },
    { key: 'event.description', label: 'Event Description', value: event?.description || '' },
    { key: 'guest.name', label: 'Guest Name', value: guestName || 'Dear Guest' }
  ];

  // Load fabric.js with proper loading state
  useEffect(() => {
    const loadFabric = () => {
      if (typeof fabric !== 'undefined') {
        setFabricLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
      script.async = true;
      script.onload = () => {
        // Give fabric a moment to fully initialize
        setTimeout(() => {
          setFabricLoaded(true);
        }, 100);
      };
      script.onerror = () => {
        toast.error('Failed to load design library. Please refresh the page.');
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    return loadFabric();
  }, []);

  // Initialize canvas when fabric is loaded
  useEffect(() => {
    if (canvasRef.current && !canvas && fabricLoaded && typeof fabric !== 'undefined') {
      try {
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
          width: canvasSize.width,
          height: canvasSize.height,
          backgroundColor: backgroundProperties.color,
          preserveObjectStacking: true,
          selection: true,
          hoverCursor: 'move',
          moveCursor: 'move',
          centeredScaling: false,
          centeredRotation: false,
        });

        // Enable corner controls for all objects
        fabric.Object.prototype.set({
          transparentCorners: false,
          cornerStyle: 'circle',
          cornerSize: 12,
          padding: 10,
          cornerColor: '#2563eb',
          cornerStrokeColor: '#ffffff',
          borderColor: '#2563eb',
          rotatingPointOffset: 40,
          hasRotatingPoint: true,
          lockUniScaling: false,
        });

        // Add selection event listeners
        fabricCanvas.on('selection:created', (e: any) => {
          const selected = e.selected?.[0] || e.target;
          setSelectedObject(selected);
          if (selected && selected.type === 'text') {
            setTextProperties({
              fontSize: selected.fontSize || 20,
              fontFamily: selected.fontFamily || 'Arial',
              fontWeight: selected.fontWeight || 'normal',
              fontStyle: selected.fontStyle || 'normal',
              textDecoration: selected.textDecoration || '',
              textAlign: selected.textAlign || 'left',
              fill: selected.fill || '#000000',
              backgroundColor: selected.backgroundColor || 'transparent'
            });
          } else if (selected && ['rect', 'circle', 'triangle', 'polygon', 'group', 'image', 'line'].includes(selected.type)) {
            setShapeProperties({
              fill: selected.fill || '#3b82f6',
              fillType: 'color',
              gradient: {
                type: 'linear',
                start: '#3b82f6',
                end: '#1e40af',
                direction: 'to-bottom',
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stroke: selected.stroke || '#1e40af',
              strokeWidth: selected.strokeWidth || 2,
              opacity: selected.opacity || 1,
              width: selected.width || 100,
              height: selected.height || 100,
              radius: selected.radius || 50,
              scaleX: selected.scaleX || 1,
              scaleY: selected.scaleY || 1,
              angle: selected.angle || 0
            });
          }
        });

        fabricCanvas.on('selection:updated', (e: any) => {
          const selected = e.selected?.[0] || e.target;
          setSelectedObject(selected);
          if (selected && selected.type === 'text') {
            setTextProperties({
              fontSize: selected.fontSize || 20,
              fontFamily: selected.fontFamily || 'Arial',
              fontWeight: selected.fontWeight || 'normal',
              fontStyle: selected.fontStyle || 'normal',
              textDecoration: selected.textDecoration || '',
              textAlign: selected.textAlign || 'left',
              fill: selected.fill || '#000000',
              backgroundColor: selected.backgroundColor || 'transparent'
            });
          } else if (selected && ['rect', 'circle', 'triangle', 'polygon', 'group', 'image', 'line'].includes(selected.type)) {
            setShapeProperties({
              fill: selected.fill || '#3b82f6',
              fillType: 'color',
              gradient: {
                type: 'linear',
                start: '#3b82f6',
                end: '#1e40af',
                direction: 'to-bottom',
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stroke: selected.stroke || '#1e40af',
              strokeWidth: selected.strokeWidth || 2,
              opacity: selected.opacity || 1,
              width: selected.width || 100,
              height: selected.height || 100,
              radius: selected.radius || 50,
              scaleX: selected.scaleX || 1,
              scaleY: selected.scaleY || 1,
              angle: selected.angle || 0
            });
          }
        });

        fabricCanvas.on('selection:cleared', () => {
          setSelectedObject(null);
        });

        // Add object modified listener for history
        fabricCanvas.on('object:modified', () => {
          saveState();
        });

        fabricCanvas.on('path:created', () => {
          saveState();
        });

        // Add right-click context menu
        fabricCanvas.on('mouse:down', (options: any) => {
          if (options.e.button === 2) { // Right click
            const target = fabricCanvas.findTarget(options.e, false);
            setContextMenu({
              x: options.e.clientX,
              y: options.e.clientY,
              show: true,
              target: target || null
            });
            options.e.preventDefault();
            options.e.stopPropagation();
          } else {
            setContextMenu(prev => ({ ...prev, show: false }));
          }
        });

        // Additional context menu handling for direct canvas events
        fabricCanvas.upperCanvasEl.addEventListener('contextmenu', (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Only show context menu if fabric's mouse:down didn't already handle it
          setTimeout(() => {
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              show: true,
              target: null
            });
          }, 10);
          
          return false;
        });

        // Disable browser context menu on canvas and its container
        const preventContextMenu = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        };

        fabricCanvas.wrapperEl.addEventListener('contextmenu', preventContextMenu);
        fabricCanvas.upperCanvasEl.addEventListener('contextmenu', preventContextMenu);
        fabricCanvas.lowerCanvasEl.addEventListener('contextmenu', preventContextMenu);
        
        // Also prevent on the parent container
        const canvasContainer = fabricCanvas.wrapperEl.parentElement;
        if (canvasContainer) {
          canvasContainer.addEventListener('contextmenu', preventContextMenu);
        }

        setCanvas(fabricCanvas);
        
        // Add default template after canvas is ready
        setTimeout(() => {
          addDefaultTemplate(fabricCanvas);
        }, 100);

        toast.success('Canvas initialized successfully!');
      } catch (error) {
        console.error('Failed to initialize canvas:', error);
        toast.error('Failed to initialize canvas. Please refresh the page.');
      }
    }

    return () => {
      if (canvas) {
        try {
          canvas.dispose();
        } catch (error) {
          console.error('Error disposing canvas:', error);
        }
      }
    };
  }, [fabricLoaded, canvasRef.current]);

  // Add default template
  const addDefaultTemplate = (fabricCanvas: any) => {
    if (!fabricCanvas || typeof fabric === 'undefined') return;

    try {
      // Title
      const title = new fabric.Text(event?.name || 'Event Invitation', {
        left: fabricCanvas.width / 2,
        top: 100,
        fontSize: 32,
        fontWeight: 'bold',
        fill: '#2c3e50',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      // Date and time
      const dateTime = new fabric.Text(
        `${event?.date || 'Date TBD'} at ${event?.time || 'Time TBD'}`,
        {
          left: fabricCanvas.width / 2,
          top: 200,
          fontSize: 18,
          fill: '#34495e',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          selectable: true,
          moveCursor: 'move',
          hoverCursor: 'move',
        }
      );

      // Location
      if (event?.location) {
        const location = new fabric.Text(event.location, {
          left: fabricCanvas.width / 2,
          top: 250,
          fontSize: 16,
          fill: '#7f8c8d',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          selectable: true,
          moveCursor: 'move',
          hoverCursor: 'move',
        });
        fabricCanvas.add(location);
      }

      // Guest name
      const guestNameText = new fabric.Text(`Dear ${guestName || 'Guest'}`, {
        left: fabricCanvas.width / 2,
        top: 350,
        fontSize: 20,
        fill: '#e74c3c',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      // Message
      const message = new fabric.Text('You are cordially invited!', {
        left: fabricCanvas.width / 2,
        top: 450,
        fontSize: 24,
        fontStyle: 'italic',
        fill: '#8e44ad',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      fabricCanvas.add(title, dateTime, guestNameText, message);
      
      // Ensure all text elements are on top layers
      [title, dateTime, guestNameText, message].forEach(textObj => {
        fabricCanvas.bringToFront(textObj);
      });
      
      fabricCanvas.renderAll();
      
      // Save initial state
      setTimeout(() => {
        saveState();
      }, 100);
    } catch (error) {
      console.error('Error adding default template:', error);
    }
  };

  // Save state for undo/redo
  const saveState = useCallback(() => {
    if (!canvas) return;
    
    try {
      const state = JSON.stringify(canvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(state);
      
      // Limit history to prevent memory issues
      if (newHistory.length > 20) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      
      setHistory(newHistory);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [canvas, history, historyIndex]);

  // Undo
  const undo = () => {
    if (historyIndex > 0 && canvas) {
      try {
        const prevState = history[historyIndex - 1];
        canvas.loadFromJSON(prevState, () => {
          canvas.renderAll();
          setHistoryIndex(historyIndex - 1);
        });
      } catch (error) {
        console.error('Error undoing:', error);
      }
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      try {
        const nextState = history[historyIndex + 1];
        canvas.loadFromJSON(nextState, () => {
          canvas.renderAll();
          setHistoryIndex(historyIndex + 1);
        });
      } catch (error) {
        console.error('Error redoing:', error);
      }
    }
  };

  // Add text (automatically brings to front)
  const addText = (text: string = 'New Text') => {
    if (!canvas || typeof fabric === 'undefined') return;

    try {
      const textObject = new fabric.Text(text, {
        left: 100,
        top: 100,
        fontSize: textProperties.fontSize,
        fontFamily: textProperties.fontFamily,
        fill: textProperties.fill,
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      canvas.add(textObject);
      canvas.bringToFront(textObject); // Automatically bring text to front
      canvas.setActiveObject(textObject);
      canvas.renderAll();
      saveState();
      toast.success('Text added to top layer');
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  // Add data placeholder
  const addDataPlaceholder = (placeholder: any) => {
    addText(placeholder.value);
  };

  // Add rectangle
  const addRectangle = () => {
    if (!canvas || typeof fabric === 'undefined') return;

    try {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: shapeProperties.width,
        height: shapeProperties.height,
        fill: shapeProperties.fill,
        stroke: shapeProperties.stroke,
        strokeWidth: shapeProperties.strokeWidth,
        opacity: shapeProperties.opacity,
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      canvas.add(rect);
      canvas.setActiveObject(rect);
      canvas.renderAll();
      saveState();
    } catch (error) {
      console.error('Error adding rectangle:', error);
    }
  };

  // Add circle
  const addCircle = () => {
    if (!canvas || typeof fabric === 'undefined') return;

    try {
      const circle = new fabric.Circle({
        left: 100,
        top: 100,
        radius: shapeProperties.radius,
        fill: shapeProperties.fill,
        stroke: shapeProperties.stroke,
        strokeWidth: shapeProperties.strokeWidth,
        opacity: shapeProperties.opacity,
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      canvas.add(circle);
      canvas.setActiveObject(circle);
      canvas.renderAll();
      saveState();
    } catch (error) {
      console.error('Error adding circle:', error);
    }
  };

  // Add triangle
  const addTriangle = () => {
    if (!canvas || typeof fabric === 'undefined') return;

    try {
      const triangle = new fabric.Triangle({
        left: 100,
        top: 100,
        width: shapeProperties.width,
        height: shapeProperties.height,
        fill: shapeProperties.fill,
        stroke: shapeProperties.stroke,
        strokeWidth: shapeProperties.strokeWidth,
        opacity: shapeProperties.opacity,
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      canvas.add(triangle);
      canvas.setActiveObject(triangle);
      canvas.renderAll();
      saveState();
    } catch (error) {
      console.error('Error adding triangle:', error);
    }
  };

  // Add star
  const addStar = () => {
    if (!canvas || typeof fabric === 'undefined') return;

    try {
      const starPoints = [];
      const outerRadius = 50;
      const innerRadius = 25;
      const numPoints = 5;

      for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / numPoints;
        starPoints.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
      }

      const star = new fabric.Polygon(starPoints, {
        left: 100,
        top: 100,
        fill: shapeProperties.fill,
        stroke: shapeProperties.stroke,
        strokeWidth: shapeProperties.strokeWidth,
        opacity: shapeProperties.opacity,
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      canvas.add(star);
      canvas.setActiveObject(star);
      canvas.renderAll();
      saveState();
    } catch (error) {
      console.error('Error adding star:', error);
    }
  };

  // Add heart
  const addHeart = () => {
    if (!canvas || typeof fabric === 'undefined') return;

    try {
      const heartSVG = `
        <svg viewBox="0 0 24 24" width="60" height="60">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                fill="${shapeProperties.fill}" 
                stroke="${shapeProperties.stroke}" 
                stroke-width="${shapeProperties.strokeWidth}"/>
        </svg>`;

      fabric.loadSVGFromString(heartSVG, (objects: any[], options: any) => {
        const heart = fabric.util.groupSVGElements(objects, options);
        heart.set({
          left: 100,
          top: 100,
          opacity: shapeProperties.opacity,
          selectable: true,
          moveCursor: 'move',
          hoverCursor: 'move',
        });

        canvas.add(heart);
        canvas.setActiveObject(heart);
        canvas.renderAll();
        saveState();
      });
    } catch (error) {
      console.error('Error adding heart:', error);
    }
  };

  // Upload and add image
  const uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          fabric.Image.fromURL(event.target.result, (img: any) => {
            // Scale image to reasonable size
            const maxWidth = 300;
            const maxHeight = 300;
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            
            img.set({
              left: 100,
              top: 100,
              scaleX: scale,
              scaleY: scale,
              selectable: true,
              moveCursor: 'move',
              hoverCursor: 'move',
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            saveState();
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Add decorative line
  const addLine = () => {
    if (!canvas || typeof fabric === 'undefined') return;

    try {
      const line = new fabric.Line([50, 100, 200, 100], {
        left: 100,
        top: 100,
        stroke: shapeProperties.stroke,
        strokeWidth: shapeProperties.strokeWidth,
        opacity: shapeProperties.opacity,
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      canvas.add(line);
      canvas.setActiveObject(line);
      canvas.renderAll();
      saveState();
    } catch (error) {
      console.error('Error adding line:', error);
    }
  };

  // Add decorative border
  const addBorder = () => {
    if (!canvas || typeof fabric === 'undefined') return;

    try {
      const border = new fabric.Rect({
        left: 20,
        top: 20,
        width: canvas.width - 40,
        height: canvas.height - 40,
        fill: 'transparent',
        stroke: shapeProperties.stroke,
        strokeWidth: shapeProperties.strokeWidth * 2,
        opacity: shapeProperties.opacity,
        selectable: true,
        moveCursor: 'move',
        hoverCursor: 'move',
      });

      canvas.add(border);
      canvas.setActiveObject(border);
      canvas.renderAll();
      saveState();
    } catch (error) {
      console.error('Error adding border:', error);
    }
  };

  // Update selected text properties
  const updateTextProperty = (property: string, value: any) => {
    if (!canvas || !selectedObject || selectedObject.type !== 'text') return;

    try {
      const textObject = selectedObject as any;
      textObject[property] = value;
      canvas.renderAll();
      
      setTextProperties(prev => ({ ...prev, [property]: value }));
      saveState();
    } catch (error) {
      console.error('Error updating text property:', error);
    }
  };

  // Update selected shape properties
  const updateShapeProperty = (property: string, value: any, gradientProperty?: string) => {
    if (!canvas || !selectedObject) return;

    try {
      const shapeObject = selectedObject as any;
      
      if (property === 'fillType') {
        setShapeProperties(prev => ({ ...prev, fillType: value }));
        
        if (value === 'color') {
          shapeObject.set({ fill: shapeProperties.fill });
        } else if (value === 'gradient') {
          const gradient = createGradient(
            shapeProperties.gradient,
            shapeObject.width || shapeObject.radius * 2 || 100,
            shapeObject.height || shapeObject.radius * 2 || 100
          );
          if (gradient) {
            shapeObject.set({ fill: gradient });
          }
        }
      } else if (property === 'gradientProperty' && gradientProperty) {
        setShapeProperties(prev => ({
          ...prev,
          gradient: { ...prev.gradient, [gradientProperty]: value }
        }));
        
        if (shapeProperties.fillType === 'gradient') {
          const gradient = createGradient(
            { ...shapeProperties.gradient, [gradientProperty]: value },
            shapeObject.width || shapeObject.radius * 2 || 100,
            shapeObject.height || shapeObject.radius * 2 || 100
          );
          if (gradient) {
            shapeObject.set({ fill: gradient });
          }
        }
      } else if (property === 'radius' && selectedObject.type === 'circle') {
        shapeObject.set({ radius: value });
      } else if (property === 'width' || property === 'height') {
        shapeObject.set({ [property]: value });
        
        // Update gradient if using gradient fill
        if (shapeProperties.fillType === 'gradient') {
          const gradient = createGradient(
            shapeProperties.gradient,
            property === 'width' ? value : (shapeObject.width || 100),
            property === 'height' ? value : (shapeObject.height || 100)
          );
          if (gradient) {
            shapeObject.set({ fill: gradient });
          }
        }
      } else if (property === 'scaleX' || property === 'scaleY') {
        shapeObject.set({ [property]: value });
      } else if (property === 'angle') {
        shapeObject.set({ angle: value });
      } else {
        shapeObject.set({ [property]: value });
      }
      
      canvas.renderAll();
      setShapeProperties(prev => ({ ...prev, [property]: value }));
      saveState();
    } catch (error) {
      console.error('Error updating shape property:', error);
    }
  };

  // Resize canvas
  const resizeCanvas = (width: number, height: number) => {
    if (!canvas) return;

    try {
      canvas.setDimensions({ width, height });
      setCanvasSize({ width, height });
      canvas.renderAll();
      saveState();
    } catch (error) {
      console.error('Error resizing canvas:', error);
    }
  };

  // Rotate canvas view
  const rotateCanvas = (angle: number) => {
    try {
      setCanvasRotation(angle);
    } catch (error) {
      console.error('Error rotating canvas:', error);
    }
  };

  // Reset object transformations
  const resetObjectTransform = () => {
    if (!canvas || !selectedObject) return;

    try {
      selectedObject.set({
        scaleX: 1,
        scaleY: 1,
        angle: 0,
      });
      canvas.renderAll();
      saveState();
    } catch (error) {
      console.error('Error resetting transform:', error);
    }
  };

  // Copy selected object to clipboard
  const copyObject = () => {
    if (!canvas || !selectedObject) return;

    try {
      selectedObject.clone((cloned: any) => {
        setClipboard(cloned);
        toast.success('Object copied to clipboard');
      });
    } catch (error) {
      console.error('Error copying object:', error);
    }
  };

  // Paste object from clipboard
  const pasteObject = () => {
    if (!canvas || !clipboard) return;

    try {
      clipboard.clone((cloned: any) => {
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
          evented: true,
        });
        
        if (cloned.type === 'group') {
          cloned.forEachObject((obj: any) => {
            obj.evented = true;
          });
        }

        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
        saveState();
        toast.success('Object pasted');
      });
    } catch (error) {
      console.error('Error pasting object:', error);
    }
  };

  // Bring object to front
  const bringToFront = () => {
    if (!canvas || !selectedObject) return;

    try {
      canvas.bringToFront(selectedObject);
      canvas.renderAll();
      saveState();
      toast.success('Object brought to front');
    } catch (error) {
      console.error('Error bringing to front:', error);
    }
  };

  // Send object to back
  const sendToBack = () => {
    if (!canvas || !selectedObject) return;

    try {
      canvas.sendToBack(selectedObject);
      canvas.renderAll();
      saveState();
      toast.success('Object sent to back');
    } catch (error) {
      console.error('Error sending to back:', error);
    }
  };

  // Move object up one layer
  const moveUpOneLayer = () => {
    if (!canvas || !selectedObject) return;

    try {
      canvas.bringForward(selectedObject);
      canvas.renderAll();
      saveState();
      toast.success('Object moved up one layer');
    } catch (error) {
      console.error('Error moving up one layer:', error);
    }
  };

  // Move object down one layer
  const moveDownOneLayer = () => {
    if (!canvas || !selectedObject) return;

    try {
      canvas.sendBackwards(selectedObject);
      canvas.renderAll();
      saveState();
      toast.success('Object moved down one layer');
    } catch (error) {
      console.error('Error moving down one layer:', error);
    }
  };

  // Get object layer information
  const getObjectLayerInfo = (obj: any) => {
    if (!canvas || !obj) return { index: -1, total: 0 };
    
    const objects = canvas.getObjects();
    const index = objects.indexOf(obj);
    return {
      index: index + 1, // Make it 1-based for UI
      total: objects.length
    };
  };

  // Move object to specific layer
  const moveToLayer = (layerIndex: number) => {
    if (!canvas || !selectedObject) return;

    try {
      const objects = canvas.getObjects();
      const currentIndex = objects.indexOf(selectedObject);
      const targetIndex = Math.max(0, Math.min(layerIndex - 1, objects.length - 1)); // Convert to 0-based
      
      if (currentIndex !== targetIndex) {
        canvas.moveTo(selectedObject, targetIndex);
        canvas.renderAll();
        saveState();
        toast.success(`Object moved to layer ${targetIndex + 1}`);
      }
    } catch (error) {
      console.error('Error moving to specific layer:', error);
    }
  };

  // Lock/unlock object
  const toggleLock = () => {
    if (!canvas || !selectedObject) return;

    try {
      const isLocked = selectedObject.selectable === false;
      selectedObject.set({
        selectable: isLocked,
        evented: isLocked,
        lockMovementX: !isLocked,
        lockMovementY: !isLocked,
        lockRotation: !isLocked,
        lockScalingX: !isLocked,
        lockScalingY: !isLocked,
      });
      canvas.renderAll();
      toast.success(isLocked ? 'Object unlocked' : 'Object locked');
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      
      // Hide context menu on any key press
      setContextMenu(prev => ({ ...prev, show: false }));

      switch (e.key.toLowerCase()) {
        case 'delete':
        case 'backspace':
          e.preventDefault();
          deleteSelected();
          break;
        case 'c':
          if (isCtrl) {
            e.preventDefault();
            copyObject();
          }
          break;
        case 'v':
          if (isCtrl) {
            e.preventDefault();
            pasteObject();
          }
          break;
        case 'd':
          if (isCtrl) {
            e.preventDefault();
            cloneSelected();
          }
          break;
        case 's':
          if (isCtrl) {
            e.preventDefault();
            saveCurrentProject();
          }
          break;
        case 'z':
          if (isCtrl && !e.shiftKey) {
            e.preventDefault();
            undo();
          }
          break;
        case 'y':
          if (isCtrl) {
            e.preventDefault();
            redo();
          }
          break;
        case 'z':
          if (isCtrl && e.shiftKey) {
            e.preventDefault();
            redo();
          }
          break;
        case 'a':
          if (isCtrl) {
            e.preventDefault();
            // Select all objects
            if (canvas) {
              const selection = new fabric.ActiveSelection(canvas.getObjects(), {
                canvas: canvas,
              });
              canvas.setActiveObject(selection);
              canvas.requestRenderAll();
            }
          }
          break;
        case 'escape':
          e.preventDefault();
          if (showShortcuts) {
            setShowShortcuts(false);
          } else if (canvas) {
            canvas.discardActiveObject();
            canvas.renderAll();
          }
          if (isFullScreen) {
            setIsFullScreen(false);
          }
          break;
        case 'l':
          if (isCtrl) {
            e.preventDefault();
            toggleLock();
          }
          break;
        case ']':
          if (isCtrl && e.shiftKey) {
            e.preventDefault();
            bringToFront();
          } else if (isCtrl) {
            e.preventDefault();
            moveUpOneLayer();
          }
          break;
        case '[':
          if (isCtrl && e.shiftKey) {
            e.preventDefault();
            sendToBack();
          } else if (isCtrl) {
            e.preventDefault();
            moveDownOneLayer();
          }
          break;
        case 't':
          if (isCtrl) {
            e.preventDefault();
            addText();
          }
          break;
        case '?':
        case '/':
          if (e.shiftKey || e.key === '?') {
            e.preventDefault();
            setShowShortcuts(true);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, selectedObject, clipboard, isFullScreen, showShortcuts]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(prev => ({ ...prev, show: false }));
    };

    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.show]);

  // Draggable panel handlers
  const handleLayersPanelMouseDown = (e: React.MouseEvent) => {
    if (!layersPanel.isDraggable) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setLayersPanel(prev => ({
      ...prev,
      isDragging: true,
      dragOffset: {
        x: e.clientX - prev.position.x,
        y: e.clientY - prev.position.y
      }
    }));
  };

  const handleLayersPanelMouseMove = (e: MouseEvent) => {
    if (!layersPanel.isDragging) return;

    const newX = e.clientX - layersPanel.dragOffset.x;
    const newY = e.clientY - layersPanel.dragOffset.y;

    // Keep panel within viewport bounds
    const maxX = window.innerWidth - 300; // panel width
    const maxY = window.innerHeight - 400; // panel height

    setLayersPanel(prev => ({
      ...prev,
      position: {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }
    }));
  };

  const handleLayersPanelMouseUp = () => {
    setLayersPanel(prev => ({ ...prev, isDragging: false }));
  };

  // Mouse event listeners for dragging
  useEffect(() => {
    if (layersPanel.isDragging) {
      document.addEventListener('mousemove', handleLayersPanelMouseMove);
      document.addEventListener('mouseup', handleLayersPanelMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleLayersPanelMouseMove);
        document.removeEventListener('mouseup', handleLayersPanelMouseUp);
      };
    }
  }, [layersPanel.isDragging, layersPanel.dragOffset]);

  const toggleLayersPanelMode = () => {
    setLayersPanel(prev => ({
      ...prev,
      isDraggable: !prev.isDraggable,
      isDragging: false
    }));
  };

  // Project management functions
  const loadProjects = async () => {
    try {
      const response = await fetch('/api/invitation-projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const saveCurrentProject = async (options: { saveAs?: boolean; name?: string } = {}) => {
    if (!canvas) return;

    setIsSaving(true);
    try {
      // Generate thumbnail
      const thumbnail = canvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.2
      });

      // Prepare design data
      const designData = {
        objects: canvas.toJSON(),
        canvasSize,
        canvasRotation,
        textProperties,
        backgroundProperties,
        shapeProperties
      };

      const projectData = {
        name: options.name || currentProject?.name || 'Untitled Project',
        designData,
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
        canvasRotation,
        backgroundColor: backgroundProperties.color,
        backgroundType: backgroundProperties.type,
        backgroundGradient: backgroundProperties.gradient,
        thumbnail
      };

      if (options.saveAs || !currentProject) {
        // Create new project
        const response = await fetch('/api/invitation-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentProject(data.project);
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          toast.success('Project created successfully');
          loadProjects();
        } else {
          throw new Error('Failed to create project');
        }
      } else {
        // Update existing project
        const response = await fetch(`/api/invitation-projects/${currentProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentProject(data.project);
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          toast.success('Project saved successfully');
          loadProjects();
        } else {
          throw new Error('Failed to save project');
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/invitation-projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        const project = data.project;

        // Load design data into canvas
        if (project.designData && canvas) {
          canvas.loadFromJSON(project.designData.objects, () => {
            canvas.renderAll();
            
            // Restore canvas settings
            setCanvasSize({ width: project.canvasWidth, height: project.canvasHeight });
            setCanvasRotation(project.canvasRotation);
            
            // Restore background
            setBackgroundProperties({
              type: project.backgroundType,
              color: project.backgroundColor,
              gradient: project.backgroundGradient || backgroundProperties.gradient
            });
            
            // Apply background
            changeBackground(project.backgroundType, project.backgroundColor);
            
            // Restore other properties if available
            if (project.designData.textProperties) {
              setTextProperties(project.designData.textProperties);
            }
            if (project.designData.shapeProperties) {
              setShapeProperties(project.designData.shapeProperties);
            }
          });
        }

        setCurrentProject(project);
        setHasUnsavedChanges(false);
        setLastSaved(new Date(project.updatedAt));
        toast.success(`Loaded project: ${project.name}`);
      } else {
        throw new Error('Failed to load project');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
    }
  };

  const createNewProject = async (name: string) => {
    if (hasUnsavedChanges) {
      const confirmNew = window.confirm('You have unsaved changes. Create new project anyway?');
      if (!confirmNew) return;
    }

    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }

    // Reset to default state
    if (canvas) {
      canvas.clear();
      addDefaultTemplate(canvas);
    }
    
    setCanvasSize({ width: 600, height: 800 });
    setCanvasRotation(0);
    setBackgroundProperties({
      type: 'color',
      color: '#ffffff',
      gradient: {
        type: 'linear',
        start: '#ffffff',
        end: '#f0f0f0',
        direction: 'to-bottom',
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 1
      }
    });
    
    // Save the new project immediately
    try {
      setIsSaving(true);
      
      // Generate thumbnail
      const thumbnail = canvas?.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.2
      }) || '';

      // Prepare design data
      const designData = {
        objects: canvas?.toJSON() || {},
        canvasSize: { width: 600, height: 800 },
        canvasRotation: 0,
        textProperties,
        backgroundProperties,
        shapeProperties
      };

      const projectData = {
        name: name.trim(),
        designData,
        canvasWidth: 600,
        canvasHeight: 800,
        canvasRotation: 0,
        backgroundColor: '#ffffff',
        backgroundType: 'color',
        backgroundGradient: backgroundProperties.gradient,
        thumbnail
      };

      console.log('Creating project with data:', projectData);

      const response = await fetch('/api/invitation-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentProject(data.project);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        setShowNewProjectForm(false);
        setNewProjectName('');
        toast.success(`Project "${name}" created successfully`);
        loadProjects();
      } else {
        // Get the error details from the response
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to create project: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/invitation-projects/${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Project deleted successfully');
        
        // If we deleted the current project, clear it and show dialog
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
          setShowProjectDialog(true);
        }
        
        loadProjects();
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (currentProject && hasUnsavedChanges && canvas) {
        saveCurrentProject();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [currentProject, hasUnsavedChanges, canvas]);

  // Track changes for unsaved state
  useEffect(() => {
    if (canvas && currentProject) {
      const handleCanvasChange = () => {
        setHasUnsavedChanges(true);
      };

      canvas.on('object:added', handleCanvasChange);
      canvas.on('object:removed', handleCanvasChange);
      canvas.on('object:modified', handleCanvasChange);
      canvas.on('path:created', handleCanvasChange);

      return () => {
        canvas.off('object:added', handleCanvasChange);
        canvas.off('object:removed', handleCanvasChange);
        canvas.off('object:modified', handleCanvasChange);
        canvas.off('path:created', handleCanvasChange);
      };
    }
  }, [canvas, currentProject]);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Show project dialog when no current project
  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Render layers panel content
  const renderLayersContent = () => {
    return (
      <div className="space-y-2">
        {canvas?.getObjects()?.length > 0 ? (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {canvas.getObjects().slice().reverse().map((obj: any, reverseIndex: number) => {
              const actualIndex = canvas.getObjects().length - reverseIndex;
              const isSelected = selectedObject === obj;
              const layerInfo = getObjectLayerInfo(obj);
              
              return (
                <div
                  key={obj.id || reverseIndex}
                  className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
                  onClick={() => {
                    canvas.setActiveObject(obj);
                    canvas.renderAll();
                    setSelectedObject(obj);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 font-mono">{actualIndex}</span>
                    {obj.type === 'text' && <Type className="w-3 h-3 text-blue-600" />}
                    {obj.type === 'rect' && <Square className="w-3 h-3 text-green-600" />}
                    {obj.type === 'circle' && <Circle className="w-3 h-3 text-orange-600" />}
                    {obj.type === 'triangle' && <Triangle className="w-3 h-3 text-purple-600" />}
                    {obj.type === 'image' && <ImageIcon className="w-3 h-3 text-pink-600" />}
                    {obj.type === 'polygon' && <Star className="w-3 h-3 text-yellow-600" />}
                    <span className="truncate max-w-16">
                      {obj.type === 'text' 
                        ? obj.text?.substring(0, 10) + (obj.text?.length > 10 ? '...' : '')
                        : obj.type?.toUpperCase()
                      }
                    </span>
                    {obj.selectable === false && <Lock className="w-3 h-3 text-gray-400" />}
                  </div>
                  <div className="flex items-center space-x-1">
                    {isSelected && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveUpOneLayer();
                          }}
                          disabled={actualIndex === canvas.getObjects().length}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveDownOneLayer();
                          }}
                          disabled={actualIndex === 1}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-xs">
            No objects on canvas
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Higher numbers = front layers</div>
            <div>• Text auto-added to top</div>
            <div>• Click to select object</div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to create gradient
  const createGradient = (gradientConfig: any, width: number, height: number) => {
    if (!fabric) return null;

    const { type, start, end, direction, x1, y1, x2, y2 } = gradientConfig;
    
    let coords = { x1, y1, x2, y2 };
    
    // Handle predefined directions
    if (direction === 'to-bottom') {
      coords = { x1: 0, y1: 0, x2: 0, y2: height };
    } else if (direction === 'to-top') {
      coords = { x1: 0, y1: height, x2: 0, y2: 0 };
    } else if (direction === 'to-right') {
      coords = { x1: 0, y1: 0, x2: width, y2: 0 };
    } else if (direction === 'to-left') {
      coords = { x1: width, y1: 0, x2: 0, y2: 0 };
    } else if (direction === 'to-bottom-right') {
      coords = { x1: 0, y1: 0, x2: width, y2: height };
    } else if (direction === 'to-bottom-left') {
      coords = { x1: width, y1: 0, x2: 0, y2: height };
    } else if (direction === 'to-top-right') {
      coords = { x1: 0, y1: height, x2: width, y2: 0 };
    } else if (direction === 'to-top-left') {
      coords = { x1: width, y1: height, x2: 0, y2: 0 };
    } else if (direction.endsWith('deg')) {
      // Handle angle-based directions
      const angle = parseFloat(direction.replace('deg', ''));
      const radians = (angle * Math.PI) / 180;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.sqrt(width * width + height * height) / 2;
      
      coords = {
        x1: centerX - radius * Math.cos(radians),
        y1: centerY - radius * Math.sin(radians),
        x2: centerX + radius * Math.cos(radians),
        y2: centerY + radius * Math.sin(radians)
      };
    }

    if (type === 'radial') {
      return new fabric.Gradient({
        type: 'radial',
        coords: {
          x1: width / 2,
          y1: height / 2,
          x2: width / 2,
          y2: height / 2,
          r1: 0,
          r2: Math.max(width, height) / 2
        },
        colorStops: [
          { offset: 0, color: start },
          { offset: 1, color: end }
        ]
      });
    }

    return new fabric.Gradient({
      type: 'linear',
      coords,
      colorStops: [
        { offset: 0, color: start },
        { offset: 1, color: end }
      ]
    });
  };

  // Change background
  const changeBackground = (type: string, value: any, gradientProperty?: string) => {
    if (!canvas) return;

    try {
      if (type === 'color') {
        canvas.setBackgroundColor(value, canvas.renderAll.bind(canvas));
        setBackgroundProperties(prev => ({ ...prev, color: value, type: 'color' }));
        saveState();
      } else if (type === 'gradient') {
        if (gradientProperty) {
          setBackgroundProperties(prev => ({
            ...prev,
            gradient: { ...prev.gradient, [gradientProperty]: value }
          }));
          
          // Apply the gradient
          const gradient = createGradient(
            { ...backgroundProperties.gradient, [gradientProperty]: value },
            canvasSize.width,
            canvasSize.height
          );
          if (gradient) {
            canvas.setBackgroundColor(gradient, canvas.renderAll.bind(canvas));
            setBackgroundProperties(prev => ({ ...prev, type: 'gradient' }));
            saveState();
          }
        } else {
          // Full gradient update
          const gradient = createGradient(value, canvasSize.width, canvasSize.height);
          if (gradient) {
            canvas.setBackgroundColor(gradient, canvas.renderAll.bind(canvas));
            setBackgroundProperties(prev => ({ ...prev, gradient: value, type: 'gradient' }));
            saveState();
          }
        }
      }
    } catch (error) {
      console.error('Error changing background:', error);
    }
  };

  // Delete selected object
  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;
    
    try {
      canvas.remove(selectedObject);
      canvas.renderAll();
      setSelectedObject(null);
      saveState();
    } catch (error) {
      console.error('Error deleting object:', error);
    }
  };

  // Clone selected object
  const cloneSelected = () => {
    if (!canvas || !selectedObject) return;
    
    try {
      selectedObject.clone((cloned: any) => {
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
        saveState();
      });
    } catch (error) {
      console.error('Error cloning object:', error);
    }
  };

  // Export canvas as image
  const exportImage = () => {
    if (!canvas) return;
    
    try {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2, // Higher resolution
      });
      
      // Download image
      const link = document.createElement('a');
      link.download = `invitation-${event?.name || 'card'}.png`;
      link.href = dataURL;
      link.click();
      
      if (onExport) {
        onExport(dataURL);
      }
      
      toast.success('Invitation exported successfully!');
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error('Failed to export image');
    }
  };

  // Save design
  const saveDesign = () => {
    if (!canvas) return;
    
    try {
      const designData = {
        canvas: canvas.toJSON(),
        metadata: {
          eventId: event?.id,
          guestName,
          createdAt: new Date().toISOString(),
        }
      };
      
      if (onSave) {
        onSave(designData);
      }
      
      toast.success('Design saved successfully!');
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
    }
  };

  // Toggle full screen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Handle escape key for full screen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isFullScreen]);

  const containerClasses = isFullScreen 
    ? "fixed inset-0 z-50 bg-gray-100 flex" 
    : "flex h-screen bg-gray-100";

  if (!fabricLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading design tools...</p>
        </div>
      </div>
    );
  }

  // Show project selection interface when no project is selected
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invitation Projects</h1>
            <p className="text-gray-600">Create and manage your invitation card designs</p>
          </div>

          {/* Create New Project Card */}
          {!showNewProjectForm ? (
            <div className="mb-8">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => setShowNewProjectForm(true)}
              >
                <div className="text-center">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Project</h3>
                  <p className="text-gray-500">Start designing a new invitation card</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName" className="text-sm font-medium text-gray-700">
                      Project Name
                    </Label>
                    <Input
                      id="projectName"
                      placeholder="Enter project name..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newProjectName.trim() && !isSaving) {
                          createNewProject(newProjectName);
                        } else if (e.key === 'Escape') {
                          setShowNewProjectForm(false);
                          setNewProjectName('');
                        }
                      }}
                      className="mt-1"
                      autoFocus
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => createNewProject(newProjectName)}
                      disabled={!newProjectName.trim() || isSaving}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {isSaving ? 'Creating...' : 'Create Project'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowNewProjectForm(false);
                        setNewProjectName('');
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadProject(project.id)}
                  >
                    {/* Project Thumbnail */}
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {project.thumbnail ? (
                        <img 
                          src={project.thumbnail} 
                          alt={project.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <FileText className="w-16 h-16 mx-auto mb-2" />
                          <span className="text-sm">No Preview</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Project Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate" title={project.name}>
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-3 text-xs text-gray-400 mt-3">
                            <span>{project.canvasWidth}×{project.canvasHeight}</span>
                            <span>v{project.version}</span>
                            {project.lastOpenedAt && (
                              <span>
                                {new Date(project.lastOpenedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Project Actions */}
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                            title="Delete Project"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !showNewProjectForm && (
            <div className="text-center py-12">
              <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-500 mb-4">Create your first invitation project to get started</p>
              <Button onClick={() => setShowNewProjectForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={containerClasses}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Left Toolbar */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Design Tools</h3>
            <div className="flex space-x-2">
              <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    title="Show Keyboard Shortcuts"
                  >
                    <Keyboard className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Keyboard className="w-5 h-5 mr-2" />
                      Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                      Speed up your workflow with these shortcuts
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Copy className="w-4 h-4 mr-2" />
                        Editing
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Copy object</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+C</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Paste object</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+V</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Duplicate object</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+D</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Save project</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Delete object</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Del</kbd>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Undo className="w-4 h-4 mr-2" />
                        History
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Undo</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Z</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Redo</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Y</kbd>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <MousePointer className="w-4 h-4 mr-2" />
                        Selection
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Select all</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+A</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Deselect all</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Type className="w-4 h-4 mr-2" />
                        Creation & Layers
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Add text</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+T</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Lock/unlock</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+L</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Move up one layer</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+]</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Move down one layer</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+[</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Bring to front</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+]</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Send to back</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+[</kbd>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center mb-1">
                          <MousePointer className="w-4 h-4 mr-2" />
                          <span className="font-medium">Mouse Actions:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs ml-6">
                          <li>Right-click for context menu</li>
                          <li>Drag corners to resize</li>
                          <li>Drag top handle to rotate</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleFullScreen}
                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
              >
                {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="elements" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="elements">Elements</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="elements" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Basic Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={() => addText()} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Add Text
                  </Button>
                  <Button 
                    onClick={uploadImage} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Shapes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={addRectangle} 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                    >
                      <Square className="w-3 h-3 mr-1" />
                      Rectangle
                    </Button>
                    <Button 
                      onClick={addCircle} 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                    >
                      <Circle className="w-3 h-3 mr-1" />
                      Circle
                    </Button>
                    <Button 
                      onClick={addTriangle} 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                    >
                      <Triangle className="w-3 h-3 mr-1" />
                      Triangle
                    </Button>
                    <Button 
                      onClick={addStar} 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Star
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={addHeart} 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      Heart
                    </Button>
                    <Button 
                      onClick={addLine} 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                    >
                      <Minus className="w-3 h-3 mr-1" />
                      Line
                    </Button>
                  </div>
                  <Button 
                    onClick={addBorder} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Square className="w-3 h-3 mr-2" />
                    Border Frame
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Event Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dataPlaceholders.map((placeholder) => (
                    <Button
                      key={placeholder.key}
                      onClick={() => addDataPlaceholder(placeholder)}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      {placeholder.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="properties" className="space-y-4">
              {/* Layers Panel */}
              {!layersPanel.isDraggable && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div className="flex items-center">
                        <Shapes className="w-4 h-4 mr-2" />
                        Layers ({canvas?.getObjects()?.length || 0})
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleLayersPanelMode}
                        title="Make draggable"
                        className="h-6 w-6 p-0"
                      >
                        <Expand className="w-3 h-3" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderLayersContent()}
                  </CardContent>
                </Card>
              )}

              {/* Canvas Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Monitor className="w-4 h-4 mr-2" />
                    Canvas Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Canvas Size</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-xs text-gray-500">Width</Label>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resizeCanvas(Math.max(200, canvasSize.width - 50), canvasSize.height)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs w-12 text-center">{canvasSize.width}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resizeCanvas(canvasSize.width + 50, canvasSize.height)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Height</Label>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resizeCanvas(canvasSize.width, Math.max(200, canvasSize.height - 50))}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs w-12 text-center">{canvasSize.height}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resizeCanvas(canvasSize.width, canvasSize.height + 50)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resizeCanvas(600, 800)}
                        className="text-xs"
                      >
                        <Smartphone className="w-3 h-3 mr-1" />
                        Portrait
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resizeCanvas(800, 600)}
                        className="text-xs"
                      >
                        <Monitor className="w-3 h-3 mr-1" />
                        Landscape
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Canvas Rotation</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rotateCanvas((canvasRotation - 90) % 360)}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                      <span className="text-sm w-12 text-center">{canvasRotation}°</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rotateCanvas((canvasRotation + 90) % 360)}
                      >
                        <RotateCw className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rotateCanvas(0)}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Background</Label>
                    <div className="space-y-3 mt-2">
                      <div>
                        <Select
                          value={backgroundProperties.type}
                          onValueChange={(value) => {
                            setBackgroundProperties(prev => ({ ...prev, type: value }));
                            if (value === 'color') {
                              changeBackground('color', backgroundProperties.color);
                            } else if (value === 'gradient') {
                              changeBackground('gradient', backgroundProperties.gradient);
                            }
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="color">Solid Color</SelectItem>
                            <SelectItem value="gradient">Gradient</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {backgroundProperties.type === 'color' && (
                        <div>
                          <Label className="text-xs text-gray-500">Color</Label>
                          <Input
                            type="color"
                            value={backgroundProperties.color}
                            onChange={(e) => changeBackground('color', e.target.value)}
                            className="mt-1 h-8"
                          />
                        </div>
                      )}

                      {backgroundProperties.type === 'gradient' && (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-gray-500">Gradient Type</Label>
                            <Select
                              value={backgroundProperties.gradient.type}
                              onValueChange={(value) => changeBackground('gradient', value, 'type')}
                            >
                              <SelectTrigger className="h-8 mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="linear">Linear</SelectItem>
                                <SelectItem value="radial">Radial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {backgroundProperties.gradient.type === 'linear' && (
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-500">Direction</Label>
                              <Select
                                value={backgroundProperties.gradient.direction}
                                onValueChange={(value) => changeBackground('gradient', value, 'direction')}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="to-bottom">↓ Top to Bottom</SelectItem>
                                  <SelectItem value="to-top">↑ Bottom to Top</SelectItem>
                                  <SelectItem value="to-right">→ Left to Right</SelectItem>
                                  <SelectItem value="to-left">← Right to Left</SelectItem>
                                  <SelectItem value="to-bottom-right">↘ Top-Left to Bottom-Right</SelectItem>
                                  <SelectItem value="to-bottom-left">↙ Top-Right to Bottom-Left</SelectItem>
                                  <SelectItem value="to-top-right">↗ Bottom-Left to Top-Right</SelectItem>
                                  <SelectItem value="to-top-left">↖ Bottom-Right to Top-Left</SelectItem>
                                  <SelectItem value="45deg">↗ 45° Diagonal</SelectItem>
                                  <SelectItem value="135deg">↘ 135° Diagonal</SelectItem>
                                  <SelectItem value="225deg">↙ 225° Diagonal</SelectItem>
                                  <SelectItem value="315deg">↖ 315° Diagonal</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <div className="grid grid-cols-4 gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 p-1"
                                  onClick={() => changeBackground('gradient', 'to-top', 'direction')}
                                  title="Top to Bottom"
                                >
                                  ↓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 p-1"
                                  onClick={() => changeBackground('gradient', 'to-right', 'direction')}
                                  title="Left to Right"
                                >
                                  →
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 p-1"
                                  onClick={() => changeBackground('gradient', 'to-bottom', 'direction')}
                                  title="Bottom to Top"
                                >
                                  ↑
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 p-1"
                                  onClick={() => changeBackground('gradient', 'to-left', 'direction')}
                                  title="Right to Left"
                                >
                                  ←
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-gray-500">Start Color</Label>
                              <Input
                                type="color"
                                value={backgroundProperties.gradient.start}
                                onChange={(e) => changeBackground('gradient', e.target.value, 'start')}
                                className="mt-1 h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">End Color</Label>
                              <Input
                                type="color"
                                value={backgroundProperties.gradient.end}
                                onChange={(e) => changeBackground('gradient', e.target.value, 'end')}
                                className="mt-1 h-8"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Text Properties */}
              {selectedObject?.type === 'text' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Type className="w-4 h-4 mr-2" />
                      Text Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Font Size</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTextProperty('fontSize', Math.max(8, textProperties.fontSize - 2))}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{textProperties.fontSize}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTextProperty('fontSize', textProperties.fontSize + 2)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Font Family</Label>
                      <Select 
                        value={textProperties.fontFamily}
                        onValueChange={(value) => updateTextProperty('fontFamily', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Color</Label>
                      <Input
                        type="color"
                        value={textProperties.fill}
                        onChange={(e) => updateTextProperty('fill', e.target.value)}
                        className="mt-1 h-8"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={textProperties.fontWeight === 'bold' ? 'default' : 'outline'}
                        onClick={() => updateTextProperty('fontWeight', 
                          textProperties.fontWeight === 'bold' ? 'normal' : 'bold')}
                      >
                        <Bold className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={textProperties.fontStyle === 'italic' ? 'default' : 'outline'}
                        onClick={() => updateTextProperty('fontStyle', 
                          textProperties.fontStyle === 'italic' ? 'normal' : 'italic')}
                      >
                        <Italic className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shape Properties */}
              {selectedObject && ['rect', 'circle', 'triangle', 'polygon', 'group', 'image', 'line'].includes(selectedObject.type) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Shapes className="w-4 h-4 mr-2" />
                      {selectedObject.type === 'image' ? 'Image' : 'Shape'} Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Transform Controls */}
                    <div>
                      <Label className="text-xs">Transform</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <Label className="text-xs text-gray-500">Scale X</Label>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('scaleX', Math.max(0.1, shapeProperties.scaleX - 0.1))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs w-8 text-center">{shapeProperties.scaleX.toFixed(1)}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('scaleX', shapeProperties.scaleX + 0.1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Scale Y</Label>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('scaleY', Math.max(0.1, shapeProperties.scaleY - 0.1))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs w-8 text-center">{shapeProperties.scaleY.toFixed(1)}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('scaleY', shapeProperties.scaleY + 0.1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Rotation</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateShapeProperty('angle', shapeProperties.angle - 15)}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        <span className="text-sm w-12 text-center">{Math.round(shapeProperties.angle)}°</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateShapeProperty('angle', shapeProperties.angle + 15)}
                        >
                          <RotateCw className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={resetObjectTransform}
                          title="Reset Transform"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Layer Management */}
                    <div>
                      <Label className="text-xs">Layer Order</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Layer {getObjectLayerInfo(selectedObject).index} of {getObjectLayerInfo(selectedObject).total}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2"
                              onClick={bringToFront}
                              title="Bring to Front"
                            >
                              <ChevronUp className="w-3 h-3" />
                              <ChevronUp className="w-3 h-3 -ml-1" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2"
                              onClick={moveUpOneLayer}
                              title="Move Up One Layer"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2"
                              onClick={moveDownOneLayer}
                              title="Move Down One Layer"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2"
                              onClick={sendToBack}
                              title="Send to Back"
                            >
                              <ChevronDown className="w-3 h-3" />
                              <ChevronDown className="w-3 h-3 -ml-1" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Move to Layer</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input
                              type="number"
                              min="1"
                              max={getObjectLayerInfo(selectedObject).total}
                              value={getObjectLayerInfo(selectedObject).index}
                              onChange={(e) => {
                                const layerIndex = parseInt(e.target.value);
                                if (!isNaN(layerIndex)) {
                                  moveToLayer(layerIndex);
                                }
                              }}
                              className="h-6 text-xs"
                            />
                            <span className="text-xs text-gray-400">
                              of {getObjectLayerInfo(selectedObject).total}
                            </span>
                          </div>
                        </div>

                        {selectedObject?.type === 'text' && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2">
                            <div className="flex items-center space-x-2">
                              <Type className="w-3 h-3 text-blue-600" />
                              <span className="text-xs text-blue-700">Text is on top layer</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedObject.type === 'image' && (
                      <div>
                        <Label className="text-xs">Image Filters</Label>
                        <div className="space-y-2 mt-2">
                          <div>
                            <Label className="text-xs text-gray-500">Brightness</Label>
                            <Slider
                              value={[selectedObject?.filters?.brightness?.brightness || 0]}
                              onValueChange={(value) => {
                                if (selectedObject) {
                                  const filter = new fabric.Image.filters.Brightness({
                                    brightness: value[0]
                                  });
                                  selectedObject.filters = [filter];
                                  selectedObject.applyFilters();
                                  canvas.renderAll();
                                }
                              }}
                              max={1}
                              min={-1}
                              step={0.1}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs text-gray-500">Contrast</Label>
                            <Slider
                              value={[selectedObject?.filters?.contrast?.contrast || 0]}
                              onValueChange={(value) => {
                                if (selectedObject) {
                                  const filter = new fabric.Image.filters.Contrast({
                                    contrast: value[0]
                                  });
                                  selectedObject.filters = [filter];
                                  selectedObject.applyFilters();
                                  canvas.renderAll();
                                }
                              }}
                              max={1}
                              min={-1}
                              step={0.1}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedObject.type !== 'image' && (
                      <>
                        <div>
                          <Label className="text-xs">Fill</Label>
                          <div className="space-y-3 mt-2">
                            <div>
                              <Select
                                value={shapeProperties.fillType}
                                onValueChange={(value) => updateShapeProperty('fillType', value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="color">Solid Color</SelectItem>
                                  <SelectItem value="gradient">Gradient</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {shapeProperties.fillType === 'color' && (
                              <div>
                                <Label className="text-xs text-gray-500">Color</Label>
                                <Input
                                  type="color"
                                  value={shapeProperties.fill}
                                  onChange={(e) => updateShapeProperty('fill', e.target.value)}
                                  className="mt-1 h-8"
                                />
                              </div>
                            )}

                            {shapeProperties.fillType === 'gradient' && (
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs text-gray-500">Gradient Type</Label>
                                  <Select
                                    value={shapeProperties.gradient.type}
                                    onValueChange={(value) => updateShapeProperty('gradientProperty', value, 'type')}
                                  >
                                    <SelectTrigger className="h-8 mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="linear">Linear</SelectItem>
                                      <SelectItem value="radial">Radial</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {shapeProperties.gradient.type === 'linear' && (
                                  <div className="space-y-2">
                                    <Label className="text-xs text-gray-500">Direction</Label>
                                    <Select
                                      value={shapeProperties.gradient.direction}
                                      onValueChange={(value) => updateShapeProperty('gradientProperty', value, 'direction')}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="to-bottom">↓ Top to Bottom</SelectItem>
                                        <SelectItem value="to-top">↑ Bottom to Top</SelectItem>
                                        <SelectItem value="to-right">→ Left to Right</SelectItem>
                                        <SelectItem value="to-left">← Right to Left</SelectItem>
                                        <SelectItem value="to-bottom-right">↘ Top-Left to Bottom-Right</SelectItem>
                                        <SelectItem value="to-bottom-left">↙ Top-Right to Bottom-Left</SelectItem>
                                        <SelectItem value="to-top-right">↗ Bottom-Left to Top-Right</SelectItem>
                                        <SelectItem value="to-top-left">↖ Bottom-Right to Top-Left</SelectItem>
                                        <SelectItem value="45deg">↗ 45° Diagonal</SelectItem>
                                        <SelectItem value="135deg">↘ 135° Diagonal</SelectItem>
                                        <SelectItem value="225deg">↙ 225° Diagonal</SelectItem>
                                        <SelectItem value="315deg">↖ 315° Diagonal</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    
                                    <div className="grid grid-cols-4 gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 p-1"
                                        onClick={() => updateShapeProperty('gradientProperty', 'to-top', 'direction')}
                                        title="Top to Bottom"
                                      >
                                        ↓
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 p-1"
                                        onClick={() => updateShapeProperty('gradientProperty', 'to-right', 'direction')}
                                        title="Left to Right"
                                      >
                                        →
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 p-1"
                                        onClick={() => updateShapeProperty('gradientProperty', 'to-bottom', 'direction')}
                                        title="Bottom to Top"
                                      >
                                        ↑
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 p-1"
                                        onClick={() => updateShapeProperty('gradientProperty', 'to-left', 'direction')}
                                        title="Right to Left"
                                      >
                                        ←
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs text-gray-500">Start Color</Label>
                                    <Input
                                      type="color"
                                      value={shapeProperties.gradient.start}
                                      onChange={(e) => updateShapeProperty('gradientProperty', e.target.value, 'start')}
                                      className="mt-1 h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">End Color</Label>
                                    <Input
                                      type="color"
                                      value={shapeProperties.gradient.end}
                                      onChange={(e) => updateShapeProperty('gradientProperty', e.target.value, 'end')}
                                      className="mt-1 h-8"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Stroke Color</Label>
                          <Input
                            type="color"
                            value={shapeProperties.stroke}
                            onChange={(e) => updateShapeProperty('stroke', e.target.value)}
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Stroke Width</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('strokeWidth', Math.max(0, shapeProperties.strokeWidth - 1))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{shapeProperties.strokeWidth}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('strokeWidth', shapeProperties.strokeWidth + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label className="text-xs">Opacity</Label>
                      <Slider
                        value={[shapeProperties.opacity]}
                        onValueChange={(value) => updateShapeProperty('opacity', value[0])}
                        max={1}
                        min={0}
                        step={0.01}
                        className="mt-2"
                      />
                      <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                        <span>{Math.round(shapeProperties.opacity * 100)}%</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => updateShapeProperty('opacity', 0.25)}
                          >
                            25%
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => updateShapeProperty('opacity', 0.5)}
                            
                          >
                            50%
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => updateShapeProperty('opacity', 1)}
                          >
                            100%
                          </Button>
                        </div>
                      </div>
                    </div>

                    {(selectedObject.type === 'rect' || selectedObject.type === 'triangle') && (
                      <>
                        <div>
                          <Label className="text-xs">Width</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('width', Math.max(10, shapeProperties.width - 10))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm w-12 text-center">{shapeProperties.width}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('width', shapeProperties.width + 10)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Height</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('height', Math.max(10, shapeProperties.height - 10))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm w-12 text-center">{shapeProperties.height}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateShapeProperty('height', shapeProperties.height + 10)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedObject.type === 'circle' && (
                      <div>
                        <Label className="text-xs">Radius</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateShapeProperty('radius', Math.max(5, shapeProperties.radius - 5))}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm w-12 text-center">{shapeProperties.radius}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateShapeProperty('radius', shapeProperties.radius + 5)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {!selectedObject && (
                                 <div className="text-center text-gray-500 text-sm py-8">
                   <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
                   Select an element to edit its properties
                 </div>
               )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={undo} 
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={redo} 
                disabled={historyIndex >= history.length - 1}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={copyObject} 
                disabled={!selectedObject}
                title="Copy (Ctrl+C)"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={pasteObject} 
                disabled={!clipboard}
                title="Paste (Ctrl+V)"
              >
                <ClipboardPaste className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={deleteSelected} 
                disabled={!selectedObject}
                title="Delete (Del)"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={cloneSelected} 
                disabled={!selectedObject}
                title="Duplicate (Ctrl+D)"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={bringToFront} 
                disabled={!selectedObject}
                title="Bring to Front (Ctrl+])"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={moveUpOneLayer} 
                disabled={!selectedObject}
                title="Move Up One Layer"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={moveDownOneLayer} 
                disabled={!selectedObject}
                title="Move Down One Layer"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={sendToBack} 
                disabled={!selectedObject}
                title="Send to Back (Ctrl+[)"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={toggleLock} 
                disabled={!selectedObject}
                title="Lock/Unlock (Ctrl+L)"
              >
                {selectedObject?.selectable === false ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Project Management */}
              <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      const confirmNew = window.confirm('You have unsaved changes. Create new project anyway?');
                      if (!confirmNew) return;
                    }
                    setCurrentProject(null);
                    setShowNewProjectForm(true);
                  }}
                  title="New Project"
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      const confirmOpen = window.confirm('You have unsaved changes. Open projects anyway?');
                      if (!confirmOpen) return;
                    }
                    setCurrentProject(null);
                    setShowNewProjectForm(false);
                  }}
                  title="Open Project"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant={hasUnsavedChanges ? "default" : "outline"}
                  onClick={() => saveCurrentProject()}
                  disabled={isSaving}
                  title={currentProject ? "Save Project" : "Save As New Project"}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Project Status */}
              {currentProject && (
                <div className="text-xs text-gray-600 flex items-center space-x-2">
                  <span className="font-medium">{currentProject.name}</span>
                  {hasUnsavedChanges && <span className="text-orange-500">•</span>}
                  {lastSaved && (
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              )}

              {isFullScreen && (
                <Button size="sm" variant="outline" onClick={toggleFullScreen}>
                  <X className="w-4 h-4 mr-1" />
                  Exit Full Screen
                </Button>
              )}
              <Button size="sm" onClick={exportImage}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 flex flex-col">
          <div 
            className="flex-1 flex items-center justify-center p-8 bg-gray-100"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div 
              className="bg-white shadow-lg transition-transform duration-300"
              style={{ 
                transform: `rotate(${canvasRotation}deg)`,
                transformOrigin: 'center center'
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <canvas ref={canvasRef} />
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="bg-white border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>Canvas: {canvasSize.width} × {canvasSize.height}</span>
              {selectedObject && (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                  {selectedObject.type?.toUpperCase()} selected
                  {selectedObject?.selectable === false && (
                    <Lock className="w-3 h-3 ml-1 text-yellow-500" />
                  )}
                </span>
              )}
              {clipboard && (
                <span className="flex items-center text-green-600">
                  <Clipboard className="w-3 h-3 mr-1" />
                  Clipboard ready
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <span>Right-click for context menu</span>
              {contextMenu.show && (
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Context menu active
                </span>
              )}
              <button 
                onClick={() => setShowShortcuts(true)}
                className="underline hover:text-blue-600"
              >
                Press ? for shortcuts
              </button>
              <span>Objects: {canvas?.getObjects()?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.target ? (
            // Object context menu
            <>
              <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100 mb-1">
                {contextMenu.target.type?.toUpperCase() || 'OBJECT'}
              </div>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  copyObject();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy <span className="ml-auto text-xs text-gray-400">Ctrl+C</span>
              </button>
              
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  cloneSelected();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate <span className="ml-auto text-xs text-gray-400">Ctrl+D</span>
              </button>

              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  deleteSelected();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete <span className="ml-auto text-xs text-gray-400">Del</span>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  bringToFront();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <ChevronUp className="w-4 h-4 mr-2" />
                Bring to Front <span className="ml-auto text-xs text-gray-400">Ctrl+]</span>
              </button>

              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  moveUpOneLayer();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <ChevronUp className="w-4 h-4 mr-2" />
                Move Up One Layer
              </button>

              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  moveDownOneLayer();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Move Down One Layer
              </button>

              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  sendToBack();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Send to Back <span className="ml-auto text-xs text-gray-400">Ctrl+[</span>
              </button>

              {contextMenu.target && (
                <div className="px-3 py-1 text-xs text-gray-500 border-t border-gray-100 mt-1">
                  Layer {getObjectLayerInfo(contextMenu.target).index} of {getObjectLayerInfo(contextMenu.target).total}
                </div>
              )}

              <div className="border-t border-gray-100 my-1"></div>

              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  toggleLock();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                {contextMenu.target?.selectable === false ? (
                  <Unlock className="w-4 h-4 mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {contextMenu.target?.selectable === false ? 'Unlock' : 'Lock'} <span className="ml-auto text-xs text-gray-400">Ctrl+L</span>
              </button>

              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  resetObjectTransform();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Transform
              </button>
            </>
          ) : (
            // Canvas context menu
            <>
              <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100 mb-1">
                CANVAS
              </div>
              
              {clipboard && (
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    pasteObject();
                    setContextMenu(prev => ({ ...prev, show: false }));
                  }}
                >
                  <ClipboardPaste className="w-4 h-4 mr-2" />
                  Paste <span className="ml-auto text-xs text-gray-400">Ctrl+V</span>
                </button>
              )}

              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  addText();
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <Type className="w-4 h-4 mr-2" />
                Add Text <span className="ml-auto text-xs text-gray-400">Ctrl+T</span>
              </button>

              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => {
                  if (canvas) {
                    const selection = new fabric.ActiveSelection(canvas.getObjects(), {
                      canvas: canvas,
                    });
                    canvas.setActiveObject(selection);
                    canvas.requestRenderAll();
                  }
                  setContextMenu(prev => ({ ...prev, show: false }));
                }}
              >
                <MousePointer className="w-4 h-4 mr-2" />
                Select All <span className="ml-auto text-xs text-gray-400">Ctrl+A</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Floating Draggable Layers Panel */}
      {layersPanel.isDraggable && (
        <div 
          className={`fixed bg-white rounded-lg shadow-lg border border-gray-200 w-80 z-50 ${
            layersPanel.isDragging ? 'cursor-grabbing select-none' : 'cursor-auto'
          }`}
          style={{
            left: `${layersPanel.position.x}px`,
            top: `${layersPanel.position.y}px`,
          }}
        >
          {/* Drag Handle */}
          <div 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg border-b border-gray-200 cursor-grab active:cursor-grabbing"
            onMouseDown={handleLayersPanelMouseDown}
          >
            <div className="flex items-center">
              <Move3D className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm font-medium flex items-center">
                <Shapes className="w-4 h-4 mr-2" />
                Layers ({canvas?.getObjects()?.length || 0})
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleLayersPanelMode}
                title="Dock to sidebar"
                className="h-6 w-6 p-0"
              >
                <Minimize className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setLayersPanel(prev => ({ ...prev, isDraggable: false }))}
                title="Close"
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Panel Content */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {renderLayersContent()}
          </div>
        </div>
      )}


    </div>
  );
};

export default InvitationDesigner; 