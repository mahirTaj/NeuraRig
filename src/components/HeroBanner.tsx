
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-neura-900 text-white py-16 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Build Your Dream PC with AI Assistance
          </h1>
          <p className="text-lg opacity-90 mb-6">
            NeuraRig helps you create the perfect custom PC with AI-powered recommendations based on your needs and budget.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-white text-neura-900 hover:bg-gray-100">
              <Link to="/pc-builder">Start Building</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/pc-builder/ai">AI Recommendations</Link>
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-xl">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-md bg-gradient-to-br from-neura-400 to-neura-800 flex items-center justify-center">
              <span className="font-bold text-xl">NeuraRig AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
