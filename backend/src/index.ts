import { app } from './app';
import { getMockDatabase } from './utils/database';

const PORT = process.env.PORT || 3001;

// Initialize mock database with sample data
const mockDb = getMockDatabase();
if (!mockDb.isSampleDataInitialized()) {
  mockDb.initializeSampleData();
  console.log('Mock database initialized with sample data');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
