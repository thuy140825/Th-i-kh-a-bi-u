import { GoogleGenAI, Type } from "@google/genai";
import type { ScheduleEntry } from '../types';

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const extractTimetable = async (
  imageData: string,
  imageMimeType: string,
  teacherName: string
): Promise<ScheduleEntry[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = fileToGenerativePart(imageData, imageMimeType);

  const textPart = {
    text: `
      Nhiệm vụ của bạn là một chuyên gia trích xuất dữ liệu. Phân tích hình ảnh thời khóa biểu được cung cấp và trích xuất TOÀN BỘ lịch dạy cho giáo viên được chỉ định.

      Tên giáo viên cần tìm: ${teacherName}

      Để đảm bảo độ chính xác tuyệt đối, hãy tham khảo ví dụ hoàn hảo dưới đây về kết quả trích xuất cho giáo viên tên "Hạnh". Nhiệm vụ của bạn là áp dụng logic tương tự để đạt được kết quả chính xác như vậy.

      **Ví dụ về kết quả chính xác cho giáo viên "Hạnh":**
      [
        {"thu":"Hai", "buoi":"Chiều", "tiet":"1", "tenLop":"4A", "tenMonHoc":"T.Việt"},
        {"thu":"Hai", "buoi":"Chiều", "tiet":"2", "tenLop":"4A", "tenMonHoc":"Khoa học"},
        {"thu":"Hai", "buoi":"Chiều", "tiet":"3", "tenLop":"4A", "tenMonHoc":"Khoa học"},
        {"thu":"Ba", "buoi":"Sáng", "tiet":"1", "tenLop":"4A", "tenMonHoc":"Toán"},
        {"thu":"Ba", "buoi":"Sáng", "tiet":"2", "tenLop":"4A", "tenMonHoc":"Toán"},
        {"thu":"Ba", "buoi":"Sáng", "tiet":"3", "tenLop":"4A", "tenMonHoc":"T.Việt"},
        {"thu":"Ba", "buoi":"Sáng", "tiet":"4", "tenLop":"4A", "tenMonHoc":"HĐTN"},
        {"thu":"Ba", "buoi":"Chiều", "tiet":"1", "tenLop":"4A", "tenMonHoc":"Đạo đức"},
        {"thu":"Ba", "buoi":"Chiều", "tiet":"2", "tenLop":"4A", "tenMonHoc":"LS-ĐL"},
        {"thu":"Ba", "buoi":"Chiều", "tiet":"3", "tenLop":"4A", "tenMonHoc":"LS-ĐL"},
        {"thu":"Tư", "buoi":"Sáng", "tiet":"1", "tenLop":"2E", "tenMonHoc":"TNXH"},
        {"thu":"Tư", "buoi":"Sáng", "tiet":"2", "tenLop":"2E", "tenMonHoc":"TNXH"},
        {"thu":"Tư", "buoi":"Sáng", "tiet":"3", "tenLop":"2E", "tenMonHoc":"Đạo Đức"},
        {"thu":"Tư", "buoi":"Sáng", "tiet":"4", "tenLop":"2E", "tenMonHoc":"HĐTN"},
        {"thu":"Tư", "buoi":"Chiều", "tiet":"1", "tenLop":"1E", "tenMonHoc":"TNXH"},
        {"thu":"Tư", "buoi":"Chiều", "tiet":"2", "tenLop":"1E", "tenMonHoc":"TNXH"},
        {"thu":"Tư", "buoi":"Chiều", "tiet":"3", "tenLop":"1E", "tenMonHoc":"Đạo Đức"},
        {"thu":"Năm", "buoi":"Sáng", "tiet":"3", "tenLop":"4A", "tenMonHoc":"T.Việt"},
        {"thu":"Năm", "buoi":"Sáng", "tiet":"4", "tenLop":"4A", "tenMonHoc":"T.Việt"},
        {"thu":"Năm", "buoi":"Chiều", "tiet":"1", "tenLop":"2G", "tenMonHoc":"TNXH"},
        {"thu":"Năm", "buoi":"Chiều", "tiet":"2", "tenLop":"2G", "tenMonHoc":"TNXH"},
        {"thu":"Năm", "buoi":"Chiều", "tiet":"3", "tenLop":"2G", "tenMonHoc":"Đạo Đức"}
      ]

      **Yêu cầu:**
      Bây giờ, hãy phân tích kỹ lưỡng hình ảnh tôi đã cung cấp. Áp dụng logic bạn đã học từ ví dụ trên để tìm TẤT CẢ các tiết dạy của giáo viên '${teacherName}'.

      Trả về kết quả dưới dạng một mảng JSON các đối tượng, tuân thủ nghiêm ngặt cấu trúc đã được trình bày trong ví dụ. Nếu không tìm thấy lịch dạy, hãy trả về một mảng rỗng.
    `,
  };

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        thu: { type: Type.STRING },
        buoi: { type: Type.STRING },
        tiet: { type: Type.STRING },
        tenLop: { type: Type.STRING },
        tenMonHoc: { type: Type.STRING },
      },
      required: ["thu", "buoi", "tiet", "tenLop", "tenMonHoc"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using a powerful model for better pattern recognition
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const jsonString = response.text;
    const parsedData = JSON.parse(jsonString);
    
    if (Array.isArray(parsedData)) {
      return parsedData;
    }
    return [];

  } catch (error) {
    console.error("Error extracting timetable:", error);
    throw new Error("Không thể trích xuất thời khóa biểu. Vui lòng thử lại.");
  }
};