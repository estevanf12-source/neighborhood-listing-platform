export interface Property {
  id: string;
  title: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  imageUrl: string;
  imageAlt: string;
  isFeatured?: boolean;
}

export interface Sponsor {
  id: string;
  businessName: string;
  headline: string;
  ctaText: string;
  targetUrl: string;
  logoUrl: string;
  logoAlt: string;
}

export interface FilterCriteria {
  minPrice: string;
  maxPrice: string;
  propertyType: string;
}
