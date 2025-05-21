export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      fincas: {
        Row: {
          id: string
          nombre: string
          ubicacion: string
          ph_suelo: number
          tipo_suelo: string
          textura_suelo: string
          temperatura: number
          precipitacion: number
          humedad: number
          practicas_agricolas: string[]
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          nombre: string
          ubicacion: string
          ph_suelo: number
          tipo_suelo: string
          textura_suelo: string
          temperatura: number
          precipitacion: number
          humedad: number
          practicas_agricolas: string[]
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          nombre?: string
          ubicacion?: string
          ph_suelo?: number
          tipo_suelo?: string
          textura_suelo?: string
          temperatura?: number
          precipitacion?: number
          humedad?: number
          practicas_agricolas?: string[]
          created_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}