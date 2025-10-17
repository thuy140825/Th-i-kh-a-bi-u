
import React, { useState, useCallback } from 'react';
import { extractTimetable } from './services/geminiService';
import type { ScheduleEntry } from './types';
import Loader from './components/Loader';
import ScheduleTable from './components/ScheduleTable';

const App: React.FC = () => {
  const [teacherName, setTeacherName] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setSchedule(null);
      setError(null);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove the data URI prefix
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !teacherName) {
      setError('Vui lòng tải lên hình ảnh và nhập tên giáo viên.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSchedule(null);

    try {
      const base64Data = await convertFileToBase64(imageFile);
      const result = await extractTimetable(base64Data, imageFile.type, teacherName);
      setSchedule(result);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, teacherName]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Trình trích xuất <span className="text-indigo-600">Thời Khóa Biểu</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Tải lên ảnh thời khóa biểu và tên giáo viên để xem lịch dạy chi tiết.
          </p>
        </header>

        <main className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Uploader */}
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh thời khóa biểu
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Tải lên một tệp</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                      </label>
                      <p className="pl-1">hoặc kéo và thả</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF lên đến 10MB</p>
                  </div>
                </div>
              </div>
              
              {/* Teacher Input & Image Preview */}
              <div className="space-y-6">
                <div>
                    <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700">
                      Tên giáo viên
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="teacher-name"
                        id="teacher-name"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                        placeholder="VD: Nguyễn Văn A"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                      />
                    </div>
                </div>
                {imageUrl && (
                    <div className="mt-4">
                        <p className="block text-sm font-medium text-gray-700 mb-2">Ảnh xem trước:</p>
                        <img src={imageUrl} alt="Timetable preview" className="rounded-lg shadow-md max-h-40 w-auto border" />
                    </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Trích xuất thời khóa biểu'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            {isLoading && <Loader />}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Lỗi! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {schedule && <ScheduleTable schedule={schedule} teacherName={teacherName} />}
          </div>
        </main>

        <footer className="text-center mt-10 text-sm text-gray-500">
            <p>Được cung cấp bởi Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
