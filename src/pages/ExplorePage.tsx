import { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { BookOpen, Search, Library, Filter, Loader2, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { booksApi, GENRE_MAP } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';
import BookCard from '../components/BookCard';
import UserMenu from '../components/UserMenu';

interface Book {
  _id: string;
  bookName: string;
  author: string;
  genre: number;
  price: number;
  image: string;
  likes?: number;
  isLiked?: boolean;
}

const LIMIT = 8;

export default function ExplorePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genre, setGenre] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const handleGenreChange = (val: number) => setGenre(val);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['all-books', LIMIT, debouncedSearch, genre],
    queryFn: ({ pageParam = 1 }) =>
      booksApi.getAllBooks(pageParam as number, LIMIT, debouncedSearch, genre),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + (p.list?.length ?? 0), 0);
      return loaded < (lastPage.total ?? 0) ? allPages.length + 1 : undefined;
    },
  });

  const books: Book[] = data?.pages.flatMap((p) => p.list ?? []) ?? [];
  const total: number = data?.pages[0]?.total ?? 0;
  const hasActiveFilter = debouncedSearch || genre !== 0;

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="home-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="nav-logo-icon">
            <Library size={22} />
          </div>
          <span className="nav-logo-text">BookVault</span>
        </div>

        <div className="nav-search">
          <Search size={16} className="search-icon" />
          <input
            id="explore-search-input"
            type="text"
            placeholder="Search books or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <button
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              <LogIn size={16} />
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="home-main">
        <div className="home-header">
          <div>
            <h1 className="home-title">Explore Books</h1>
            <p className="home-subtitle">
              {total} book{total !== 1 ? 's' : ''} available
            </p>
          </div>

          <div className="header-right">
            <div className="genre-filter-wrapper">
              <Filter size={15} className="filter-icon" />
              <select
                id="explore-genre-filter-select"
                className="genre-select"
                value={genre}
                onChange={(e) => handleGenreChange(Number(e.target.value))}
              >
                <option value={0}>All Genres</option>
                {Object.entries(GENRE_MAP).map(([key, label]) => (
                  <option key={key} value={Number(key)}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Initial loading skeletons */}
        {isLoading ? (
          <div className="books-loading">
            {[...Array(LIMIT)].map((_, i) => (
              <div key={i} className="book-skeleton" />
            ))}
          </div>
        ) : isError ? (
          <div className="empty-state">
            <BookOpen size={56} className="empty-icon" />
            <h3>Failed to load books</h3>
            <p>Please check if the server is running and try again.</p>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={56} className="empty-icon" />
            <h3>{hasActiveFilter ? 'No books found' : 'No books available'}</h3>
            <p>
              {hasActiveFilter
                ? 'No results for your current filters'
                : 'There are currently no books added by any users.'}
            </p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book._id} book={book} readOnly />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel + loader */}
        <div ref={sentinelRef} className="scroll-sentinel">
          {isFetchingNextPage && (
            <div className="infinite-loader">
              <Loader2 size={22} className="spin" />
              <span>Loading more books…</span>
            </div>
          )}
          {!hasNextPage && books.length > 0 && !isLoading && (
            <p className="end-of-list">You've reached the end · {books.length} books loaded</p>
          )}
        </div>
      </main>
    </div>
  );
}
