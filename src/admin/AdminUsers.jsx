import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';
import Loader from '../components/Loader';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Users</h1>
        <p className="text-sm text-gray-500">{users.length} registered users</p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto rounded-2xl bg-white shadow-card dark:bg-brand-black-soft"
      >
        <table className="w-full text-sm">
          <thead className="bg-brand-pink-soft text-left text-xs uppercase text-brand-pink-dark dark:bg-brand-black">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                className="border-t border-gray-100 hover:bg-brand-pink-soft/20 dark:border-white/10 dark:hover:bg-brand-black"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-pink text-sm font-bold text-white">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium">{u.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      u.role === 'admin'
                        ? 'bg-brand-pink/10 text-brand-pink'
                        : 'bg-gray-100 text-gray-700 dark:bg-brand-black dark:text-gray-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AdminUsers;
