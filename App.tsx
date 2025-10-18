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
      // Revoke the old object URL to prevent memory leaks
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
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
      <div className="w-full max-w-2xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Trình trích xuất <span className="text-teal-700">Thời Khóa Biểu</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Tải lên ảnh thời khóa biểu và tên giáo viên để xem lịch dạy chi tiết.
          </p>
        </header>

        <main className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Image Upload */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-800">
                1. Tải lên ảnh thời khóa biểu
              </label>
              {imageUrl ? (
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <img src={imageUrl} alt="Xem trước thời khóa biểu" className="rounded-lg shadow-md max-h-64 w-auto mx-auto border" />
                   <label htmlFor="file-upload" className="mt-4 inline-block cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700">
                      <span>Thay đổi ảnh</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                   </label>
                </div>
              ) : (
                <label htmlFor="file-upload" className="relative block w-full h-48 border-2 border-gray-300 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-teal-700 transition-colors">
                  <div className="flex flex-col items-center justify-center h-full">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                    <span className="mt-2 block text-sm font-medium text-teal-700">
                      Nhấn để tải lên
                    </span>
                    <span className="block text-xs text-gray-500">hoặc kéo và thả tệp</span>
                  </div>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </label>
              )}
            </div>

            {/* Step 2: Teacher Name */}
            <div className="space-y-2">
              <label htmlFor="teacher-name" className="text-lg font-semibold text-gray-800">
                2. Nhập tên giáo viên
              </label>
              <input
                type="text"
                name="teacher-name"
                id="teacher-name"
                className="shadow-sm focus:ring-teal-700 focus:border-teal-700 block w-full text-base border-gray-300 rounded-md p-3"
                placeholder="VD: Hạnh"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                required
              />
            </div>
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !imageFile || !teacherName}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 disabled:bg-teal-500 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
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
            <p>Thuộc sở hữu của Phạm Thị Mỹ Hạnh ❤️</p>
        </footer>
      </div>
    </div>
  );
};

export default App;