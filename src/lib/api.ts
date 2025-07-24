const API_BASE_URL = 'http://localhost:4000/api';

export interface Product {
  _id: string;
  productname: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock_availabele: number;
  isactive: boolean;
  reviews: Review[];
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface CartItem {
  _id: string;
  userid: string;
  productid: Product;
  quantity: number;
  createAt: string;
  updateAt: string;
}

export interface Order {
  _id: string;
  userid: {
    _id: string;
    username: string;
    email: string;
  } | string;
  products: {
    productid: Product;
    quantity: number;
  }[];
  totalamount: number;
  paymentmode: 'cod' | 'online';
  status: 'pending' | 'completed';
  orderdate: string;
  deliverydate?: string;
  iscancelled: boolean;
  shippingaddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  contact?: number;
  isadmin: boolean;
  isblocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product API
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/getproduct`);
    const data = await response.json();
    return data.products;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/product/${id}`);
    const data = await response.json();
    return data.product;
  },

  create: async (productData: Omit<Product, '_id' | 'reviews'>, userId: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/createproduct/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.product;
  },

  update: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.update;
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }
  },
};

// Cart API
export const cartApi = {
  getUserCart: async (userId: string): Promise<CartItem[]> => {
    const response = await fetch(`${API_BASE_URL}/getsofuser/${userId}`);
    const data = await response.json();
    return data.cart;
  },

  addToCart: async (userId: string, productId: string, quantity: number = 1): Promise<CartItem> => {
    const response = await fetch(`${API_BASE_URL}/addtocart/${userId}/${productId}/${quantity}`, {
      method: 'POST',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.newcart;
  },

  updateQuantity: async (cartId: string, quantity: number): Promise<CartItem> => {
    const response = await fetch(`${API_BASE_URL}/updatecart/${cartId}/${quantity}`, {
      method: 'PATCH',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.update;
  },

  removeFromCart: async (cartId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/deletecart/${cartId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }
  },
};

// Order API
export const orderApi = {
  create: async (orderData: {
    userid: string;
    productid?: string;
    quantity?: number;
    paymentmode: string;
    shippingaddress: string;
    status: string;
  }): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/createorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.order;
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/getsofuserorder/${userId}`);
    const data = await response.json();
    return data.orders;
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/getallorder`);
    const data = await response.json();
    return data.orders;
  },

  updateOrder: async (id: string, updateData: Partial<Order>): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/updateorder/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.order;
  },
};

// User API
export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/getusers`);
    const data = await response.json();
    return data.users;
  },

  getByEmail: async (email: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/getuserbyemail/${email}`);
    const data = await response.json();
    return data.user;
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/updateuser/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.user;
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/deleteuser/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }
  },
};