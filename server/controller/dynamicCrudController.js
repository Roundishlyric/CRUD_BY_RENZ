import { MODEL_MAP, AuditLog } from "../model/models.js";

/*HELPERS*/
const getModel = (modelName) => {
  const Model = MODEL_MAP[modelName];
  if (!Model) throw new Error(`Model '${modelName}' does not exist`);
  return Model;
};

const hasPath = (Model, path) => Boolean(Model.schema?.path(path));

const baseFilter = (Model) => (hasPath(Model, "isDeleted") ? { isDeleted: false } : {});

const writeAudit = async ({ model, recordId, action, req, before, after }) => {
  await AuditLog.create({
    model,
    recordId,
    action,
    actorId: req.user?.id || null,
    actorEmail: req.user?.email || null,
    before: before ?? null,
    after: after ?? null,
    at: new Date(),
  });
};

/*CRUD: LIST*/
export const list = async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    const docs = await Model.find(baseFilter(Model));
    res.json({ success: true, result: docs });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/*CRUD: GET BY ID*/
export const getById = async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    const doc = await Model.findOne({ _id: req.params.id, ...baseFilter(Model) });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, result: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* CRUD: CREATE */
export const create = async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    const doc = await Model.create(req.body);

    await writeAudit({
      model: Model.modelName,
      recordId: doc._id,
      action: "CREATE",
      req,
      before: null,
      after: doc.toObject(),
    });

    res.status(201).json({ success: true, result: doc });
  } catch (e) {
    // duplicate key errors
    if (e?.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate key error" });
    }
    res.status(400).json({ success: false, message: e.message });
  }
};

/* CRUD: UPDATE*/
export const update = async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    const before = await Model.findById(req.params.id);
    if (!before) return res.status(404).json({ success: false, message: "Not found" });

    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await writeAudit({
      model: Model.modelName,
      recordId: updated._id,
      action: "UPDATE",
      req,
      before: before.toObject(),
      after: updated.toObject(),
    });

    res.json({ success: true, result: updated });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate key error" });
    }
    res.status(400).json({ success: false, message: e.message });
  }
};

/* CRUD: DELETE */
export const remove = async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    const doc = await Model.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    const before = doc.toObject();

    if (hasPath(Model, "isDeleted")) {
      doc.isDeleted = true;
      if (hasPath(Model, "deletedAt")) doc.deletedAt = new Date();
      if (hasPath(Model, "deletedBy")) doc.deletedBy = req.user?.id || null;
      await doc.save();
    } else {
      await Model.deleteOne({ _id: doc._id });
    }

    await writeAudit({
      model: Model.modelName,
      recordId: doc._id,
      action: "DELETE",
      req,
      before,
      after: hasPath(Model, "isDeleted") ? doc.toObject() : null,
    });

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
