
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAiRecommendations, getProducts, addToCart } from '@/services/data-service';
import { Product } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Check, Plus, Cpu, HardDrive, Box, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const PcBuilderPage = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [selectedParts, setSelectedParts] = useState<{[key: string]: Product}>({});
  const [budget, setBudget] = useState<number>(1500);
  const [purpose, setPurpose] = useState<string>('gaming');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
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
  
  const getRecommendations = async () => {
    setIsLoading(true);
    try {
      const recommendations = await getAiRecommendations(budget, purpose);
      setRecommendations(recommendations);
      toast({
        title: "AI Recommendations Ready",
        description: "Our AI has generated some PC recommendations for you",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to get recommendations",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
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
        Build your own PC or let our AI recommend components for you.
      </p>
      
      <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="manual">Manual Builder</TabsTrigger>
          <TabsTrigger value="ai">AI Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="animate-fade-in">
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
                    
                    <Separator />
                    
                    {/* Monitor */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-neura-100 text-neura-600 rounded-full flex items-center justify-center">
                        <Monitor className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-medium">Monitor</h3>
                        
                        {selectedParts.monitor ? (
                          <div className="flex justify-between items-center mt-1">
                            <div>
                              <p className="text-sm">{selectedParts.monitor.name}</p>
                              <p className="text-xs text-muted-foreground">${selectedParts.monitor.price.toFixed(2)}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removePart('monitor')}
                              className="text-red-500 hover:text-red-600"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-muted-foreground">Select a monitor</p>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-1" /> Add Monitor
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">Build Summary</h2>
                  
                  <div className="space-y-3 text-sm">
                    {Object.entries(selectedParts).map(([category, part]) => (
                      <div key={category} className="flex justify-between">
                        <span>{category.toUpperCase()}</span>
                        <span>${part.price.toFixed(2)}</span>
                      </div>
                    ))}
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 bg-neura-600 hover:bg-neura-700" 
                    onClick={addBuildToCart}
                    disabled={Object.keys(selectedParts).length === 0}
                  >
                    Add Build to Cart
                  </Button>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Compatibility Check</h3>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-xs">All selected components are compatible</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ai" className="animate-fade-in">
          <div className="bg-white rounded-lg border p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">AI PC Builder</h2>
            <p className="text-muted-foreground mb-6">
              Tell us your budget and what you'll use your PC for, and our AI will recommend the perfect build for you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="budget">Your Budget</Label>
                <div className="mt-2">
                  <Input 
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    placeholder="Enter your budget"
                    min={500}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your maximum budget in USD
                </p>
              </div>
              
              <div>
                <Label htmlFor="purpose">Primary Use</Label>
                <select
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md mt-2"
                >
                  <option value="gaming">Gaming</option>
                  <option value="productivity">Productivity & Work</option>
                  <option value="content">Content Creation</option>
                  <option value="general">General Purpose</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  What will you primarily use this PC for?
                </p>
              </div>
            </div>
            
            <Button 
              onClick={getRecommendations} 
              className="mt-6 bg-neura-600 hover:bg-neura-700"
              disabled={isLoading}
            >
              {isLoading ? "Generating Recommendations..." : "Get AI Recommendations"}
            </Button>
          </div>
          
          {recommendations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Your Recommended Builds</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((product) => (
                  <Card key={product.id} className="product-card overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="h-48 w-full object-cover bg-gray-100"
                    />
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {product.description}
                      </p>
                      
                      <div className="mt-2 space-y-1">
                        {product.specs && Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium capitalize">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                      
                      <div className="font-bold text-lg mt-3">
                        ${product.price.toFixed(2)}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="flex-1"
                        >
                          <Link to={`/product/${product.id}`}>Details</Link>
                        </Button>
                        <Button 
                          size="sm"
                          className="flex-1 bg-neura-600 hover:bg-neura-700"
                          onClick={() => {
                            addToCart(product, 1);
                            toast({
                              title: "Added to cart",
                              description: `${product.name} has been added to your cart`,
                              duration: 3000,
                            });
                          }}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PcBuilderPage;
