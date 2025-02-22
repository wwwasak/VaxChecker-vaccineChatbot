import axios from 'axios';
import { NewsResponse } from '@/types/news';

export const newsService = {
  getVaccineNews: async (page: number = 1, pageSize: number = 10) => {
    try {
      const response = await axios.get<NewsResponse>('/api/news', {
        params: {
          page,
          pageSize
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch news:', error);
      throw error;
    }
  },

  searchNews: async (keyword: string, page: number = 1, pageSize: number = 10) => {
    try {
      const response = await axios.get<NewsResponse>('/api/news', {
        params: {
          keyword,
          page,
          pageSize
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search news:', error);
      throw error;
    }
  }
}; 