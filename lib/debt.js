const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_YEAR = MS_PER_DAY * 365.25;

export function computeDebt(dailyRate, startDateISO, transactions) {
  console.log('🔄 [DEBT] computeDebt called at:', new Date().toLocaleTimeString());
  
  if (!startDateISO) {
    console.log('⚠️ [DEBT] No start date provided');
    return 0;
  }

  const startDate = new Date(startDateISO);
  startDate.setUTCHours(0, 0, 0, 0);
  const now = new Date();
  
  // Calculate elapsed time in milliseconds (real-time, not just days)
  const elapsedMs = now.getTime() - startDate.getTime();
  
  // Calculate debt based on actual elapsed time
  // dailyRate / MS_PER_DAY gives us the rate per millisecond
  const ratePerMs = dailyRate / MS_PER_DAY;
  const baseDebt = elapsedMs * ratePerMs;

  let transactionTotal = 0;
  for (const t of transactions) {
    if (t.type === 'credit') {
      transactionTotal -= t.amount;
    } else if (t.type === 'debit') {
      transactionTotal += t.amount;
    }
  }

  const totalDebt = baseDebt + transactionTotal;
  console.log('💰 [DEBT] Calculated:', {
    elapsedMs,
    elapsedDays: (elapsedMs / MS_PER_DAY).toFixed(4),
    baseDebt: baseDebt.toFixed(2),
    transactionTotal,
    totalDebt: totalDebt.toFixed(2),
    dailyRate,
    ratePerSecond: (ratePerMs * 1000).toFixed(6)
  });

  return totalDebt;
}

export function resolveTargetDate(targetMode, dobISO, targetDateISO, targetAgeYears) {
  if (targetMode === 'date' && targetDateISO) {
    return new Date(targetDateISO);
  }
  if (targetMode === 'age' && dobISO && targetAgeYears > 0) {
    const dob = new Date(dobISO);
    const targetDate = new Date(dob.getTime() + targetAgeYears * MS_PER_YEAR);
    return targetDate;
  }
  return null;
}

export function computeDaysLeft(targetDate) {
  if (!targetDate) {
    return null;
  }
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setUTCHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.floor(diff / MS_PER_DAY);
}

export function computeAge(dobISO) {
  console.log('🔄 [AGE] computeAge called at:', new Date().toLocaleTimeString());
  
  if (!dobISO) {
    console.log('⚠️ [AGE] No DOB provided');
    return null;
  }
  
  const dob = new Date(dobISO);
  const now = new Date();
  const ageInMs = now.getTime() - dob.getTime();
  const ageInYears = ageInMs / MS_PER_YEAR;
  
  console.log('👤 [AGE] Calculated:', {
    dob: dobISO,
    currentTime: now.toLocaleTimeString(),
    ageInYears: ageInYears.toFixed(8)
  });
  
  return ageInYears;
}

export function formatCurrency(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  } catch {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value) + ' ' + currency;
  }
}

export function formatDate(timestamp) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}
