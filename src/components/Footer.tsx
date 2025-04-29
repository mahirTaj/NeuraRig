
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-100 py-8 mt-16">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">NeuraRig</h3>
            <p className="text-gray-600 text-sm">
              Your one-stop shop for AI-integrated PC building and tech solutions.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/categories" className="text-gray-600 hover:text-neura-600">All Categories</Link></li>
              <li><Link to="/category/laptops" className="text-gray-600 hover:text-neura-600">Laptops</Link></li>
              <li><Link to="/category/desktops" className="text-gray-600 hover:text-neura-600">Desktops</Link></li>
              <li><Link to="/category/components" className="text-gray-600 hover:text-neura-600">Components</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/pc-builder" className="text-gray-600 hover:text-neura-600">PC Builder</Link></li>
              <li><Link to="/pc-builder/ai" className="text-gray-600 hover:text-neura-600">AI Assistant</Link></li>
              <li><Link to="/support" className="text-gray-600 hover:text-neura-600">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-neura-600">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-neura-600">Contact</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-neura-600">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-neura-600">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-sm text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} NeuraRig. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
