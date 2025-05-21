/*
  # Create fincas table

  1. New Tables
    - `fincas`
      - `id` (uuid, primary key)
      - `nombre` (text, not null)
      - `ubicacion` (text, not null)
      - `ph_suelo` (numeric, not null)
      - `tipo_suelo` (text, not null)
      - `textura_suelo` (text, not null)
      - `temperatura` (numeric, not null)
      - `precipitacion` (numeric, not null)
      - `humedad` (numeric, not null)
      - `practicas_agricolas` (text array)
      - `created_at` (timestamptz, default now())
      - `user_id` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `fincas` table
    - Add policies for authenticated users to perform CRUD operations on their own data
*/

CREATE TABLE IF NOT EXISTS fincas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  ubicacion text NOT NULL,
  ph_suelo numeric NOT NULL,
  tipo_suelo text NOT NULL,
  textura_suelo text NOT NULL,
  temperatura numeric NOT NULL,
  precipitacion numeric NOT NULL,
  humedad numeric NOT NULL,
  practicas_agricolas text[],
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE fincas ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own fincas
CREATE POLICY "Users can read their own fincas"
  ON fincas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own fincas
CREATE POLICY "Users can insert their own fincas"
  ON fincas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own fincas
CREATE POLICY "Users can update their own fincas"
  ON fincas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own fincas
CREATE POLICY "Users can delete their own fincas"
  ON fincas
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);