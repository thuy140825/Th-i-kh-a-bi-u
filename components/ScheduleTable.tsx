import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import type { ScheduleEntry } from '../types';
import VisualSchedule from './VisualSchedule';

interface ScheduleTableProps {
  schedule: ScheduleEntry[];
  teacherName: string;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedule, teacherName }) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const visualExportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingVisual, setIsExportingVisual] = useState(false);
  const [showVisualForExport, setShowVisualForExport] = useState(false);
  const [semester, setSemester] = useState('');
  const [week, setWeek] = useState('');

  const handleExportAsImage = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `thoi-khoa-bieu-${teacherName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Lỗi khi xuất ảnh:", error);
      alert("Đã xảy ra lỗi khi cố gắng xuất ảnh. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportVisual = () => {
    setIsExportingVisual(true);
    setShowVisualForExport(true);
  };

  useEffect(() => {
    if (!showVisualForExport || !visualExportRef.current) {
      return;
    }

    const exportVisual = async () => {
      try {
        const canvas = await html2canvas(visualExportRef.current!, {
          scale: 2,
          backgroundColor: '#EBF5FF',
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = `lich-bieu-giao-an-${teacherName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Lỗi khi xuất ảnh trực quan:", error);
        alert("Đã xảy ra lỗi khi cố gắng xuất ảnh trực quan. Vui lòng thử lại.");
      } finally {
        setShowVisualForExport(false);
        setIsExportingVisual(false);
      }
    };
    
    // Timeout to ensure component is fully rendered with styles
    const timer = setTimeout(exportVisual, 200);

    return () => clearTimeout(timer);
  }, [showVisualForExport, teacherName, semester, week]);


  if (schedule.length === 0) {
    return (
      <div className="mt-8 text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium">Không tìm thấy lịch dạy cho giáo viên "{teacherName}".</p>
        <p className="text-yellow-700 text-sm mt-1">Vui lòng kiểm tra lại tên giáo viên hoặc hình ảnh đã tải lên.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Kết quả trích xuất
        </h3>
      </div>

       {/* Inputs for Visual Export */}
       <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <p className="text-sm font-medium text-gray-600 mb-3">Tùy chỉnh thông tin cho ảnh xuất (Visual):</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="semester-input" className="block text-sm font-medium text-gray-700">Kì học</label>
                    <input
                        type="text"
                        id="semester-input"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        placeholder="VD: 2024-2025"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="week-input" className="block text-sm font-medium text-gray-700">Tuần thứ</label>
                    <input
                        type="text"
                        id="week-input"
                        value={week}
                        onChange={(e) => setWeek(e.target.value)}
                        placeholder="VD: Tuần 7"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                </div>
            </div>
       </div>


      <div className="flex justify-end items-center mb-4 gap-3">
        <button
        onClick={handleExportAsImage}
        disabled={isExporting}
        className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 disabled:bg-teal-500 disabled:cursor-not-allowed transition-colors"
        >
        {isExporting ? (
            <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xuất...
            </>
        ) : (
            <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất ảnh (Bảng)
            </>
        )}
        </button>
         <button
        onClick={handleExportVisual}
        disabled={isExportingVisual}
        className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 disabled:bg-teal-500 disabled:cursor-not-allowed transition-colors"
        >
        {isExportingVisual ? (
             <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tạo...
            </>
        ) : (
            <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Xuất ảnh (Visual)
            </>
        )}
        </button>
      </div>

      {/* This div will be captured */}
      <div ref={exportRef} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Thời khóa biểu của giáo viên: <span className="text-teal-700">{teacherName}</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thứ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buổi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiết</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Lớp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Môn Học</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedule.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.thu}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.buoi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.tiet}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.tenLop}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.tenMonHoc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showVisualForExport && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
            <VisualSchedule ref={visualExportRef} schedule={schedule} teacherName={teacherName} semester={semester} week={week} />
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;