

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Editor } from "@tinymce/tinymce-react";
import PageSkeleton from '@/components/PageSkeleton';
import { Faq } from '@/types/client/faq';


export default function FaqManager() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/faq');
      setFaqs(res.data);
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    try {
      if (editingId) {
        await axios.put('/api/admin/faq', {
          id: editingId,
          question,
          answer,
        });
        setEditingId(null);
      } else {
        await axios.post('/api/admin/faq', { question, answer });
      }

      setQuestion('');
      setAnswer('');
      fetchFaqs();
    } catch (err) {
      console.error('Failed to submit FAQ:', err);
      setError('Failed to submit FAQ');
    }
  };

  const confirmDelete = (id: string) => {
    setFaqToDelete(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;

    try {
      await axios.delete("/api/admin/faq", { data: { id: faqToDelete } });
      fetchFaqs();
      setShowConfirm(false);
      setFaqToDelete(null);
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
      setError('Failed to delete FAQ');
    }
  };

  const handleEdit = (faq: Faq) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditingId(faq.id);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">FAQs</h2>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Enter Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {/* <textarea
          className="w-full p-2 border rounded"
          placeholder="Enter Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        /> */}

        <Editor
          value={answer}
          onEditorChange={(content) => setAnswer(content)}
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
          tinymceScriptSrc={`https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY}/tinymce/6/tinymce.min.js`}
          init={{
            height: 300,
            menubar: false,
            plugins: "link image media table code fullscreen",
            toolbar:
              "code | fontsize | bold italic underline strikethrough superscript subscript | alignleft aligncenter alignright alignjustify | outdent indent | link image media | table | fullscreen | undo redo",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          }}
        />

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          {editingId ? 'Update FAQ' : 'Add FAQ'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setQuestion('');
              setAnswer('');
            }}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Error Message */}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* FAQ List */}
      {loading ? (<PageSkeleton type="faq" />
      ) : (
        <ul className="space-y-4">
          {faqs.length > 0 ? (
            faqs.map((faq) => (
              <li key={faq.id} className="border p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{faq.question}</p>
                    {/* <p className="text-gray-700">{faq.answer}</p> */}

                    {/* <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: faq.answer }} >
                    </p> */}
                    <div
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: faq?.answer ?? "" }}
                    >
                    </div>

                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(faq.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No FAQs available.</p>
          )}
        </ul>
      )}

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Are you sure you want to delete this FAQ?</h3>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowConfirm(false);
                  setFaqToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
