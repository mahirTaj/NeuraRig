import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProducts, addToCart } from '@/services/data-service';
import { Product } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Check, Plus, Cpu, HardDrive, Box, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const PcBuilderPage = () => {
  const [selectedParts, setSelectedParts] = useState<{[key: string]: Product}>({});
  const { toast } = useToast();
  
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
  
  const cpuOptions = products?.filter(p => p.category === 'components' && p.specs?.type === 'CPU') || [];
  const gpuOptions = products?.filter(p => p.category === 'components' && p.specs?.type === 'GPU') || [];
  
  const selectPart = (category: string, product: Product) => {
    setSelectedParts({
      ...selectedParts,
      [category]: product
    });
    
    toast({
      title: "Part selected",
      description: `${product.name} has been added to your build`,
      duration: 2000,
    });
  };
  
  const removePart = (category: string) => {
    const newParts = { ...selectedParts };
    delete newParts[category];
    setSelectedParts(newParts);
  };
  
  const getTotalPrice = () => {
    return Object.values(selectedParts).reduce((sum, part) => sum + part.price, 0);
  };
  
  const addBuildToCart = async () => {
    try {
      for (const part of Object.values(selectedParts)) {
        await addToCart(part, 1);
      }
      toast({
        title: "Build added to cart",
        description: "All components have been added to your cart",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error adding build to cart:", error);
    }
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
                          <p className="text-sm">{selectedParts.cpu.name}</p>
                          <p className="text-xs text-muted-foreground">${selectedParts.cpu.price.toFixed(2)}</p>
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
                        <Button variant="outline" size="sm">
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
                    <Box className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">GPU / Graphics Card</h3>
                    
                    {selectedParts.gpu ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.gpu.name}</p>
                          <p className="text-xs text-muted-foreground">${selectedParts.gpu.price.toFixed(2)}</p>
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
                        <Button variant="outline" size="sm">
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
                    <HardDrive className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">Memory / RAM</h3>
                    
                    {selectedParts.ram ? (
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="text-sm">{selectedParts.ram.name}</p>
                          <p className="text-xs text-muted-foreground">${selectedParts.ram.price.toFixed(2)}</p>
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
                        <Button variant="outline" size="sm">
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
                          <p className="text-sm">{selectedParts.storage.name}</p>
                          <p className="text-xs text-muted-foreground">${selectedParts.storage.price.toFixed(2)}</p>
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
                        <Button variant="outline" size="sm">
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
                      <p className="text-sm text-muted-foreground">{part.name}</p>
                    </div>
                    <p className="font-medium">${part.price.toFixed(2)}</p>
                  </div>
                ))}
                
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
    </div>
  );
};

export default PcBuilderPage;
