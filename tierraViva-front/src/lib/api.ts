// api.ts
import axios from "axios";
import {
    Product,
    BlogPost,
    Activity,
    LoginCredentials,
    RegisterUserData,
    UpdateMeData,
    CreateOrderData,
    ConfirmPasswordResetData,
    CreateRescueRequestData,
    SendRescueContactData,
    BackendCart,
    Species,
    User,
    SponsorshipTier,
    Animal,
    AnimalContentFolder,
    RanchUpdate,
    RanchUpdateTag,
    Booking,
    SystemMetrics,
    AnalyticsOverviewData,
    RescueRequest,
    Sponsorship,
    Order
} from "./types";

const isServer = typeof window === "undefined";

// Priorizar variables de entorno para máxima flexibilidad.
// Si no hay variables, el fallback local es http://localhost:8000/api
const baseURL = isServer
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

console.log(`[API] baseURL: ${baseURL} | isServer: ${isServer}`);

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        try {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                const token = parsed.state?.token;
                console.log("Interceptor: Token found?", !!token);
                if (token) {
                    if (config.headers) {
                        config.headers.set('Authorization', `Bearer ${token}`);
                        console.log("Interceptor: Authorization header set");
                    }
                }
            } else {
                console.log("Interceptor: auth-storage not found in localStorage");
            }
        } catch (e) {
            console.error("Error in api interceptor:", e);
        }
    }
    return config;
}, (error) => Promise.reject(error));

// Safe helper to resolve current domain origin whether in client or SSR
export const getFrontendOrigin = (): string => {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
};

export const login = async (credentials: LoginCredentials): Promise<{ access: string; refresh?: string }> => {
    const response = await api.post<{ access: string; refresh?: string }>('/token/', credentials);
    return response.data;
};

export const register = async (userData: RegisterUserData): Promise<User> => {
    const response = await api.post<User>('/users/', userData);
    return response.data;
};

const getAuthHeader = () => {
    if (typeof window !== "undefined") {
        try {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                const token = parsed.state?.token;
                if (token) return { 'Authorization': `Bearer ${token}` };
            }
        } catch (e) {
            console.error("Error getting auth header:", e);
        }
    }
    return {};
};

export const getMe = async (token?: string): Promise<User> => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : getAuthHeader();
    const response = await api.get<User>('/users/me/', { headers });
    return response.data;
};

export const getSpecies = async (): Promise<Species[]> => {
    const response = await api.get<Species[]>('/species/');
    return response.data;
};

export const getTeam = async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/team/');
    return response.data;
};

export const updateMe = async (data: UpdateMeData, token?: string): Promise<User> => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : getAuthHeader();
    const response = await api.patch<User>('/users/me/', data, { headers });
    return response.data;
};

export const getAnimals = async (): Promise<Animal[]> => {
    const response = await api.get<Animal[]>('/animals/');
    return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products/?t=${Date.now()}`);
    return response.data;
};

export const getPosts = async (): Promise<BlogPost[]> => {
    const response = await api.get<BlogPost[]>('/posts/');
    return response.data;
};

export const getPostBySlug = async (slug: string): Promise<BlogPost> => {
    const response = await api.get<BlogPost>(`/posts/${slug}/`);
    return response.data;
};

export const getProductBySlug = (slug: string): Promise<Product> => 
    api.get<Product>(`/products/${slug}/?t=${Date.now()}`).then(res => res.data);

export const getTiers = async (): Promise<SponsorshipTier[]> => {
    const response = await api.get<SponsorshipTier[]>('/sponsorship/tiers/');
    return response.data;
};

export const getAnimal = async (id: string | number): Promise<Animal> => {
    const response = await api.get<Animal>(`/animals/${id}/`);
    return response.data;
};

export const getFolders = async (filters?: { animal?: number | string; species?: number | string }): Promise<AnimalContentFolder[]> => {
    const params = new URLSearchParams();
    if (filters?.animal) params.append('animal', String(filters.animal));
    if (filters?.species) params.append('species', String(filters.species));

    const response = await api.get<AnimalContentFolder[]>(`/ranch-folders/?${params.toString()}`);
    return response.data;
};

export const getRanchFolders = async (): Promise<AnimalContentFolder[]> => {
    const response = await api.get<AnimalContentFolder[]>('/ranch-folders/');
    return response.data;
};

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
    const response = await api.post<Order>('/orders/', orderData, { headers: getAuthHeader() });
    return response.data;
};

export const createOrderCheckoutSession = async (orderId: number): Promise<{ checkout_url: string }> => {
    const response = await api.post<{ checkout_url: string }>(`/orders/${orderId}/checkout/`, {
        success_url: `${getFrontendOrigin()}/success`,
        cancel_url: `${getFrontendOrigin()}/cancel`
    }, { headers: getAuthHeader() });
    return response.data;
};

export const createCheckoutSession = async (tierId: number, animalId?: number, is_annual: boolean = false): Promise<{ checkout_url: string }> => {
    const response = await api.post<{ checkout_url: string }>('/sponsorship/checkout/', {
        tier_id: tierId,
        animal_id: animalId,
        is_annual: is_annual,
        success_url: `${getFrontendOrigin()}/success`,
        cancel_url: `${getFrontendOrigin()}/cancel`
    }, { headers: getAuthHeader() });
    return response.data;
};

// Cart API
export const apiGetCart = async (): Promise<BackendCart> => {
    const response = await api.get<BackendCart>("/cart/mine/");
    return response.data;
};

export const apiAddToCart = async (productId: number, quantity: number = 1): Promise<BackendCart> => {
    const response = await api.post<BackendCart>("/cart/add_item/", { product_id: productId, quantity });
    return response.data;
};

export const apiRemoveFromCart = async (productId: number): Promise<BackendCart> => {
    const response = await api.post<BackendCart>("/cart/remove_item/", { product_id: productId });
    return response.data;
};

export const apiConfirmOrder = async (orderId: number): Promise<{ status: string }> => {
    const response = await api.post<{ status: string }>(`/orders/${orderId}/confirm/`);
    return response.data;
};

export const apiClearCart = async (): Promise<BackendCart> => {
    const response = await api.post<BackendCart>("/cart/clear/");
    return response.data;
};

export const requestPasswordReset = async (email: string): Promise<{ status: string }> => {
    const response = await api.post<{ status: string }>("/users/password_reset_request/", { email });
    return response.data;
};

export const confirmPasswordReset = async (data: ConfirmPasswordResetData): Promise<{ status: string }> => {
    const response = await api.post<{ status: string }>("/users/password_reset_confirm/", data);
    return response.data;
};

export const createRescueRequest = async (data: CreateRescueRequestData): Promise<RescueRequest> => {
    const response = await api.post<RescueRequest>("/rescues/", data);
    return response.data;
};

export const sendRescueContact = async (data: SendRescueContactData): Promise<{ status: string }> => {
    const response = await api.post<{ status: string }>("/rescues/contact/", data);
    return response.data;
};

// Activity API
export const getRanchUpdates = async (params?: { search?: string; tag?: string }): Promise<RanchUpdate[]> => {
    try {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.tag) query.append('tag', params.tag);

        const response = await api.get<RanchUpdate[]>(`/sponsorship/updates/?${query.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ranch updates:", error);
        return [];
    }
};

export const getRanchTags = async (): Promise<RanchUpdateTag[]> => {
    try {
        const response = await api.get<RanchUpdateTag[]>('/sponsorship/tags/');
        return response.data;
    } catch (error) {
        console.error("Error fetching ranch tags:", error);
        return [];
    }
};

export const getActivities = async (): Promise<Activity[]> => {
    try {
        const response = await api.get<Activity[]>('/activities/');
        return response.data;
    } catch (error) {
        console.error("API Error [getActivities]:", error);
        return [];
    }
};

export const getActivityBySlug = async (slug: string): Promise<Activity | null> => {
    try {
        const response = await api.get<Activity>(`/activities/${slug}/`);
        return response.data;
    } catch (error) {
        console.error("API Error [getActivityBySlug]:", error);
        return null;
    }
};

export const createActivityCheckoutSession = async (slug: string, tickets: number = 1): Promise<{ id: string; url: string }> => {
    const response = await api.post<{ id: string; url: string }>(`/activities/${slug}/checkout/`, { tickets }, { headers: getAuthHeader() });
    return response.data;
};

export const subscribeNewsletter = async (email: string): Promise<{ status: string }> => {
    const response = await api.post<{ status: string }>('/newsletter/subscribers/', { email });
    return response.data;
};

export const getUserSponsorships = async (): Promise<Sponsorship[]> => {
    const response = await api.get<Sponsorship[]>('/sponsorship/mine/', { headers: getAuthHeader() });
    return response.data;
};

export const getAnalyticsOverview = async (): Promise<AnalyticsOverviewData> => {
    const response = await api.get<AnalyticsOverviewData>('/dashboard/analytics/', { headers: getAuthHeader() });
    return response.data;
};

export const getSystemMetrics = async (): Promise<SystemMetrics> => {
    const response = await api.get<SystemMetrics>('/dashboard/system/', { headers: getAuthHeader() });
    return response.data;
};

export const getUserOrders = async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/', { headers: getAuthHeader() });
    return response.data;
};

export const getUserBookings = async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/activities/bookings/', { headers: getAuthHeader() });
    return response.data;
};

export const getUserRescues = async (): Promise<RescueRequest[]> => {
    const response = await api.get<RescueRequest[]>('/rescues/', { headers: getAuthHeader() });
    return response.data;
};

// ── CRUD de Configuración Administrativa (Admin/Family) ──

// Tiers of Sponsorship
export const createTier = async (data: any): Promise<SponsorshipTier> => {
    const response = await api.post<SponsorshipTier>('/sponsorship/tiers/', data, { headers: getAuthHeader() });
    return response.data;
};

export const updateTier = async (id: number, data: any): Promise<SponsorshipTier> => {
    const response = await api.patch<SponsorshipTier>(`/sponsorship/tiers/${id}/`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteTier = async (id: number): Promise<void> => {
    await api.delete(`/sponsorship/tiers/${id}/`, { headers: getAuthHeader() });
};

// Ranch Updates
export const createRanchUpdate = async (data: any): Promise<RanchUpdate> => {
    const response = await api.post<RanchUpdate>('/sponsorship/updates/', data, { headers: getAuthHeader() });
    return response.data;
};

export const updateRanchUpdate = async (id: number, data: any): Promise<RanchUpdate> => {
    const response = await api.patch<RanchUpdate>(`/sponsorship/updates/${id}/`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteRanchUpdate = async (id: number): Promise<void> => {
    await api.delete(`/sponsorship/updates/${id}/`, { headers: getAuthHeader() });
};

// Species
export const createSpecies = async (data: any): Promise<Species> => {
    const response = await api.post<Species>('/species/', data, { headers: getAuthHeader() });
    return response.data;
};

export const updateSpecies = async (id: number, data: any): Promise<Species> => {
    const response = await api.patch<Species>(`/species/${id}/`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteSpecies = async (id: number): Promise<void> => {
    await api.delete(`/species/${id}/`, { headers: getAuthHeader() });
};

// Animals
export const createAnimal = async (data: any): Promise<Animal> => {
    const response = await api.post<Animal>('/animals/', data, { headers: getAuthHeader() });
    return response.data;
};

export const updateAnimal = async (id: number, data: any): Promise<Animal> => {
    const response = await api.patch<Animal>(`/animals/${id}/`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteAnimal = async (id: number): Promise<void> => {
    await api.delete(`/animals/${id}/`, { headers: getAuthHeader() });
};

// Products
export const createProduct = async (data: any): Promise<Product> => {
    const response = await api.post<Product>('/products/', data, { headers: getAuthHeader() });
    return response.data;
};

export const updateProduct = async (id: number, data: any): Promise<Product> => {
    const response = await api.patch<Product>(`/products/${id}/`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await api.delete(`/products/${id}/`, { headers: getAuthHeader() });
};

// Activities
export const createActivity = async (data: any): Promise<Activity> => {
    const response = await api.post<Activity>('/activities/', data, { headers: getAuthHeader() });
    return response.data;
};

export const updateActivity = async (id: number, data: any): Promise<Activity> => {
    const response = await api.patch<Activity>(`/activities/${id}/`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteActivity = async (id: number): Promise<void> => {
    await api.delete(`/activities/${id}/`, { headers: getAuthHeader() });
};

// Blog Posts
export const getBlogPosts = async (): Promise<BlogPost[]> => {
    try {
        const response = await api.get<BlogPost[]>('/blog/posts/');
        return response.data;
    } catch (error) {
        console.error("API Error [getBlogPosts]:", error);
        return [];
    }
};

export const createBlogPost = async (data: any): Promise<BlogPost> => {
    const response = await api.post<BlogPost>('/blog/posts/', data, { headers: getAuthHeader() });
    return response.data;
};

export const updateBlogPost = async (id: number | string, data: any): Promise<BlogPost> => {
    const response = await api.patch<BlogPost>(`/blog/posts/${id}/`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteBlogPost = async (id: number | string): Promise<void> => {
    await api.delete(`/blog/posts/${id}/`, { headers: getAuthHeader() });
};

export default api;
