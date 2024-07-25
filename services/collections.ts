import { createCollection } from '@/config/firebaseConfig';
import { Candidate } from '@/models';

// Create typed collection references
const candidatesCollection = createCollection<Candidate>('candidates');

// Export collections
export { candidatesCollection };
