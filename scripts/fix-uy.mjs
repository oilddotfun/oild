import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_zueVRL5Y0MrE@ep-quiet-shape-ah4g0f02-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

// Delete UY claim — it's using the OILD token, not a Uruguay-specific token
await sql`DELETE FROM claims WHERE code = 'UY'`;
console.log('Deleted UY claim');

const remaining = await sql`SELECT code, token_address FROM claims`;
console.log('Remaining claims:', remaining);
