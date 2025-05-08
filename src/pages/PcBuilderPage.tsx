import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProducts, addToCart, getCategories, getProductsByCategorySlug } from '@/services/data-service';
import { Product, Category } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Check, Plus, Cpu, HardDrive, Box, Monitor, CircuitBoard, Laptop, MinusCircle, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import PcBuilderChatbot from '@/components/PcBuilderChatbot';

// Export the interface so it can be imported in the chatbot component
export interface SelectedPart {
  product: Product;
  quantity: number;
}

const PcBuilderPage = () => {
  const [selectedParts, setSelectedParts] = useState<{[key: string]: SelectedPart}>({});
  const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const { toast } = useToast();
  
  // Get all categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  // Function to find a category by partial name match
  const findCategoryByName = (name: string): Category | undefined => {
    return categories?.find(category => 
      category.name.toLowerCase().includes(name.toLowerCase()) ||
      category.slug.toLowerCase().includes(name.toLowerCase())
    );
  };
  
  // Find the specific component categories
  const cpuCategory = findCategoryByName('cpu');
  const gpuCategory = findCategoryByName('gpu');
  const ramCategory = findCategoryByName('ram');
  const storageCategory = findCategoryByName('ssd') || findCategoryByName('storage');
  
  // Log categories for debugging
  useEffect(() => {
    if (categories) {
      console.log('All categories:', categories.map(c => c.name));
      console.log('CPU category:', cpuCategory?.name);
      console.log('GPU category:', gpuCategory?.name);
      console.log('RAM category:', ramCategory?.name);
      console.log('Storage category:', storageCategory?.name);
    }
  }, [categories, cpuCategory, gpuCategory, ramCategory, storageCategory]);
  
  // Get products from each category
  const { data: cpuProducts, isLoading: cpuLoading } = useQuery({
    queryKey: ['products', 'cpu', cpuCategory?.slug],
    queryFn: () => cpuCategory ? getProductsByCategorySlug(cpuCategory.slug) : Promise.resolve([]),
    enabled: !!cpuCategory
  });
  
  const { data: gpuProducts, isLoading: gpuLoading } = useQuery({
    queryKey: ['products', 'gpu', gpuCategory?.slug],
    queryFn: () => gpuCategory ? getProductsByCategorySlug(gpuCategory.slug) : Promise.resolve([]),
    enabled: !!gpuCategory
  });
  
  const { data: ramProducts, isLoading: ramLoading } = useQuery({
    queryKey: ['products', 'ram', ramCategory?.slug],
    queryFn: () => ramCategory ? getProductsByCategorySlug(ramCategory.slug) : Promise.resolve([]),
    enabled: !!ramCategory
  });
  
  const { data: storageProducts, isLoading: storageLoading } = useQuery({
    queryKey: ['products', 'storage', storageCategory?.slug],
    queryFn: () => storageCategory ? getProductsByCategorySlug(storageCategory.slug) : Promise.resolve([]),
    enabled: !!storageCategory
  });
  
  const isLoading = categoriesLoading || cpuLoading || gpuLoading || ramLoading || storageLoading;
  
  // Log products for debugging
  useEffect(() => {
    console.log('CPU products:', cpuProducts?.length || 0);
    console.log('GPU products:', gpuProducts?.length || 0);
    console.log('RAM products:', ramProducts?.length || 0);
    console.log('Storage products:', storageProducts?.length || 0);
  }, [cpuProducts, gpuProducts, ramProducts, storageProducts]);
  
  const getComponentOptions = (type: string): Product[] => {
    switch (type.toLowerCase()) {
      case 'cpu': return cpuProducts || [];
      case 'gpu': return gpuProducts || [];
      case 'ram': return ramProducts || [];
      case 'storage': return storageProducts || [];
      default: return [];
    }
  };
  
  const getCategoryByType = (type: string): Category | undefined => {
    switch (type.toLowerCase()) {
      case 'cpu': return cpuCategory;
      case 'gpu': return gpuCategory;
      case 'ram': return ramCategory;
      case 'storage': return storageCategory;
      default: return undefined;
    }
  };
  
  // Reset quantities when opening a new component selector
  useEffect(() => {
    if (selectedComponentType) {
      // Initialize quantities for all products in the selected category
      const components = getComponentOptions(selectedComponentType);
      const initialQuantities: {[key: string]: number} = {};
      
      components.forEach(component => {
        initialQuantities[component._id] = 1;
      });
      
      setQuantities(initialQuantities);
    }
  }, [selectedComponentType]);
  
  const updateQuantity = (productId: string, value: number) => {
    // Ensure quantity is between 1 and available stock
    const product = getComponentOptions(selectedComponentType || '').find(p => p._id === productId);
    const maxStock = product?.stock || 1;
    const newQuantity = Math.max(1, Math.min(maxStock, value));
    
    setQuantities({
      ...quantities,
      [productId]: newQuantity
    });
  };
  
  const selectPart = (category: string, product: Product) => {
    setSelectedParts({
      ...selectedParts,
      [category]: {
        product,
        quantity: quantities[product._id] || 1
      }
    });
    
    toast({
      title: "Part selected",
      description: `${quantities[product._id] || 1}x ${product.name} has been added to your build`,
      duration: 2000,
    });
    
    setSelectedComponentType(null);
  };
  
  const removePart = (category: string) => {
    const newParts = { ...selectedParts };
    delete newParts[category];
    setSelectedParts(newParts);
    
    toast({
      title: "Part removed",
      description: "Component has been removed from your build",
      duration: 2000,
    });
  };
  
  const getTotalPrice = () => {
    return Object.values(selectedParts).reduce(
      (sum, part) => sum + (part.product.price * part.quantity), 
      0
    );
  };
  
  const addBuildToCart = async () => {
    try {
      for (const part of Object.values(selectedParts)) {
        await addToCart(part.product, part.quantity);
      }
      toast({
        title: "Build added to cart",
        description: "All components have been added to your cart",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error adding build to cart:", error);
      toast({
        title: "Error",
        description: "There was an error adding your build to cart",
        duration: 3000,
        variant: "destructive"
      });
    }
  };
  
  const openComponentSelector = (type: string) => {
    setSelectedComponentType(type);
  };
  
  // Return a list of all specification names and values for a component
  const getComponentSpecs = (product: Product) => {
    return product.specifications || [];
  };
  
  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">PC Builder</h1>
      <p className="text-muted-foreground mb-8">
        Build your own PC by selecting components from our catalog.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* CPU */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-neura-100 text-neura-600 rounded-full flex items-center justify-center">
                    <Cpu className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">CPU / Processor</h3>
                    
                    {selectedParts.cpu ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.cpu.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedParts.cpu.quantity > 1 ? `${selectedParts.cpu.quantity}x ` : ''}
                            ${selectedParts.cpu.product.price.toFixed(2)}
                            {selectedParts.cpu.quantity > 1 ? ` ($${(selectedParts.cpu.product.price * selectedParts.cpu.quantity).toFixed(2)})` : ''}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePart('cpu')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground">Select a CPU</p>
                        <Button variant="outline" size="sm" onClick={() => openComponentSelector('cpu')}>
                          <Plus className="h-4 w-4 mr-1" /> Add CPU
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* GPU */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-neura-100 text-neura-600 rounded-full flex items-center justify-center">
                    <Laptop className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">GPU / Graphics Card</h3>
                    
                    {selectedParts.gpu ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.gpu.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedParts.gpu.quantity > 1 ? `${selectedParts.gpu.quantity}x ` : ''}
                            ${selectedParts.gpu.product.price.toFixed(2)}
                            {selectedParts.gpu.quantity > 1 ? ` ($${(selectedParts.gpu.product.price * selectedParts.gpu.quantity).toFixed(2)})` : ''}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePart('gpu')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground">Select a GPU</p>
                        <Button variant="outline" size="sm" onClick={() => openComponentSelector('gpu')}>
                          <Plus className="h-4 w-4 mr-1" /> Add GPU
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* RAM */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-neura-100 text-neura-600 rounded-full flex items-center justify-center">
                    <CircuitBoard className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">Memory / RAM</h3>
                    
                    {selectedParts.ram ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.ram.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedParts.ram.quantity > 1 ? `${selectedParts.ram.quantity}x ` : ''}
                            ${selectedParts.ram.product.price.toFixed(2)}
                            {selectedParts.ram.quantity > 1 ? ` ($${(selectedParts.ram.product.price * selectedParts.ram.quantity).toFixed(2)})` : ''}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePart('ram')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground">Select RAM</p>
                        <Button variant="outline" size="sm" onClick={() => openComponentSelector('ram')}>
                          <Plus className="h-4 w-4 mr-1" /> Add RAM
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Storage */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-neura-100 text-neura-600 rounded-full flex items-center justify-center">
                    <HardDrive className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">Storage</h3>
                    
                    {selectedParts.storage ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.storage.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedParts.storage.quantity > 1 ? `${selectedParts.storage.quantity}x ` : ''}
                            ${selectedParts.storage.product.price.toFixed(2)}
                            {selectedParts.storage.quantity > 1 ? ` ($${(selectedParts.storage.product.price * selectedParts.storage.quantity).toFixed(2)})` : ''}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePart('storage')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground">Select storage</p>
                        <Button variant="outline" size="sm" onClick={() => openComponentSelector('storage')}>
                          <Plus className="h-4 w-4 mr-1" /> Add Storage
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Build Summary</h2>
              
              <div className="space-y-4">
                {Object.entries(selectedParts).map(([category, part]) => (
                  <div key={category} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium capitalize">{category}</p>
                      <p className="text-sm text-muted-foreground">
                        {part.quantity > 1 ? `${part.quantity}x ` : ''}
                        {part.product.name}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(part.product.price * part.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                
                {Object.keys(selectedParts).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No components selected yet</p>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={addBuildToCart}
                  disabled={Object.keys(selectedParts).length === 0}
                >
                  Add Build to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Component Selection Dialog */}
      <Dialog open={!!selectedComponentType} onOpenChange={(open) => !open && setSelectedComponentType(null)}>
        <DialogContent className="sm:max-w-[80vw] md:max-w-[60vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select {selectedComponentType?.toUpperCase()}</DialogTitle>
            <DialogDescription>
              Choose from our selection of {selectedComponentType} options for your build.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] w-full pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading components...</p>
              </div>
            ) : getComponentOptions(selectedComponentType || '').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {getComponentOptions(selectedComponentType || '').map((component) => (
                  <Card key={component._id} className="overflow-hidden">
                    <div className="aspect-video overflow-hidden bg-gray-100 flex items-center justify-center">
                      {component.images && component.images.length > 0 ? (
                        <img 
                          src={component.images[0]} 
                          alt={component.name}
                          className="object-contain h-full w-full"
                        />
                      ) : (
                        <div className="text-gray-400">No image</div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{component.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">${component.price.toFixed(2)}</p>
                      
                      <div className="space-y-1 mb-3">
                        {getComponentSpecs(component).slice(0, 3).map((spec, index) => (
                          <p key={index} className="text-xs">
                            <span className="font-medium">{spec.name}:</span> {spec.value}
                            {spec.unit ? ` ${spec.unit}` : ''}
                          </p>
                        ))}
                        
                        {getComponentSpecs(component).length === 0 && (
                          <p className="text-xs text-muted-foreground">No specifications available</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${component.stock > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                          {component.stock > 0 ? `In Stock: ${component.stock}` : 'Out of Stock'}
                        </Badge>
                        
                        {component.stock > 0 && (
                          <div className="flex items-center border rounded-md overflow-hidden ml-auto">
                            <Button 
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0 rounded-none"
                              onClick={() => updateQuantity(component._id, (quantities[component._id] || 1) - 1)}
                              disabled={quantities[component._id] <= 1}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <span className="px-2 text-sm font-medium">
                              {quantities[component._id] || 1}
                            </span>
                            <Button 
                              variant="ghost"
                              size="icon" 
                              className="h-8 w-8 p-0 rounded-none"
                              onClick={() => updateQuantity(component._id, (quantities[component._id] || 1) + 1)}
                              disabled={quantities[component._id] >= component.stock}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => selectPart(selectedComponentType || '', component)}
                        disabled={component.stock <= 0}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Select
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-lg font-medium mb-2">No {selectedComponentType} components found</p>
                
                {selectedComponentType && getCategoryByType(selectedComponentType) ? (
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any products in the "{getCategoryByType(selectedComponentType)?.name}" category.
                  </p>
                ) : (
                  <p className="text-muted-foreground mb-4">
                    We couldn't find a category for {selectedComponentType} components.
                  </p>
                )}
                
                <Link 
                  to="/products" 
                  className="text-neura-600 hover:text-neura-700 underline"
                >
                  Browse all products
                </Link>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* AI Recommendation Chatbot */}
      <PcBuilderChatbot selectedParts={selectedParts} />
    </div>
  );
};

export default PcBuilderPage;
