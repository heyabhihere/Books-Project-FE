import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, BookOpen, User, Tag, ImageIcon, Upload, Loader2, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { booksApi, uploadApi, GENRE_MAP } from '../services/apiServices';

interface BookFormProps {
  onClose: () => void;
  editBook?: {
    _id: string;
    bookName: string;
    author: string;
    genre: number;
    price: number;
    image: string;
  } | null;
}

export default function BookForm({ onClose, editBook }: BookFormProps) {
  const queryClient = useQueryClient();
  const [bookName, setBookName] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<number | ''>('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (editBook) {
      setBookName(editBook?.bookName);
      setAuthor(editBook?.author);
      setGenre(editBook?.genre);
      setPrice(String(editBook?.price));
      setImage(editBook?.image);
      setImagePreview(editBook?.image);
    }
  }, [editBook]);

  const addMutation = useMutation({
    mutationFn: () =>
      booksApi.addBook({ bookName, author, genre: Number(genre), price: Number(price), image }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book added successfully!');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to add book'),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      booksApi.updateBook(editBook!._id, { bookName, author, genre: Number(genre), price: Number(price), image }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book updated successfully!');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update book'),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadApi.uploadImage(file);
      setImage(result.url);
      setImagePreview(result.url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return toast.error('Please upload a book cover image');
    if (genre === '') return toast.error('Please select a genre');
    if (editBook) updateMutation.mutate();
    else addMutation.mutate();
  };

  const isLoading = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BookOpen size={22} />
            <h2>{editBook ? 'Edit Book' : 'Add New Book'}</h2>
          </div>
          <button id="modal-close-btn" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Image Upload */}
          <div className="image-upload-section">
            <div className="image-preview-wrap">
              {imagePreview ? (
                <img src={imagePreview} alt="Book cover" className="image-preview" />
              ) : (
                <div className="image-placeholder">
                  <ImageIcon size={36} />
                  <span>Book Cover</span>
                </div>
              )}
            </div>
            <label id="image-upload-label" className="upload-btn" htmlFor="book-image-input">
              {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading...' : 'Upload Cover'}
            </label>
            <input
              id="book-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </div>

          <div className="modal-fields">
            <div className="field-group">
              <label className="field-label">Book Name</label>
              <div className="field-input-wrap">
                <BookOpen className="field-icon" size={16} />
                <input
                  id="book-name-input"
                  type="text"
                  placeholder="Enter book name"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  required
                  className="field-input"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Author</label>
              <div className="field-input-wrap">
                <User className="field-icon" size={16} />
                <input
                  id="book-author-input"
                  type="text"
                  placeholder="Author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="field-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Genre</label>
                <div className="field-input-wrap">
                  <Tag className="field-icon" size={16} />
                  <select
                    id="book-genre-select"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value !== '' ? Number(e.target.value) : '')}
                    className="field-input field-select"
                    required
                  >
                    <option value="">Select genre</option>
                    {Object.entries(GENRE_MAP).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Price ($)</label>
                <div className="field-input-wrap">
                  <IndianRupee className="field-icon" size={16} />
                  <input
                    id="book-price-input"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="field-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              id="modal-cancel-btn"
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              id="modal-submit-btn"
              type="submit"
              disabled={isLoading || uploading}
              className="btn-primary"
            >
              {isLoading ? <span className="spinner" /> : (editBook ? 'Update Book' : 'Add Book')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
