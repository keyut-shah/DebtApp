// index.ts
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widget-task-handler';

// For Expo Router
import 'expo-router/entry';

registerWidgetTaskHandler(widgetTaskHandler);