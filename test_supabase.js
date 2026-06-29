const { createClient } = require('@supabase/supabase-js');
// Need to load env vars manually for test script
require('dotenv').config({ path: '.env.local' });
// Or we can just read from .env if it exists
