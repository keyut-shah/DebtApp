// lib/widgetUtils.ts
import { requestWidgetUpdate } from 'react-native-android-widget';

export const updateDebtWidget = () => {
    requestWidgetUpdate({
        widgetName: 'Debt',
        renderWidget: () => { }, // Empty function - actual rendering happens in task handler
        widgetNotFound: () => {
            console.log('Debt widget not found on home screen');
        },
    });
};