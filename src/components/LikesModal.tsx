import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { X, Heart, Loader2 } from 'lucide-react';
import { booksApi } from '../services/apiServices';
import toast from 'react-hot-toast';

interface LikesModalProps {
  bookId: string;
  onClose: () => void;
}

export default function LikesModal({ bookId, onClose }: LikesModalProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['book-likes', bookId],
    queryFn: () => booksApi.getBookLikes(bookId),
  });

  if (isError) {
    toast.error((error as any).response?.data?.error || 'Failed to load likes');
    onClose();
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Heart size={15} fill="#ef4444" color="#ef4444" />
            <h3>Likes</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '300px', overflowY: 'auto', padding: '16px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Loader2 size={24} className="spin" color="#ef4444" />
            </div>
          ) : data?.likedBy?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data?.likedBy?.map((user: any) => (
                <div key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>

                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>{user.name || 'Anonymous User'}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
              <Heart size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <p style={{ margin: 0 }}>No likes yet</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
