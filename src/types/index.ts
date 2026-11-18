export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface Admin {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    permissions: string[];
}

export interface AdminRole {
    id: string;
    name: string;
    permissions: string[];
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    imagePath: string | null;
    subCategories: SubCategory[];
    createdAt: string;
    updatedAt: string;
}

export interface SubCategory {
    id: string;
    name: string;
    description: string | null;
    imagePath: string | null;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
}

export type UnitMeasure = 'UNIT' | 'KG' | 'G' | 'LTR' | 'ML' | 'DOZEN' | 'PACK';

export interface Hub {
    id: string;
    name: string;
    email: string;
    phone: string;
    hub_location: string;
    role: string;
    permissions: string[];
    is_owner: boolean;
    hub_owner_id: string;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string | null;
    priceAtOrder: number;
    unitMeasure: string;
    quantity: number;
    itemTotal: number;
}

export interface Order {
    id: string;
    customerId: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    platformFee: number;
    total: number;
    deliveryAddress: string;
    deliveryLandmark: string | null;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    actualPrice: number;
    discountPercentage: number;
    price: number;
    stockQuantity: number;
    isActive: boolean;
    unitMeasure: UnitMeasure;
    hubAddressId: string;
    hubCity: string | null;
    categoryId: string;
    categoryName: string;
    subCategoryId: string;
    subCategoryName: string;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
}
