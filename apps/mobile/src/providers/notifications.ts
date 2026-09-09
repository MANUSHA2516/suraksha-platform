import * as Notifications from 'expo-notifications';
export interface NotificationProvider { requestPermission():Promise<boolean>;showLocal(title:string,body:string):Promise<void> }
export const deviceNotifications:NotificationProvider={async requestPermission(){const permission=await Notifications.requestPermissionsAsync();return permission.granted;},async showLocal(title,body){await Notifications.scheduleNotificationAsync({content:{title,body},trigger:null});}};
