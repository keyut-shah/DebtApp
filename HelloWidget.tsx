import { FlexWidget, TextWidget } from 'react-native-android-widget';

export const HelloWidget = () => (
    <FlexWidget
        style={{
            height: 'match_parent',
            width: 'match_parent',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 16,
        }}
    >
        <TextWidget
            text="Hello Widget!"
            style={{
                fontSize: 32,
                color: '#000000',
            }}
        />
    </FlexWidget>
);