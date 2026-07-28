export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibraryDoc[];
}

export interface OpenLibraryDefaultResponse {
  work_count: number;
  works: {
    key: string;
    title: string;
    authors?: { name: string }[];
    cover_id?: number;
  }[];
}
