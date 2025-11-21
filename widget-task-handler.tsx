
import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { DebtWidget } from './DebtWidget';
import { HelloWidget } from './HelloWidget';
import { computeAge, computeDaysLeft, computeDebt, formatCurrency, resolveTargetDate } from './lib/debt';
import { loadSettings, loadTransactions } from './lib/storage';


const nameToWidget = {
    Hello: HelloWidget,
    Debt: DebtWidget,
};

registerWidgetTaskHandler(async (task) => {

    return widgetTaskHandler(task);
});


// widget-task-handler.tsx
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;

    if (widgetInfo.widgetName === 'Debt') {
        // Handle click to refresh
        if (props.widgetAction === 'WIDGET_CLICK') {
            const clickAction = props.clickAction;

            if (clickAction === 'REFRESH') {
                // Recalculate and re-render the widget
                const settings = await loadSettings();
                const transactions = await loadTransactions();

                const target = resolveTargetDate(
                    settings.targetMode,
                    settings.dobISO,
                    settings.targetDateISO,
                    settings.targetAgeYears
                );

                const daysLeft = computeDaysLeft(target);
                const debtValue = computeDebt(
                    settings.dailyRate,
                    settings.startDateISO,
                    transactions
                );

                const ageVal = computeAge(settings.dobISO);
                const ageStr = ageVal !== null ? ageVal.toFixed(8) : '—';

                const formattedDebt = formatCurrency(debtValue, settings.currency);
                const daysLeftStr = daysLeft === null ? '—' : String(daysLeft);

                props.renderWidget(
                    <DebtWidget
                        debt={formattedDebt}
                        daysLeft={daysLeftStr}
                        age={ageStr}
                        currency={settings.currency}
                    />
                );

                return;
            }
        }

        // Handle regular updates (WIDGET_ADDED, WIDGET_UPDATE, etc.)
        const settings = await loadSettings();
        const transactions = await loadTransactions();

        const target = resolveTargetDate(
            settings.targetMode,
            settings.dobISO,
            settings.targetDateISO,
            settings.targetAgeYears
        );

        const daysLeft = computeDaysLeft(target);
        const debtValue = computeDebt(
            settings.dailyRate,
            settings.startDateISO,
            transactions
        );

        const ageVal = computeAge(settings.dobISO);
        const ageStr = ageVal !== null ? ageVal.toFixed(8) : '—';

        const formattedDebt = formatCurrency(debtValue, settings.currency);
        const daysLeftStr = daysLeft === null ? '—' : String(daysLeft);

        props.renderWidget(
            <DebtWidget
                debt={formattedDebt}
                daysLeft={daysLeftStr}
                age={ageStr}
                currency={settings.currency}
            />
        );

        return;
    }

    // Handle other widgets...
}