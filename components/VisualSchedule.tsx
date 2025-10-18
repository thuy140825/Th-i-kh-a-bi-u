import React from 'react';
import type { ScheduleEntry } from '../types';

// Helper to transform schedule data into a kid-friendly grid format
const transformScheduleForKids = (schedule: ScheduleEntry[]) => {
  const grid: Record<string, Record<string, Record<string, { tenLop: string; tenMonHoc: string }>>> = {
    Sáng: {},
    Chiều: {},
  };
  const days = ["Hai", "Ba", "Tư", "Năm", "Sáu"];
  days.forEach(day => {
    grid.Sáng[day] = {};
    grid.Chiều[day] = {};
  });

  schedule.forEach(entry => {
    const { buoi, thu, tiet, tenLop, tenMonHoc } = entry;
    // Ensure buoi is one of the expected keys
    if ((buoi === 'Sáng' || buoi === 'Chiều') && grid[buoi][thu]) {
      grid[buoi][thu][tiet] = { tenLop, tenMonHoc };
    }
  });
  return grid;
};

interface VisualScheduleProps {
  schedule: ScheduleEntry[];
  teacherName: string;
  semester: string;
  week: string;
}

const VisualSchedule = React.forwardRef<HTMLDivElement, VisualScheduleProps>(
  ({ schedule, teacherName, semester, week }, ref) => {
    const grid = transformScheduleForKids(schedule);
    const orderedDays = ["Hai", "Ba", "Tư", "Năm", "Sáu"];
    
    // Dynamically determine periods based on data
    const morningPeriodsSet = new Set<number>();
    const afternoonPeriodsSet = new Set<number>();
    schedule.forEach(entry => {
        const periodNum = parseInt(entry.tiet, 10);
        if (!isNaN(periodNum)) {
            if (entry.buoi === 'Sáng') {
                morningPeriodsSet.add(periodNum);
            } else if (entry.buoi === 'Chiều') {
                afternoonPeriodsSet.add(periodNum);
            }
        }
    });

    // Use data-driven periods, with a fallback for empty schedules to maintain structure.
    const morningPeriods = morningPeriodsSet.size > 0 ? Array.from(morningPeriodsSet).sort((a, b) => a - b) : [1, 2, 3, 4];
    const afternoonPeriods = afternoonPeriodsSet.size > 0 ? Array.from(afternoonPeriodsSet).sort((a, b) => a - b) : [1, 2, 3, 4];

    const dayColors: { [key: string]: string } = {
      Hai: 'bg-[#4FC3F7]',
      Ba: 'bg-[#94C77D]',
      Tư: 'bg-[#FFD54F]',
      Năm: 'bg-[#FFB74D]',
      Sáu: 'bg-[#F08A83]',
    };
    
    const dayNames: { [key: string]: string } = {
      Hai: "Thứ hai",
      Ba: "Thứ ba",
      Tư: "Thứ tư",
      Năm: "Thứ năm",
      Sáu: "Thứ sáu",
    };

    return (
      <div ref={ref} className="p-8 bg-[#EBF5FF] font-['Nunito']" style={{ width: '1280px', height: '900px'}}>
        <div className="bg-white p-6 rounded-3xl shadow-2xl relative w-full h-full flex flex-col">
          {/* Decorative elements */}
          <div className="absolute top-2 left-2 text-5xl opacity-70">☁️</div>
          <div className="absolute top-2 right-2 text-5xl opacity-70">🌈</div>
          <div className="absolute bottom-2 left-8 translate-y-1/4 text-6xl opacity-70">✏️</div>
          <div className="absolute bottom-2 right-2 translate-y-1/4 text-5xl opacity-70">📚</div>

          <header className="text-center">
            <h1 className="text-8xl font-black text-[#29B6F6]" style={{ marginBottom: '25px', fontFamily: "'Paytone One', sans-serif", textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
              LỊCH BIỂU GIÁO ÁN
            </h1>
          </header>

           <div className="flex justify-around items-center my-4 text-xl font-bold text-gray-700 px-10">
              <p>Tên giáo viên: <span className="font-semibold text-gray-600">{teacherName}</span></p>
              <p>Kì học: <span className="font-semibold text-gray-600">{semester || '................'}</span></p>
              <p>Tuần thứ: <span className="font-semibold text-gray-600">{week || '................'}</span></p>
          </div>

          <div className="flex-grow px-2 flex">
            <table className="w-full h-full border-separate" style={{ borderSpacing: '8px' }}>
                <thead>
                    <tr>
                        <th className="w-28"></th> {/* Corner for Session */}
                        <th className="w-24"></th> {/* Corner for Period */}
                        {orderedDays.map(day => (
                            <th key={day} className={`${dayColors[day]} text-white text-xl font-bold rounded-xl py-2 shadow-md text-center`}>
                                {dayNames[day]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {morningPeriods.map((period, index) => (
                    <tr key={`sang-${period}`}>
                        {index === 0 && morningPeriods.length > 0 && (
                            <td rowSpan={morningPeriods.length} className="w-28 bg-[#4DD0E1] text-white font-black text-3xl rounded-2xl text-center align-middle shadow-inner">
                                SÁNG
                            </td>
                        )}
                        <td className="w-24 font-bold text-lg text-gray-600 text-center align-middle">
                            Tiết {period}
                        </td>
                        {orderedDays.map(day => {
                            const entry = grid.Sáng[day]?.[period.toString()];
                            return (
                                <td key={`${day}-sang-${period}`} className="bg-[#E0F7FA] rounded-xl p-2 text-center align-middle shadow-sm">
                                {entry ? (
                                    <div>
                                    <div className="font-bold text-cyan-800 text-base leading-tight">{entry.tenMonHoc}</div>
                                    <div className="text-sm text-gray-500 mt-1">{entry.tenLop}</div>
                                    </div>
                                ) : <div className="h-12"></div>}
                                </td>
                            )
                        })}
                    </tr>
                    ))}
                    {afternoonPeriods.map((period, index) => (
                    <tr key={`chieu-${period}`}>
                        {index === 0 && afternoonPeriods.length > 0 && (
                            <td rowSpan={afternoonPeriods.length} className="w-28 bg-[#7986CB] text-white font-black text-3xl rounded-2xl text-center align-middle shadow-inner">
                                CHIỀU
                            </td>
                        )}
                        <td className="w-24 font-bold text-lg text-gray-600 text-center align-middle">
                            Tiết {period}
                        </td>
                        {orderedDays.map(day => {
                            const entry = grid.Chiều[day]?.[period.toString()];
                            return (
                                <td key={`${day}-chieu-${period}`} className="bg-[#E8EAF6] rounded-xl p-2 text-center align-middle shadow-sm">
                                {entry ? (
                                    <div>
                                    <div className="font-bold text-indigo-800 text-base leading-tight">{entry.tenMonHoc}</div>
                                    <div className="text-sm text-gray-600 mt-1">{entry.tenLop}</div>
                                    </div>
                                ) : <div className="h-12"></div>}
                                </td>
                            )
                        })}
                    </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
);

export default VisualSchedule;