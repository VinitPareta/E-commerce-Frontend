import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiMessageCircle,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiX,
} from "react-icons/fi";
import api from "../utils/api";
import Loader from "../components/Loader";
import ReactMarkdown from "react-markdown";

const PAGE_SIZE = 10;

const AdminChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadChats = async (searchTerm = "", pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum,
        limit: PAGE_SIZE,
        search: searchTerm,
      });
      const { data } = await api.get(`/admin/chats?${params.toString()}`);
      setChats(data.chats || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats(search, page);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadChats(search, 1);
  };

  const handleViewChat = async (chatId) => {
    try {
      const { data } = await api.get(`/admin/chats/${chatId}`);
      setSelectedChat(data.chat);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Failed to fetch chat details:", err);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  };

  const truncate = (text, length = 50) => {
    return text && text.length > length
      ? text.substring(0, length) + "..."
      : text;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && chats.length === 0) return <Loader fullScreen />;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <FiMessageCircle className="text-brand-green" /> Chat Conversations
          </h1>
          <p className="text-sm text-gray-500">
            Manage and view all user chat conversations
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username, email, or question..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-black-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
        {[
          { label: "Total Chats", value: chats.length },
          { label: "Page", value: `${page} of ${totalPages}` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-brand-green">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white shadow-card dark:bg-brand-black-soft overflow-hidden"
      >
        {chats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                    User Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                    Question
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                    Answer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                    Messages
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {chats.map((chat, idx) => (
                  <motion.tr
                    key={chat._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium text-gray-900 dark:text-white break-words">
                        {chat.userName}
                      </p>
                      {chat.isGuest && (
                        <span className="text-xs text-gray-500">Guest</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        {chat.userEmail || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs line-clamp-2">
                        {truncate(chat.question, 50)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs line-clamp-2">
                        {truncate(chat.answer, 50)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                        {chat.totalMessages}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(chat.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewChat(chat._id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-green/10 px-3 py-1.5 text-xs font-medium text-brand-green hover:bg-brand-green/20 transition whitespace-nowrap"
                      >
                        <FiEye size={14} /> View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500">No chats found</p>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft />
          </button>
          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  page === p
                    ? "bg-brand-green text-white"
                    : "hover:bg-gray-100 dark:hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* Chat Detail Modal */}
      {showDetailModal && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl max-h-[80vh] rounded-2xl bg-white dark:bg-brand-black-soft shadow-xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 p-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedChat.userName}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedChat.userEmail}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedChat(null);
                }}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedChat.messages && selectedChat.messages.length > 0 ? (
                selectedChat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-brand-green text-white rounded-br-none"
                          : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-none"
                      }`}
                    >
                      <div className="text-sm break-words">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages to display</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-white/10 p-6">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Total Messages</p>
                  <p className="font-semibold text-brand-green">
                    {selectedChat.totalMessages}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">User Type</p>
                  <p className="font-semibold">
                    {selectedChat.isGuest ? "Guest" : "Registered"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-sm">
                    {formatDate(selectedChat.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminChats;
