import { Property, PROPERTY_TEXT_INDEX } from '../models/Property';

export async function createTextIndex() {
  await Property.collection.createIndex(PROPERTY_TEXT_INDEX.spec, PROPERTY_TEXT_INDEX.options);
  console.log('📇 Text index ensured for properties collection');
}
