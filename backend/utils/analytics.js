const startOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const getMonthlyBuckets = (months = 6) => {
  const buckets = [];
  const today = new Date();

  for (let index = months - 1; index >= 0; index -= 1) {
    const point = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - index, 1));
    buckets.push({
      key: `${point.getUTCFullYear()}-${String(point.getUTCMonth() + 1).padStart(2, '0')}`,
      label: point.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
      start: point,
      end: new Date(Date.UTC(point.getUTCFullYear(), point.getUTCMonth() + 1, 1))
    });
  }

  return buckets;
};

const mapMonthlyTotals = ({ documents, dateField = 'createdAt', amountField = 'totalAmount', months = 6 }) => {
  const buckets = getMonthlyBuckets(months).map((bucket) => ({
    name: bucket.label,
    value: 0,
    count: 0,
    start: bucket.start,
    end: bucket.end
  }));

  documents.forEach((document) => {
    const date = new Date(document[dateField]);
    const bucket = buckets.find((entry) => date >= entry.start && date < entry.end);

    if (bucket) {
      bucket.value += Number(document[amountField] || 0);
      bucket.count += 1;
    }
  });

  return buckets.map(({ name, value, count }) => ({ name, value, count }));
};

module.exports = {
  startOfMonth,
  getMonthlyBuckets,
  mapMonthlyTotals
};

