import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { contentService } from "../../services/contentService";
import { getErrorMessage } from "../../lib/api";

const ALLOWED_FORMATS = [
  "audio/mpeg",
  "audio/wav",
  "audio/flac",
  "audio/x-flac",
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function ContentUpload() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const validateAudioFile = (file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return "Invalid file format. Only MP3, WAV, and FLAC are allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 100MB limit.";
    }
    return null;
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError("");

    if (file) {
      const error = validateAudioFile(file);
      if (error) {
        setValidationError(error);
        setAudioFile(null);
        e.target.value = "";
      } else {
        setAudioFile(file);
      }
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image file
      if (!file.type.startsWith("image/")) {
        setValidationError("Cover must be an image file.");
        setCoverFile(null);
        e.target.value = "";
      } else if (file.size > 5 * 1024 * 1024) {
        setValidationError("Cover image must be less than 5MB.");
        setCoverFile(null);
        e.target.value = "";
      } else {
        setCoverFile(file);
        setValidationError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationError("");

    if (!audioFile) {
      setValidationError("Please select an audio file.");
      return;
    }

    if (!title.trim()) {
      setValidationError("Please enter a title.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("title", title.trim());

      if (description.trim()) {
        formData.append("description", description.trim());
      }

      if (coverFile) {
        formData.append("cover", coverFile);
      }

      // Simulate progress (in a real app, you'd use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await contentService.uploadContent(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Redirect to content library after success
      setTimeout(() => {
        navigate("/creator/content");
      }, 500);
    } catch (err) {
      setError(getErrorMessage(err));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upload Content</h1>
        <p className="mt-2 text-gray-600">
          Share your music with your subscribers
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {validationError && (
            <div className="rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">{validationError}</p>
            </div>
          )}

          {/* Audio File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="audio-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload an audio file</span>
                    <input
                      id="audio-upload"
                      name="audio-upload"
                      type="file"
                      accept=".mp3,.wav,.flac"
                      onChange={handleAudioFileChange}
                      disabled={isUploading}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  MP3, WAV, or FLAC up to 100MB
                </p>
              </div>
            </div>
            {audioFile && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">{audioFile.name}</p>
                <p className="text-gray-500">
                  {formatFileSize(audioFile.size)}
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              placeholder="Enter track title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              placeholder="Add a description (optional)"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image (Optional)
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <label
                htmlFor="cover-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Choose Image
                <input
                  id="cover-upload"
                  name="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
              {coverFile && (
                <span className="text-sm text-gray-600">{coverFile.name}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, or GIF up to 5MB
            </p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/creator/content")}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !audioFile || !title.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
