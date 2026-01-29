export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          role: 'GUEST' | 'MANAGER' | 'ADMIN' | 'FOUNDER'
          last_case_open: string | null
          vip_until: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          role?: 'GUEST' | 'MANAGER' | 'ADMIN' | 'FOUNDER'
          last_case_open?: string | null
          vip_until?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: 'GUEST' | 'MANAGER' | 'ADMIN' | 'FOUNDER'
          last_case_open?: string | null
          vip_until?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          tag: string
          leader_id: string
          status: 'PENDING' | 'APPROVED' | 'BLOCKED' | 'REJECTED'
          is_vip: boolean
          player_count: number
          maps_count: number
          block_reason: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          tag: string
          leader_id: string
          status?: 'PENDING' | 'APPROVED' | 'BLOCKED' | 'REJECTED'
          is_vip?: boolean
          player_count?: number
          maps_count?: number
          block_reason?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          tag?: string
          leader_id?: string
          status?: 'PENDING' | 'APPROVED' | 'BLOCKED' | 'REJECTED'
          is_vip?: boolean
          player_count?: number
          maps_count?: number
          block_reason?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      scrims: {
        Row: {
          id: string
          start_time: string
          map: string
          max_teams: number
          status: 'OPEN' | 'CLOSED' | 'FINISHED'
          room_id: string | null
          room_pass: string | null
          created_at: string
        }
        Insert: {
          id?: string
          start_time: string
          map: string
          max_teams: number
          status?: 'OPEN' | 'CLOSED' | 'FINISHED'
          room_id?: string | null
          room_pass?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          start_time?: string
          map?: string
          max_teams?: number
          status?: 'OPEN' | 'CLOSED' | 'FINISHED'
          room_id?: string | null
          room_pass?: string | null
          created_at?: string
        }
      }
      slots: {
        Row: {
          id: string
          slot_number: number
          team_id: string
          scrim_id: string
          created_at: string
        }
        Insert: {
          id?: string
          slot_number: number
          team_id: string
          scrim_id: string
          created_at?: string
        }
        Update: {
          id?: string
          slot_number?: number
          team_id?: string
          scrim_id?: string
          created_at?: string
        }
      }
      results: {
        Row: {
          id: string
          image: string
          description: string | null
          scrim_id: string
          created_at: string
        }
        Insert: {
          id?: string
          image: string
          description?: string | null
          scrim_id: string
          created_at?: string
        }
        Update: {
          id?: string
          image?: string
          description?: string | null
          scrim_id?: string
          created_at?: string
        }
      }
      system_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          action: string
          user_id: string
          username: string
          details: string | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          user_id: string
          username: string
          details?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          user_id?: string
          username?: string
          details?: string | null
          created_at?: string
        }
      }
      case_rewards: {
        Row: {
          id: string
          user_id: string
          username: string
          type: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          type: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          type?: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at?: string
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
