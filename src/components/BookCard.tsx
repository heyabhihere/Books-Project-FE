import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, User2, Heart, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { booksApi, GENRE_MAP } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';
import LikesModal from './LikesModal';

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

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  readOnly?: boolean;
}

export default function BookCard({ book, onEdit, readOnly = false }: BookCardProps) {
  const [showLikesModal, setShowLikesModal] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const isLiked = book.isLiked || false;

  const likeMutation = useMutation({
    mutationFn: () => booksApi.likeBook(book._id),
    onSuccess: (data) => {
      queryClient.setQueriesData({ queryKey: ['books'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            list: page.list?.map((b: any) =>
              b._id === book._id ? { ...b, likes: data.book.likes, isLiked: data.hasLiked } : b
            ),
          })),
        };
      });

      queryClient.setQueriesData({ queryKey: ['all-books'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            list: page.list?.map((b: any) =>
              b._id === book._id ? { ...b, likes: data.book.likes, isLiked: data.hasLiked } : b
            ),
          })),
        };
      });

      toast.success(data.message || (data.hasLiked ? 'Book liked!' : 'Book unliked!'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to toggle like');
    },
  });

  const handleLike = () => {
    if (!user) {
      toast.error('Please login to like books');
      return;
    }
    likeMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: () => booksApi.deleteBook(book._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book deleted');
    },
    onError: () => toast.error('Failed to delete book'),
  });

  const handleDelete = () => {
    if (window.confirm(`Delete "${book.bookName}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="book-card">
      <div className="book-image-wrap">
        <img
          src={book.image}
          alt={book.bookName}
          className="book-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://via.placeholder.com/300x400?text=No+Image';
          }}
        />
        <div className="book-genre-badge">
          {GENRE_MAP[book.genre] || `Genre ${book.genre}`}
        </div>
      </div>

      <div className="book-body">
        <h3 className="book-title">{book.bookName}</h3>

        <div className="book-meta">
          <span className="book-meta-item">
            <User2 size={13} />
            {book.author}
          </span>
          <span className="book-meta-item">
            <IndianRupee size={13} />
            {book.price.toFixed(2)}
          </span>
          <span className="book-meta-item" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                color: isLiked ? '#ef4444' : 'inherit'
              }}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
            </button>
            <span
              onClick={() => {
                if (!readOnly && book.likes && book.likes > 0) {
                  setShowLikesModal(true);
                } else if (!readOnly && (!book.likes || book.likes === 0)) {
                  toast.success('No one has liked this book yet');
                }
              }}
              style={{
                fontSize: '13px',
                cursor: !readOnly ? 'pointer' : 'default',
                textDecoration: !readOnly ? 'underline' : 'none'
              }}
            >
              {book.likes || 0}
            </span>
          </span>
        </div>

        {!readOnly && (
          <div className="book-actions">
            <button
              id={`edit-btn-${book._id}`}
              className="action-btn edit-btn"
              onClick={() => onEdit?.(book)}
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              id={`delete-btn-${book._id}`}
              className="action-btn delete-btn"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="spinner small" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete
            </button>
          </div>
        )}
      </div>

      {showLikesModal && (
        <LikesModal bookId={book._id} onClose={() => setShowLikesModal(false)} />
      )}
    </div>
  );
}
