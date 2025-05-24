class NotificationClass implements NotificationType {
    type: "error" | "info" | "warning" | undefined = $state(undefined)
    description = $state("");

}


export const localNotification = new NotificationClass();
export const notificationDuration = 3000; // 3 seconds