const buildListOptions = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const search = (query.search || '').trim();
  const sort = query.sort || '-createdAt';

  return { page, limit, skip, search, sort };
};

const sendPaginatedResponse = async ({ model, filter = {}, query, populate, select, transform }) => {
  const { page, limit, skip, sort } = buildListOptions(query);
  let cursor = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (populate) {
    const populateEntries = Array.isArray(populate) ? populate : [populate];
    populateEntries.filter(Boolean).forEach((entry) => {
      cursor = cursor.populate(entry);
    });
  }

  if (select) {
    cursor = cursor.select(select);
  }

  const [items, total] = await Promise.all([
    cursor,
    model.countDocuments(filter)
  ]);

  return {
    items: transform ? items.map(transform) : items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

module.exports = {
  buildListOptions,
  sendPaginatedResponse
};

