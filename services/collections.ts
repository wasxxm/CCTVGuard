import { db, createCollection } from '@/config/firebaseConfig';
import { Candidate } from '@/models';

// Create typed collection references
const candidatesCollection = createCollection<Candidate>(db, 'candidates');

// Export collections
export { candidatesCollection };
