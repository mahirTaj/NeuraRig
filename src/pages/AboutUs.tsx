import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio?: string;
  facebook: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Abrar Samin",
    role: "CEO",
    image: "http://localhost:5000/uploads/profile/Abrar Samin.jpg",
    bio: "Leading NeuraRig's vision and strategy to revolutionize custom PC building.",
    facebook: "https://www.facebook.com/abrar.samin.7"
  },
  {
    name: "Mahir Tajwar Rahman",
    role: "COO",
    image: "http://localhost:5000/uploads/profile/Mahir Tajwar Rahman .jpg",
    bio: "Overseeing day-to-day operations and ensuring smooth customer experiences.",
    facebook: "https://www.facebook.com/taajwarr"
  },
  {
    name: "Tashwar Uddin Safin",
    role: "CFO",
    image: "http://localhost:5000/uploads/profile/Taswar Uddin Safin.jpg",
    bio: "Managing financial strategy and growth initiatives.",
    facebook: "https://www.facebook.com/tashwar.safin.5"
  },
  {
    name: "Asiful Islam Mahir",
    role: "CTO",
    image: "http://localhost:5000/uploads/profile/Asiful Islam Mahir.jpg",
    bio: "Driving technological innovation and platform development.",
    facebook: "https://www.facebook.com/Asiful.islam.mahir"
  }
];

const AboutUs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">About NeuraRig</h1>
        
        <div className="mb-12">
          <p className="text-lg text-gray-700 mb-4">
            NeuraRig is your premier destination for custom PC building. We combine cutting-edge technology 
            with expert guidance to help you create the perfect computer system tailored to your needs.
          </p>
          <p className="text-lg text-gray-700">
            Our platform features an innovative AI-powered recommendation system and a user-friendly 
            interface that makes PC building accessible to everyone, from beginners to experts.
          </p>
        </div>

        <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.name} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src={member.image}
                  alt={member.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-neura-600 font-semibold mb-3">{member.role}</p>
                {member.bio && (
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                )}
                <a 
                  href={member.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Facebook className="h-4 w-4" />
                    Connect on Facebook
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700">
            To empower users with the knowledge and tools they need to build their dream PC, 
            backed by cutting-edge AI technology and expert support every step of the way.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 