import api from '../lib/api';

export const authApi = {
  register: async (email: string, password: string) => {
    const { data } = await api.post('/register', { email, password });
    return data;
  },

  verifyOtp: async (email: string, otp: string, type:number) => {
    const { data } = await api.post('/verify-otp', { email, otp,type });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/login', { email, password });
    return data;
  },

  updateProfile: async (payload: {
    name?: string;
    gender?: number;
    DOB?: string;
  }) => {
    const { data } = await api.put('/update-profile', payload);
    return data;
  },

  changePassword: async (payload: {
    password: string;
    newPassword: string;
  }) => {
    const { data } = await api.post('/change-password', payload);
    return data;
  },

  // POST /resend-otp — { email }
  resendOtp: async (email: string) => {
    const { data } = await api.post('/resend-otp', { email });
    return data;
  },

  // POST /forgot-password — { email } — sends OTP with type 2
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/forgot-password', { email });
    return data;
  },

  // POST /reset-password — { resetToken, newPassword }
  resetPassword: async (resetToken: string, newPassword: string) => {
    const { data } = await api.post('/reset-password', { resetToken, newPassword });
    return data;
  },
};

export const GENRE_MAP: Record<number, string> = {
  1: 'Fiction',
  2: 'Non-Fiction',
  3: 'Mystery',
  4: 'Thriller',
  5: 'Romance',
  6: 'Science Fiction',
  7: 'Fantasy',
  8: 'Historical Fiction',
  9: 'Biography',
  10: 'Autobiography',
  11: 'Self Help',
  12: 'Business',
  13: 'History',
  14: 'Science',
  15: 'Technology',
  16: 'Health',
  17: 'Fitness',
  18: 'Cooking',
  19: 'Travel',
  20: 'Art',
  21: 'Photography',
  22: 'Music',
  23: 'Film',
  24: 'Sports',
  25: 'Education',
  26: 'Children',
  27: 'Young Adult',
  28: 'Poetry',
  29: 'Drama',
  30: 'Horror',
  31: 'Adventure',
  32: 'Crime',
};

export const booksApi = {
  getBooks: async (page = 1, limit = 10, search = '', genre = 0) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append('search', search);
    if (genre) params.append('genre', String(genre));
    const { data } = await api.get(`/books?${params.toString()}`);
    return data;
  },

  getAllBooks: async (page = 1, limit = 10, search = '', genre = 0) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append('search', search);
    if (genre) params.append('genre', String(genre));
    const { data } = await api.get(`/all-books?${params.toString()}`);
    return data;
  },

  getBookDetails: async (id: string) => {
    const { data } = await api.get(`/books/${id}`);
    return data;
  },

  addBook: async (payload: {
    bookName: string;
    author: string;
    genre: number;
    price: number;
    image: string;
  }) => {
    const { data } = await api.post('/books', payload);
    return data;
  },

  updateBook: async (
    id: string,
    payload: {
      bookName: string;
      author: string;
      genre: number;
      price: number;
      image: string;
    }
  ) => {
    const { data } = await api.put(`/books/${id}`, payload);
    return data;
  },

  deleteBook: async (id: string) => {
    const { data } = await api.delete(`/books/${id}`);
    return data;
  },
};

export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
