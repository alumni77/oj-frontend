import request from '@/utils/request'

enum API {
  GENERATE_USER_EXCEL = '/file/generate-user-excel',
}

// 生成用户数据的Excel文件
export const generateUserExcel = (key: string) => {
  return request.get(API.GENERATE_USER_EXCEL, {
    params: { key },
    responseType: 'blob', // 设置响应类型为blob
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  })
}
