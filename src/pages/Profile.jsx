import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    fullName: user?.address?.fullName || '',
    phone: user?.address?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    country: user?.address?.country || 'India',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { name, email, ...address } = form;
      await updateProfile({ name, email, address });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-app py-8">
      <h1 className="heading">My Profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your account and shipping details
      </p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="mt-8 grid gap-6 lg:grid-cols-2"
      >
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold">Account Info</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                readOnly
                className="input cursor-not-allowed bg-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold">Shipping Address</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Street</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default Profile;
