export const RECALC_LISTING_PRICES_SQL = `
UPDATE car_listings
SET
  currentRateId = ?,
  currentRateSide = 'SALE',
  recalculatedAt = NOW(),

  priceUah = CASE originalCurrency
    WHEN 'UAH' THEN originalAmount
    WHEN 'USD' THEN ROUND(originalAmount * ?, 2)
    WHEN 'EUR' THEN ROUND(originalAmount * ?, 2)
  END,

  priceUsd = CASE originalCurrency
    WHEN 'USD' THEN originalAmount
    ELSE ROUND(
      (CASE originalCurrency
        WHEN 'UAH' THEN originalAmount
        WHEN 'EUR' THEN originalAmount * ?
      END) / ?, 2
    )
  END,

  priceEur = CASE originalCurrency
    WHEN 'EUR' THEN originalAmount
    ELSE ROUND(
      (CASE originalCurrency
        WHEN 'UAH' THEN originalAmount
        WHEN 'USD' THEN originalAmount * ?
      END) / ?, 2
    )
  END
WHERE status = 'ACTIVE';
`;
