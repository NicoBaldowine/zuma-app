export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          avatar_url: string | null;
          auth_provider: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          avatar_url?: string | null;
          auth_provider?: string | null;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          avatar_url?: string | null;
          auth_provider?: string | null;
        };
        Relationships: [];
      };
      buckets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          icon_type: string;
          color_key: string;
          custom_color: string | null;
          current_amount: number;
          target_amount: number;
          is_main: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          icon_type?: string;
          color_key?: string;
          custom_color?: string | null;
          current_amount?: number;
          target_amount?: number;
          is_main?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          icon?: string;
          icon_type?: string;
          color_key?: string;
          custom_color?: string | null;
          current_amount?: number;
          target_amount?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          bucket_id: string | null;
          type: string;
          amount: number;
          description: string;
          related_bucket_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bucket_id?: string | null;
          type: string;
          amount?: number;
          description?: string;
          related_bucket_id?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          type?: string;
          amount?: number;
          description?: string;
          related_bucket_id?: string | null;
        };
        Relationships: [];
      };
      auto_deposit_rules: {
        Row: {
          id: string;
          user_id: string;
          source_bucket_id: string;
          target_bucket_id: string;
          amount: number;
          frequency: string;
          end_condition: string;
          is_paused: boolean;
          next_execution_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_bucket_id: string;
          target_bucket_id: string;
          amount: number;
          frequency: string;
          end_condition: string;
          is_paused?: boolean;
          next_execution_at?: string | null;
        };
        Update: {
          source_bucket_id?: string;
          target_bucket_id?: string;
          amount?: number;
          frequency?: string;
          end_condition?: string;
          is_paused?: boolean;
          next_execution_at?: string | null;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          goal_reached: boolean;
          deposits: boolean;
          weekly_summary: boolean;
          low_balance: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_reached?: boolean;
          deposits?: boolean;
          weekly_summary?: boolean;
          low_balance?: boolean;
        };
        Update: {
          goal_reached?: boolean;
          deposits?: boolean;
          weekly_summary?: boolean;
          low_balance?: boolean;
        };
        Relationships: [];
      };
      card_waitlist: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email?: string | null;
        };
        Update: {
          email?: string | null;
        };
        Relationships: [];
      };
      linked_accounts: {
        Row: {
          id: string;
          user_id: string;
          plaid_item_id: string;
          plaid_access_token: string;
          account_id: string;
          institution_name: string | null;
          institution_id: string | null;
          account_name: string | null;
          account_mask: string | null;
          account_subtype: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plaid_item_id: string;
          plaid_access_token: string;
          account_id: string;
          institution_name?: string | null;
          institution_id?: string | null;
          account_name?: string | null;
          account_mask?: string | null;
          account_subtype?: string | null;
        };
        Update: {
          plaid_access_token?: string;
          account_name?: string | null;
        };
        Relationships: [];
      };
      virtual_cards: {
        Row: {
          id: string;
          user_id: string;
          bucket_id: string;
          card_number: string;
          expiry_month: number;
          expiry_year: number;
          cvv: string;
          spending_limit: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bucket_id: string;
          card_number: string;
          expiry_month: number;
          expiry_year: number;
          cvv: string;
          spending_limit: number;
          status?: string;
        };
        Update: {
          status?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_main_bucket: {
        Args: { p_user_id: string };
        Returns: string;
      };
      transfer_funds: {
        Args: {
          p_user_id: string;
          p_from_id: string;
          p_to_id: string;
          p_amount: number;
          p_description: string;
        };
        Returns: undefined;
      };
      add_funds: {
        Args: {
          p_user_id: string;
          p_bucket_id: string;
          p_amount: number;
          p_description: string;
        };
        Returns: undefined;
      };
      reconcile_bucket: {
        Args: {
          p_user_id: string;
          p_bucket_id: string;
          p_amount: number;
          p_description: string;
        };
        Returns: undefined;
      };
      shift_bucket_orders: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      delete_bucket_with_refund: {
        Args: { p_user_id: string; p_bucket_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
