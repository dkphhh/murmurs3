
export interface FromResponse {
    error: boolean,
    description?: string,
}

export interface UploadingFileNotification {
    isUploading: boolean,
    isWrongType: boolean,
    wrongTypeMessage: string,
}

export interface SearchNotification {
    query: string
    isValidQuery: boolean,

}

// 表单返回结果
export const formNotification: FromResponse = $state({ error: false })

// 文件上传相关通知
export const uploadingFileNotification: UploadingFileNotification = $state({ isUploading: false, isWrongType: false, wrongTypeMessage: "" });

// 页面加载相关通知
export const pageLoadingNotification = $state({ error: false, errorMessage: "" });

// 搜索相关通知
export const searchNotification: SearchNotification = $state({ isValidQuery: true, query: "" })


// 通知10秒后自动关闭
export const notificationTimeout = $state(3000);

