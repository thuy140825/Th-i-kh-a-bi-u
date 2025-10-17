
import React from 'react';
import type { ScheduleEntry } from '../types';

interface ScheduleTableProps {
  schedule: ScheduleEntry[];
  teacherName: string;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedule, teacherName }) => {
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
       <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Thời khóa biểu của giáo viên: <span className="text-indigo-600">{teacherName}</span>
      </h3>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
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
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
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
  );
};

export default ScheduleTable;
