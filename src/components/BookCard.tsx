import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, DollarSign, User2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { booksApi, GENRE_MAP } from '../services/apiServices';

interface Book {
  _id: string;
  bookName: string;
  author: string;
  genre: number;
  price: number;
  image: string;
}

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  readOnly?: boolean;
}

export default function BookCard({ book, onEdit, readOnly = false }: BookCardProps) {
  const queryClient = useQueryClient();

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
            <DollarSign size={13} />
            {book.price.toFixed(2)}
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
    </div>
  );
}
