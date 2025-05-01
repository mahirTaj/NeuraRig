import { createContext, useContext, useState, ReactNode } from 'react';

interface DeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryInstructions?: string;
}

interface DeliveryContextType {
  deliveryDetails: DeliveryDetails | null;
  setDeliveryDetails: (details: DeliveryDetails) => void;
  clearDeliveryDetails: () => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);

  const clearDeliveryDetails = () => {
    setDeliveryDetails(null);
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveryDetails,
        setDeliveryDetails,
        clearDeliveryDetails,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
} 