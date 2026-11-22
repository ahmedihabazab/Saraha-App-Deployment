export async function findAndCount({
  model,
  filter,
  projection,
  options,
  pagenation = { limit: 5, page: 1 },
  populate = "",
} = {}) {
  const findQuery = model.find(filter, projection, options);
  if (pagenation) {
    const { limit = 5 , page } = pagenation;
    findQuery.skip((page - 1) * limit);
    findQuery.limit(limit);
  }

  return {docs : await findQuery.exec() , count : await model.countDocuments(filter)};
}

export async function findOne({ model, filter, projection, options } = {}) {
  const result = await model.findOne(filter, projection, options);
  return result;
}

export async function findById({ model, id, projection } = {}) {
  const result = await model.findById(id, projection);
  return result;
}

export async function create({ model, data, options } = {}) {
  return await model.create([data], options);
}

export async function deleteDoc({ model, filter } = {}) {
  return await model.deleteOne(filter);
}
