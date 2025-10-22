import api from '../services/api';

// Define the types for link data
export interface LinkData {
  originalUrl: string;
  format?: string;
}
export interface LinkResponse {
  _id: string;
  originalUrl: string;
  downloadUrl?: string;
  status: "pending" | "ready" | "failed";
  owner: string;
  createdAt: string;
  updatedAt: string;

  // Add these optional fields
  title?: string;
  thumbnail?: string;
  qualities?: string[];
  selectedQuality?: string;
}


// ✅ Create a new link
export const createLinkAPI = async (data: LinkData): Promise<LinkResponse> => {
  try {
    const res = await api.post<LinkResponse>("/links", data);
    return res.data;
  } catch (error: any) {
    console.error("Create Link Error:", error);
    throw error.response?.data || error;
  }
};

// ✅ Get all links
export const getLinksAPI = async (): Promise<LinkResponse[]> => {
  try {
    const res = await api.get<LinkResponse[]>("/links");
    return res.data;
  } catch (error: any) {
    console.error("Get Links Error:", error);
    throw error.response?.data || error;
  }
};

// ✅ Get single link by ID
export const getLinkByIdAPI = async (id: string): Promise<LinkResponse> => {
  try {
    const res = await api.get<LinkResponse>(`/links/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Get Link By ID Error:", error);
    throw error.response?.data || error;
  }
};
