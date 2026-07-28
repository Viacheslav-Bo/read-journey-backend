import { openLibraryClient } from '../../lib/openLibraryClient.js';
import {
  OpenLibrarySearchResponse,
  OpenLibraryDefaultResponse,
} from '../../types/openLibrary.js';
import { DEFAULT_BOOKS } from '../../constants/defaultBooks.js';
import axios from 'axios';
export const fetchBooks = async (
  page: number,
  limit: number,
  title?: string,
  author?: string,
) => {
  try {
    const offset = (page - 1) * limit;
    const hasFilters = Boolean(title || author);

    if (hasFilters) {
      const response = await openLibraryClient.get<OpenLibrarySearchResponse>(
        '/search.json',
        { params: { title, author, offset, limit } },
      );

      const books = response.data.docs.map((doc) => ({
        openLibraryId: doc.key,
        title: doc.title,
        author: doc.author_name?.[0] ?? 'Unknown',
        coverUrl: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : `https://game-icons.net/icons/ffffff/000000/1x1/willdabeast/white-book.svg`,
        totalPages: doc.number_of_pages_median ?? null,
      }));

      const totalItems = response.data.numFound;
      const totalPages = Math.ceil(totalItems / limit);

      return { books, totalItems, totalPages, page };
    }
    const response = await openLibraryClient.get<OpenLibraryDefaultResponse>(
      `/subjects/${DEFAULT_BOOKS}.json`,
      { params: { offset, limit } },
    );

    const books = response.data.works.map((work: any) => ({
      openLibraryId: work.key,
      title: work.title,
      author: work.authors?.[0]?.name ?? 'Unknown',
      coverUrl: work.cover_id
        ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg`
        : `https://game-icons.net/icons/ffffff/000000/1x1/willdabeast/white-book.svg`,
      totalPages: null,
    }));

    const totalItems = response.data.work_count ?? books.length;
    const totalPages = Math.ceil(totalItems / limit);

    return { books, totalItems, totalPages, page };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Open Library error response:', error.response?.data);
    }
    throw error;
  }
};
