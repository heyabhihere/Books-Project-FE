import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Calendar, Users, ArrowRight, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';

const GENDER_OPTIONS = [
  { value: 1, label: 'Male' },
  { value: 2, label: 'Female' },
  { value: 3, label: 'Other' },
];

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { setUser } = useAuthStore();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<number | ''>('');
  const [dob, setDob] = useState('');

  const updateMutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        name: name || undefined,
        gender: gender !== '' ? Number(gender) : undefined,
        DOB: dob || undefined,
      }),
    onSuccess: (data) => {
      setUser(data.data);
      toast.success('Profile updated!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Update failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <User size={22} />
            <h2>Complete your profile</h2>
          </div>
          <button id="modal-close-btn" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" style={{ marginTop: '20px' }}>
          <div className="field-group">
            <label className="field-label">Full Name</label>
            <div className="field-input-wrap">
              <User className="field-icon" size={18} />
              <input
                id="profile-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Gender</label>
            <div className="field-input-wrap">
              <Users className="field-icon" size={18} />
              <select
                id="profile-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value !== '' ? Number(e.target.value) : '')}
                className="field-input field-select"
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Date of Birth</label>
            <div className="field-input-wrap">
              <Calendar className="field-icon" size={18} />
              <input
                id="profile-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="field-input"
              />
            </div>
          </div>

          <div className="modal-actions" style={{ flexDirection: 'column', gap: '10px' }}>
            <button
              id="profile-submit-btn"
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {updateMutation.isPending ? (
                <span className="spinner" />
              ) : (
                <>
                  <CheckCircle size={18} />
                  Save & Continue
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <button
              id="profile-skip-btn"
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ width: '100%', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
