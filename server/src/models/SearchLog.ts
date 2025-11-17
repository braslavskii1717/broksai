import { Schema, model, type Document } from 'mongoose';

export interface SearchLogDocument extends Document {
  query: string;
  timestamp: Date;
  userId?: string;
  resultsCount: number;
  responseTime: number;
  fuzzyUsed: boolean;
  correctedQuery?: string;
  ip?: string;
  userAgent?: string;
}

const SearchLogSchema = new Schema<SearchLogDocument>(
  {
    query: { type: String, required: true, trim: true },
    timestamp: { type: Date, required: true, default: Date.now },
    userId: { type: String },
    resultsCount: { type: Number, required: true },
    responseTime: { type: Number, required: true },
    fuzzyUsed: { type: Boolean, default: false },
    correctedQuery: { type: String },
    ip: { type: String },
    userAgent: { type: String },
  },
  { versionKey: false },
);

SearchLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
SearchLogSchema.index({ query: 1 });
SearchLogSchema.index({ timestamp: -1, query: 1 });

export const SearchLog = model<SearchLogDocument>('SearchLog', SearchLogSchema);
