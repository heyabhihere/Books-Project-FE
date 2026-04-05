import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Users, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';

const GENDER_OPTIONS = [
  { value: 1, label: 'Male' },
  { value: 2, label: 'Female' },
  { value: 3, label: 'Other' },
];

export default function UpdateProfilePage() {
  const navigate = useNavigate();
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
      navigate('/home');
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
    <div className="auth-wrapper">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="auth-card wide-card">
        <div className="profile-header">
          <div className="profile-avatar-placeholder">
            <User size={40} />
          </div>
          <h1 className="auth-title">Complete your profile</h1>
          <p className="auth-subtitle">Tell us a bit about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button
            id="profile-submit-btn"
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary"
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
        </form>

        <button
          id="profile-skip-btn"
          className="skip-btn"
          onClick={() => navigate('/home')}
        >
          Skip for now →
        </button>
      </div>
    </div>
  );
}
