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
    if (!categories) return undefined;
    
    // Convert search term to lowercase for case-insensitive comparison
    const searchTerm = name.toLowerCase();
    
    // Try to find an exact match first
    const exactMatch = categories.find(category => 
      category.name.toLowerCase() === searchTerm ||
      category.slug.toLowerCase() === searchTerm
    );
    
    if (exactMatch) return exactMatch;
    
    // Then try to find a partial match
    return categories.find(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      category.slug.toLowerCase().includes(searchTerm)
    );
  };
  
  // Find the specific component categories
  const cpuCategory = findCategoryByName('cpu') || findCategoryByName('processor');
  const gpuCategory = findCategoryByName('gpu') || findCategoryByName('graphics');
  const ramCategory = findCategoryByName('ram') || findCategoryByName('memory');
  const storageCategory = findCategoryByName('storage') || findCategoryByName('ssd') || findCategoryByName('hdd');
  const motherboardCategory = findCategoryByName('motherboard');
  const psuCategory = findCategoryByName('psu') || findCategoryByName('power supply');
  const caseCategory = findCategoryByName('case') || findCategoryByName('chassis') || findCategoryByName('pc case') || findCategoryByName('casing');
  const coolingCategory = findCategoryByName('cooling') || findCategoryByName('cooler') || findCategoryByName('fan');
  
  // Log categories for debugging
  useEffect(() => {
    if (categories) {
      console.log('All categories:', categories.map(c => ({name: c.name, slug: c.slug})));
      console.log('CPU category:', cpuCategory ? {name: cpuCategory.name, slug: cpuCategory.slug} : 'Not found');
      console.log('GPU category:', gpuCategory ? {name: gpuCategory.name, slug: gpuCategory.slug} : 'Not found');
      console.log('RAM category:', ramCategory ? {name: ramCategory.name, slug: ramCategory.slug} : 'Not found');
      console.log('Storage category:', storageCategory ? {name: storageCategory.name, slug: storageCategory.slug} : 'Not found');
      console.log('Motherboard category:', motherboardCategory ? {name: motherboardCategory.name, slug: motherboardCategory.slug} : 'Not found');
      console.log('PSU category:', psuCategory ? {name: psuCategory.name, slug: psuCategory.slug} : 'Not found');
      console.log('Case category:', caseCategory ? {name: caseCategory.name, slug: caseCategory.slug} : 'Not found');
      console.log('Cooling category:', coolingCategory ? {name: coolingCategory.name, slug: coolingCategory.slug} : 'Not found');
    }
  }, [categories, cpuCategory, gpuCategory, ramCategory, storageCategory, motherboardCategory, psuCategory, caseCategory, coolingCategory]);
  
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

  const { data: motherboardProducts, isLoading: motherboardLoading } = useQuery({
    queryKey: ['products', 'motherboard', motherboardCategory?.slug],
    queryFn: () => motherboardCategory ? getProductsByCategorySlug(motherboardCategory.slug) : Promise.resolve([]),
    enabled: !!motherboardCategory
  });

  const { data: psuProducts, isLoading: psuLoading } = useQuery({
    queryKey: ['products', 'psu', psuCategory?.slug],
    queryFn: () => psuCategory ? getProductsByCategorySlug(psuCategory.slug) : Promise.resolve([]),
    enabled: !!psuCategory
  });

  const { data: caseProducts, isLoading: caseLoading } = useQuery({
    queryKey: ['products', 'case', caseCategory?.slug],
    queryFn: () => caseCategory ? getProductsByCategorySlug(caseCategory.slug) : Promise.resolve([]),
    enabled: !!caseCategory
  });

  const { data: coolingProducts, isLoading: coolingLoading } = useQuery({
    queryKey: ['products', 'cooling', coolingCategory?.slug],
    queryFn: () => coolingCategory ? getProductsByCategorySlug(coolingCategory.slug) : Promise.resolve([]),
    enabled: !!coolingCategory
  });
  
  const isLoading = categoriesLoading || cpuLoading || gpuLoading || ramLoading || storageLoading || 
    motherboardLoading || psuLoading || caseLoading || coolingLoading;
  
  // Log products for debugging
  useEffect(() => {
    console.log('CPU products:', cpuProducts?.length || 0, cpuCategory?.slug);
    console.log('GPU products:', gpuProducts?.length || 0, gpuCategory?.slug);
    console.log('RAM products:', ramProducts?.length || 0, ramCategory?.slug);
    console.log('Storage products:', storageProducts?.length || 0, storageCategory?.slug);
    console.log('Motherboard products:', motherboardProducts?.length || 0, motherboardCategory?.slug);
    console.log('PSU products:', psuProducts?.length || 0, psuCategory?.slug);
    console.log('Case products:', caseProducts?.length || 0, caseCategory?.slug);
    console.log('Cooling products:', coolingProducts?.length || 0, coolingCategory?.slug);
    
    // Check if we have some sample products to ensure products are loading correctly
    if (caseProducts && caseProducts.length > 0) {
      console.log('First case product:', caseProducts[0].name);
    }
    if (coolingProducts && coolingProducts.length > 0) {
      console.log('First cooling product:', coolingProducts[0].name);
    }
  }, [cpuProducts, gpuProducts, ramProducts, storageProducts, motherboardProducts, psuProducts, caseProducts, coolingProducts, 
      cpuCategory, gpuCategory, ramCategory, storageCategory, motherboardCategory, psuCategory, caseCategory, coolingCategory]);
  
  const getComponentOptions = (type: string): Product[] => {
    const normalizedType = type.toLowerCase();
    
    // First try direct match based on type
    switch (normalizedType) {
      case 'cpu': return cpuProducts || [];
      case 'gpu': return gpuProducts || [];
      case 'ram': return ramProducts || [];
      case 'storage': return storageProducts || [];
      case 'motherboard': return motherboardProducts || [];
      case 'psu': return psuProducts || [];
      case 'case': return caseProducts || [];
      case 'cooling': return coolingProducts || [];
    }
    
    // If no direct match, try to match based on similar names
    if (normalizedType.includes('cool') || normalizedType.includes('fan')) {
      return coolingProducts || [];
    }
    if (normalizedType.includes('case') || normalizedType.includes('chas') || normalizedType.includes('casing')) {
      return caseProducts || [];
    }
    if (normalizedType.includes('power') || normalizedType.includes('psu')) {
      return psuProducts || [];
    }
    
    // Fallback to empty array
    console.warn(`No products found for type: ${type}`);
    return [];
  };
  
  const getCategoryByType = (type: string): Category | undefined => {
    const normalizedType = type.toLowerCase();
    
    // First try direct match based on type
    switch (normalizedType) {
      case 'cpu': return cpuCategory;
      case 'gpu': return gpuCategory;
      case 'ram': return ramCategory;
      case 'storage': return storageCategory;
      case 'motherboard': return motherboardCategory;
      case 'psu': return psuCategory;
      case 'case': return caseCategory;
      case 'cooling': return coolingCategory;
    }
    
    // If no direct match, try to match based on similar names
    if (normalizedType.includes('cool') || normalizedType.includes('fan')) {
      return coolingCategory;
    }
    if (normalizedType.includes('case') || normalizedType.includes('chas') || normalizedType.includes('casing')) {
      return caseCategory;
    }
    if (normalizedType.includes('power') || normalizedType.includes('psu')) {
      return psuCategory;
    }
    
    // If the component type doesn't match any predefined categories,
    // try a more general search through all categories
    if (categories) {
      return categories.find(category => 
        category.name.toLowerCase().includes(normalizedType) ||
        category.slug.toLowerCase().includes(normalizedType)
      );
    }
    
    return undefined;
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
                
                <Separator />
                
                {/* Motherboard */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-neura-100 text-neura-600 rounded-full flex items-center justify-center">
                    <CircuitBoard className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">Motherboard</h3>
                    
                    {selectedParts.motherboard ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.motherboard.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedParts.motherboard.quantity > 1 ? `${selectedParts.motherboard.quantity}x ` : ''}
                            ${selectedParts.motherboard.product.price.toFixed(2)}
                            {selectedParts.motherboard.quantity > 1 ? ` ($${(selectedParts.motherboard.product.price * selectedParts.motherboard.quantity).toFixed(2)})` : ''}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePart('motherboard')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground">Select a motherboard</p>
                        <Button variant="outline" size="sm" onClick={() => openComponentSelector('motherboard')}>
                          <Plus className="h-4 w-4 mr-1" /> Add Motherboard
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Power Supply */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-neura-100 text-neura-600 rounded-full flex items-center justify-center">
                    <Box className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">Power Supply</h3>
                    
                    {selectedParts.psu ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.psu.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedParts.psu.quantity > 1 ? `${selectedParts.psu.quantity}x ` : ''}
                            ${selectedParts.psu.product.price.toFixed(2)}
                            {selectedParts.psu.quantity > 1 ? ` ($${(selectedParts.psu.product.price * selectedParts.psu.quantity).toFixed(2)})` : ''}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePart('psu')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground">Select a power supply</p>
                        <Button variant="outline" size="sm" onClick={() => openComponentSelector('psu')}>
                          <Plus className="h-4 w-4 mr-1" /> Add Power Supply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Case */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-neura-100 text-neura-600 rounded-full flex items-center justify-center">
                    <Box className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">Case</h3>
                    
                    {selectedParts.case ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.case.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedParts.case.quantity > 1 ? `${selectedParts.case.quantity}x ` : ''}
                            ${selectedParts.case.product.price.toFixed(2)}
                            {selectedParts.case.quantity > 1 ? ` ($${(selectedParts.case.product.price * selectedParts.case.quantity).toFixed(2)})` : ''}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePart('case')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground">Select a case</p>
                        <Button variant="outline" size="sm" onClick={() => openComponentSelector('case')}>
                          <Plus className="h-4 w-4 mr-1" /> Add Case
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Cooling */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-neura-100 text-neura-600 rounded-full flex items-center justify-center">
                    <Box className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">Cooling</h3>
                    
                    {selectedParts.cooling ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.cooling.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedParts.cooling.quantity > 1 ? `${selectedParts.cooling.quantity}x ` : ''}
                            ${selectedParts.cooling.product.price.toFixed(2)}
                            {selectedParts.cooling.quantity > 1 ? ` ($${(selectedParts.cooling.product.price * selectedParts.cooling.quantity).toFixed(2)})` : ''}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePart('cooling')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground">Select cooling</p>
                        <Button variant="outline" size="sm" onClick={() => openComponentSelector('cooling')}>
                          <Plus className="h-4 w-4 mr-1" /> Add Cooling
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
                          src={component.images[0].startsWith('http') ? component.images[0] : `http://localhost:5000${component.images[0]}`}
                          alt={component.name}
                          className="object-contain h-full w-full"
                          onError={(e) => {
                            e.currentTarget.src = 'http://localhost:5000/public/placeholder.svg';
                          }}
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
