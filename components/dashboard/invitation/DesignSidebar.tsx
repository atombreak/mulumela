'use client';

import React, { useState } from 'react';
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
import { 
  Type, 
  Upload, 
  Square, 
  Circle,
  Triangle,
  Star,
  Heart,
  Minus,
  Plus,
  Shapes,
  Monitor,
  Smartphone,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Keyboard,
  Maximize,
  Minimize,
  Copy,
  Undo,
  MousePointer,
  Bold,
  Italic,
  Underline,
  X,
  Clock,
  Expand
} from 'lucide-react';

interface DesignSidebarProps {
  // Canvas properties
  canvasSize: { width: number; height: number };
  canvasRotation: number;
  onResizeCanvas: (width: number, height: number) => void;
  onRotateCanvas: (angle: number) => void;
  
  // Background properties
  backgroundProperties: any;
  onChangeBackground: (type: string, value: any, gradientProperty?: string, imageProperty?: string) => void;
  onUploadBackgroundImage: () => void;
  
  // Text properties
  textProperties: any;
  onUpdateTextProperty: (property: string, value: any) => void;
  
  // Shape properties
  shapeProperties: any;
  onUpdateShapeProperty: (property: string, value: any, gradientProperty?: string) => void;
  onResetObjectTransform: () => void;
  
  // Elements
  onAddText: (text?: string) => void;
  onUploadImage: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onAddTriangle: () => void;
  onAddStar: () => void;
  onAddHeart: () => void;
  onAddLine: () => void;
  onAddBorder: () => void;
  
  // Data placeholders
  dataPlaceholders: any[];
  onAddDataPlaceholder: (placeholder: any) => void;
  
  // Selection
  selectedObject: any;
  
  // Layers
  canvas: any;
  layersPanel: any;
  onToggleLayersPanelMode: () => void;
  renderLayersContent: () => React.ReactNode;
  
  // Other
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  
  // Save status
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved';
  lastSaved: Date | null;
  fonts: string[];
}

export const DesignSidebar: React.FC<DesignSidebarProps> = ({
  canvasSize,
  canvasRotation,
  onResizeCanvas,
  onRotateCanvas,
  backgroundProperties,
  onChangeBackground,
  onUploadBackgroundImage,
  textProperties,
  onUpdateTextProperty,
  shapeProperties,
  onUpdateShapeProperty,
  onResetObjectTransform,
  onAddText,
  onUploadImage,
  onAddRectangle,
  onAddCircle,
  onAddTriangle,
  onAddStar,
  onAddHeart,
  onAddLine,
  onAddBorder,
  dataPlaceholders,
  onAddDataPlaceholder,
  selectedObject,
  canvas,
  layersPanel,
  onToggleLayersPanelMode,
  renderLayersContent,
  showShortcuts,
  setShowShortcuts,
  isFullScreen,
  onToggleFullScreen,
  saveStatus,
  lastSaved,
  fonts
}) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold">Design Tools</h3>
            <div className="flex items-center space-x-2">
              {saveStatus === 'saving' && (
                <div className="flex items-center text-xs text-blue-600">
                  <div className="w-3 h-3 animate-spin rounded-full border border-blue-600 border-t-transparent mr-1" />
                  Saving...
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-1" />
                  Saved {lastSaved && `at ${lastSaved.toLocaleTimeString()}`}
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center text-xs text-red-600">
                  <div className="w-3 h-3 rounded-full bg-red-600 mr-1" />
                  Save failed
                </div>
              )}
              {saveStatus === 'unsaved' && (
                <div className="flex items-center text-xs text-yellow-600">
                  <div className="w-3 h-3 rounded-full bg-yellow-600 mr-1" />
                  Unsaved changes
                </div>
              )}
            </div>
          </div>
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
                        <span>Save project</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleFullScreen}
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
                  onClick={() => onAddText()} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
                <Button 
                  onClick={onUploadImage} 
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
                    onClick={onAddRectangle} 
                    variant="outline" 
                    size="sm"
                    className="justify-start"
                  >
                    <Square className="w-3 h-3 mr-1" />
                    Rectangle
                  </Button>
                  <Button 
                    onClick={onAddCircle} 
                    variant="outline" 
                    size="sm"
                    className="justify-start"
                  >
                    <Circle className="w-3 h-3 mr-1" />
                    Circle
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={onAddTriangle} 
                    variant="outline" 
                    size="sm"
                    className="justify-start"
                  >
                    <Triangle className="w-3 h-3 mr-1" />
                    Triangle
                  </Button>
                  <Button 
                    onClick={onAddStar} 
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
                    onClick={onAddHeart} 
                    variant="outline" 
                    size="sm"
                    className="justify-start"
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    Heart
                  </Button>
                  <Button 
                    onClick={onAddLine} 
                    variant="outline" 
                    size="sm"
                    className="justify-start"
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    Line
                  </Button>
                </div>
                <Button 
                  onClick={onAddBorder} 
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
                    onClick={() => onAddDataPlaceholder(placeholder)}
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
                      onClick={onToggleLayersPanelMode}
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
                          onClick={() => onResizeCanvas(Math.max(200, canvasSize.width - 50), canvasSize.height)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-xs w-12 text-center">{canvasSize.width}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResizeCanvas(canvasSize.width + 50, canvasSize.height)}
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
                          onClick={() => onResizeCanvas(canvasSize.width, Math.max(200, canvasSize.height - 50))}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-xs w-12 text-center">{canvasSize.height}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResizeCanvas(canvasSize.width, canvasSize.height + 50)}
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
                      onClick={() => onResizeCanvas(600, 800)}
                      className="text-xs"
                    >
                      <Smartphone className="w-3 h-3 mr-1" />
                      Portrait
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResizeCanvas(800, 600)}
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
                      onClick={() => onRotateCanvas((canvasRotation - 90) % 360)}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <span className="text-sm w-12 text-center">{canvasRotation}°</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRotateCanvas((canvasRotation + 90) % 360)}
                    >
                      <RotateCw className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRotateCanvas(0)}
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
                          if (value === 'color') {
                            onChangeBackground('color', backgroundProperties.color);
                          } else if (value === 'gradient') {
                            onChangeBackground('gradient', backgroundProperties.gradient);
                          }
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="color">Solid Color</SelectItem>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="image">Background Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {backgroundProperties.type === 'color' && (
                      <div>
                        <Label className="text-xs text-gray-500">Color</Label>
                        <Input
                          type="color"
                          value={backgroundProperties.color}
                          onChange={(e) => onChangeBackground('color', e.target.value)}
                          className="mt-1 h-8"
                        />
                      </div>
                    )}

                    {backgroundProperties.type === 'image' && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-500">Background Image</Label>
                          <div className="mt-1 space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onUploadBackgroundImage}
                              className="w-full"
                            >
                              <Upload className="w-3 h-3 mr-2" />
                              Upload Image
                            </Button>
                            {backgroundProperties.image?.src && (
                              <div className="relative">
                                <img 
                                  src={backgroundProperties.image.src} 
                                  alt="Background preview" 
                                  className="w-full h-20 object-cover rounded border"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onChangeBackground('image', { ...backgroundProperties.image, src: '' })}
                                  className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
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
                        onClick={() => onUpdateTextProperty('fontSize', Math.max(8, textProperties.fontSize - 2))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm w-8 text-center">{textProperties.fontSize}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateTextProperty('fontSize', textProperties.fontSize + 2)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Font Family</Label>
                    <Select 
                      value={textProperties.fontFamily}
                      onValueChange={(value) => onUpdateTextProperty('fontFamily', value)}
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
                      onChange={(e) => onUpdateTextProperty('fill', e.target.value)}
                      className="mt-1 h-8"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={textProperties.fontWeight === 'bold' ? 'default' : 'outline'}
                      onClick={() => onUpdateTextProperty('fontWeight', 
                        textProperties.fontWeight === 'bold' ? 'normal' : 'bold')}
                    >
                      <Bold className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={textProperties.fontStyle === 'italic' ? 'default' : 'outline'}
                      onClick={() => onUpdateTextProperty('fontStyle', 
                        textProperties.fontStyle === 'italic' ? 'normal' : 'italic')}
                    >
                      <Italic className="w-3 h-3" />
                    </Button>
                  </div>
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
  );
}; 