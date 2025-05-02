
export interface FromResponse {
    error: boolean,
    description?: string,
}

export interface UploadingFileNotification {
    isUploading: boolean,
    isWrong: boolean,
    wrongMessage: string,
}

export interface SearchNotification {
    query: string
    isValidQuery: boolean,

}

export interface processingResponse {
    isProcessing: boolean,
    description: string,
}

// 表单返回结果
export const formNotification: FromResponse = $state({ error: false })

// 告知用户任务正在处理过程中的通知
export const processingNotification: processingResponse = $state({ isProcessing: false, description: "" });

// 文件上传相关通知
export const uploadingFileNotification: UploadingFileNotification = $state({ isUploading: false, isWrong: false, wrongMessage: "" });

// 页面加载相关通知
export const pageLoadingNotification = $state({ error: false, errorMessage: "" });

// 搜索相关通知
export const searchNotification: SearchNotification = $state({ isValidQuery: true, query: "" })


// 通知10秒后自动关闭
export const notificationTimeout = $state(3000);

