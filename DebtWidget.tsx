// DebtWidget.tsx
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface DebtWidgetProps {
    debt: string;
    daysLeft: string;
    age: string;
    currency: string;
}

export function DebtWidget({ debt, daysLeft, age, currency }: DebtWidgetProps) {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 0,
                flexDirection: 'column',
            }}
            clickAction="REFRESH"
        >
            {/* Header with gradient-like effect using lighter shade */}
            <FlexWidget
                style={{
                    backgroundColor: '#F8F9FA',
                    borderRadius: 24,
                    padding: 18,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <FlexWidget style={{ flexDirection: 'column' }}>
                    <TextWidget
                        text="💰 TOTAL DEBT"
                        style={{
                            fontSize: 11,
                            color: '#6B7280',
                            fontFamily: 'Inter',
                            marginBottom: 6,
                            letterSpacing: 1.2,
                        }}
                    />
                    <TextWidget
                        text={debt}
                        style={{
                            fontSize: 34,
                            color: '#DC2626',
                            fontFamily: 'Inter',
                            fontWeight: 'bold',
                        }}
                    />
                </FlexWidget>

                {/* Refresh Button */}

            </FlexWidget>

            {/* Stats Row with Cards */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 16,
                    paddingTop: 14,
                }}
            >
                {/* Days Left Card */}
                <FlexWidget
                    style={{
                        flex: 1,
                        backgroundColor: '#FEF3C7',
                        borderRadius: 16,
                        padding: 14,
                        marginRight: 8,
                    }}
                >
                    <TextWidget
                        text="⏳ DAYS LEFT"
                        style={{
                            fontSize: 10,
                            color: '#92400E',
                            fontFamily: 'Inter',
                            marginBottom: 6,
                            letterSpacing: 0.8,
                        }}
                    />
                    <TextWidget
                        text={daysLeft}
                        style={{
                            fontSize: 26,
                            color: '#D97706',
                            fontFamily: 'Inter',
                            fontWeight: 'bold',
                        }}
                    />
                </FlexWidget>

                {/* Age Card */}
                <FlexWidget
                    style={{
                        flex: 1,
                        backgroundColor: '#D1FAE5',
                        borderRadius: 16,
                        padding: 14,
                        marginLeft: 8,
                    }}
                >
                    <TextWidget
                        text="👤 CURRENT AGE"
                        style={{
                            fontSize: 10,
                            color: '#065F46',
                            fontFamily: 'Inter',
                            marginBottom: 6,
                            letterSpacing: 0.8,
                        }}
                    />
                    <TextWidget
                        text={age}
                        style={{
                            fontSize: 26,
                            color: '#059669',
                            fontFamily: 'Inter',
                            fontWeight: 'bold',
                        }}
                    />
                </FlexWidget>
            </FlexWidget>

            {/* Footer with update info and floating refresh button */}
            <FlexWidget
                style={{
                    padding: 10,
                    paddingTop: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <TextWidget
                    text="Auto-updates hourly"
                    style={{
                        fontSize: 9,
                        color: '#9CA3AF',
                        fontFamily: 'Inter',
                    }}
                />

                {/* Floating Refresh Button */}
                <FlexWidget
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: '#3B82F6',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    clickAction="REFRESH"
                >
                    <TextWidget
                        text="↻"
                        style={{
                            fontSize: 20,
                            color: '#FFFFFF',
                        }}
                    />
                </FlexWidget>
            </FlexWidget>
        </FlexWidget>
    );
}