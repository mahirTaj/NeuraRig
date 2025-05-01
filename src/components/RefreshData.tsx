import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

const RefreshData: React.FC = () => {
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    // Invalidate and refetch the featured products query
    await queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh} 
      className="flex items-center gap-1 mr-2"
    >
      <RefreshCw className="h-4 w-4" />
      <span>Refresh</span>
    </Button>
  );
};

export default RefreshData; 