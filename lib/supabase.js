import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://zurdafralemappcpsyzl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cmRhZnJhbGVtYXBwY3BzeXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODI2OTcsImV4cCI6MjA5MTY1ODY5N30.ivWcV2qBy2cLKL4e2I2rK-5gIH5fMHo8EsbkZl9LSpI"
);