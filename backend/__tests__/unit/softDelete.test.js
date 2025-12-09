import { describe, test, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import softDeletePlugin from '../../models/plugins/softDelete.js';

// Create a test schema to apply the plugin
const createTestSchema = () => {
  const testSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: Number,
  });

  testSchema.plugin(softDeletePlugin);

  // Clear existing model if it exists
  if (mongoose.models['SoftDeleteTest']) {
    delete mongoose.models['SoftDeleteTest'];
  }

  return mongoose.model('SoftDeleteTest', testSchema);
};

describe('SoftDelete Plugin', () => {
  let TestModel;
  let testDoc;

  beforeEach(async () => {
    TestModel = createTestSchema();
    testDoc = await TestModel.create({ name: 'Test Doc', value: 42 });
  });

  describe('Fields and Schema', () => {
    test('should add soft delete fields to schema', () => {
      const fields = TestModel.schema.paths;

      expect(fields.isDeleted).toBeDefined();
      expect(fields.deletedAt).toBeDefined();
      expect(fields.deletedBy).toBeDefined();
      expect(fields.restoredAt).toBeDefined();
      expect(fields.restoredBy).toBeDefined();
      expect(fields.restoreCount).toBeDefined();
    });

    test('should have isDeleted default to false', async () => {
      expect(testDoc.isDeleted).toBe(false);
      expect(testDoc.deletedAt).toBeNull();
      expect(testDoc.deletedBy).toBeNull();
    });
  });

  describe('Query Helpers', () => {
    test('withDeleted() should include soft-deleted documents', async () => {
      // Soft delete the document
      await testDoc.softDelete();

      // Normal query should not find it
      const normalCount = await TestModel.countDocuments();
      expect(normalCount).toBe(0);

      // withDeleted query should find it
      const withDeletedCount = await TestModel.countDocuments().withDeleted();
      expect(withDeletedCount).toBe(1);
    });

    test('onlyDeleted() should only return soft-deleted documents', async () => {
      // Create another document
      await TestModel.create({ name: 'Active Doc', value: 100 });

      // Soft delete first document
      await testDoc.softDelete();

      // onlyDeleted should return only the deleted one
      const deletedDocs = await TestModel.find().onlyDeleted();
      expect(deletedDocs).toHaveLength(1);
      expect(deletedDocs[0]._id.toString()).toBe(testDoc._id.toString());
      expect(deletedDocs[0].isDeleted).toBe(true);
    });

    test('default queries should automatically filter soft-deleted documents', async () => {
      // Create multiple documents
      const doc2 = await TestModel.create({ name: 'Doc 2', value: 200 });
      const doc3 = await TestModel.create({ name: 'Doc 3', value: 300 });

      // Soft delete one
      await doc2.softDelete();

      // Default queries should only find non-deleted
      const activeDocs = await TestModel.find();
      expect(activeDocs).toHaveLength(2);
      expect(activeDocs.map(d => d._id.toString())).toContain(testDoc._id.toString());
      expect(activeDocs.map(d => d._id.toString())).toContain(doc3._id.toString());
      expect(activeDocs.map(d => d._id.toString())).not.toContain(doc2._id.toString());
    });
  });

  describe('Instance Methods', () => {
    test('softDelete() should soft delete document', async () => {
      const userId = new mongoose.Types.ObjectId();

      await testDoc.softDelete({ deletedBy: userId });

      expect(testDoc.isDeleted).toBe(true);
      expect(testDoc.deletedAt).toBeInstanceOf(Date);
      expect(testDoc.deletedBy.toString()).toBe(userId.toString());

      // Verify it's persisted
      const found = await TestModel.findById(testDoc._id).withDeleted();
      expect(found.isDeleted).toBe(true);
    });

    test('restore() should restore soft-deleted document', async () => {
      const userId = new mongoose.Types.ObjectId();
      const restorerId = new mongoose.Types.ObjectId();

      // Soft delete first
      await testDoc.softDelete({ deletedBy: userId });
      expect(testDoc.isDeleted).toBe(true);

      // Restore
      await testDoc.restore({ restoredBy: restorerId });

      expect(testDoc.isDeleted).toBe(false);
      expect(testDoc.deletedAt).toBeNull();
      expect(testDoc.deletedBy).toBeNull();
      expect(testDoc.restoredAt).toBeInstanceOf(Date);
      expect(testDoc.restoredBy.toString()).toBe(restorerId.toString());
      expect(testDoc.restoreCount).toBe(1);

      // Verify it's now queryable
      const found = await TestModel.findById(testDoc._id);
      expect(found).toBeTruthy();
      expect(found.isDeleted).toBe(false);
    });

    test('restore() should increment restoreCount on multiple restores', async () => {
      // Delete and restore multiple times
      await testDoc.softDelete();
      await testDoc.restore();
      expect(testDoc.restoreCount).toBe(1);

      await testDoc.softDelete();
      await testDoc.restore();
      expect(testDoc.restoreCount).toBe(2);
    });
  });

  describe('Static Methods', () => {
    test('softDeleteById() should soft delete by ID', async () => {
      const userId = new mongoose.Types.ObjectId();

      await TestModel.softDeleteById(testDoc._id, { deletedBy: userId });

      const found = await TestModel.findById(testDoc._id).withDeleted();
      expect(found.isDeleted).toBe(true);
      expect(found.deletedBy.toString()).toBe(userId.toString());
    });

    test('softDeleteMany() should soft delete multiple documents', async () => {
      const doc2 = await TestModel.create({ name: 'Doc 2', value: 200 });
      const doc3 = await TestModel.create({ name: 'Doc 3', value: 300 });

      await TestModel.softDeleteMany({ value: { $gte: 200 } });

      const allDocs = await TestModel.find().withDeleted();
      const deletedDocs = allDocs.filter(d => d.isDeleted);

      expect(deletedDocs).toHaveLength(2);
      expect(deletedDocs.map(d => d._id.toString())).toContain(doc2._id.toString());
      expect(deletedDocs.map(d => d._id.toString())).toContain(doc3._id.toString());
    });

    test('restoreById() should restore by ID', async () => {
      const userId = new mongoose.Types.ObjectId();

      // Delete first
      await testDoc.softDelete();
      expect(testDoc.isDeleted).toBe(true);

      // Restore
      await TestModel.restoreById(testDoc._id, { restoredBy: userId });

      const found = await TestModel.findById(testDoc._id);
      expect(found).toBeTruthy();
      expect(found.isDeleted).toBe(false);
      expect(found.restoredBy.toString()).toBe(userId.toString());
    });

    test('restoreMany() should restore multiple documents', async () => {
      const doc2 = await TestModel.create({ name: 'Doc 2', value: 200 });

      // Delete both
      await testDoc.softDelete();
      await doc2.softDelete();

      // Restore all with value < 250
      await TestModel.restoreMany({ value: { $lt: 250 } });

      const activeDocs = await TestModel.find();
      expect(activeDocs).toHaveLength(2);
    });
  });

  describe('Hard Delete Protection', () => {
    test('should prevent Model.deleteOne()', async () => {
      await expect(TestModel.deleteOne({ _id: testDoc._id })).rejects.toThrow('Hard deletes are not allowed');
    });

    test('should prevent Model.deleteMany()', async () => {
      await expect(TestModel.deleteMany({})).rejects.toThrow('Hard deletes are not allowed');
    });

    test('should prevent Model.findByIdAndDelete()', async () => {
      await expect(TestModel.findByIdAndDelete(testDoc._id)).rejects.toThrow('Hard deletes are not allowed');
    });

    test('should prevent Model.findOneAndDelete()', async () => {
      await expect(TestModel.findOneAndDelete({ _id: testDoc._id })).rejects.toThrow('Hard deletes are not allowed');
    });
  });

  describe('Aggregate Pipeline Filtering', () => {
    test('aggregate should automatically filter soft-deleted documents', async () => {
      const doc2 = await TestModel.create({ name: 'Doc 2', value: 200 });
      await doc2.softDelete();

      const results = await TestModel.aggregate([
        { $match: {} },
        { $count: 'total' }
      ]);

      expect(results[0].total).toBe(1);
    });
  });
});
