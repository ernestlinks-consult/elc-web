
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"after": Json | null,"before": Json | null,"created_at": string,"id": number,"row_id": string,"table_name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"after"?: Json | null,"before"?: Json | null,"created_at"?: string,"id"?: number,"row_id": string,"table_name": string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"after"?: Json | null,"before"?: Json | null,"created_at"?: string,"id"?: number,"row_id"?: string,"table_name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"content_comments": {
                  Row: {
                    "author_id": string | null,"body": string,"content_id": string,"content_type": Database["public"]['Enums']["content_type"],"created_at": string,"id": string,"resolved": boolean,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"content_id": string,"content_type": Database["public"]['Enums']["content_type"],"created_at"?: string,"id"?: string,"resolved"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"content_id"?: string,"content_type"?: Database["public"]['Enums']["content_type"],"created_at"?: string,"id"?: string,"resolved"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "content_comments_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_comments_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"drives": {
                  Row: {
                    "applicants_count": number | null,"created_at": string,"drive_date": string | null,"host_name": string,"id": string,"owner_id": string | null,"photo_path": string | null,"publish_state": Database["public"]['Enums']["publish_state"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "applicants_count"?: number | null,"created_at"?: string,"drive_date"?: string | null,"host_name": string,"id"?: string,"owner_id"?: string | null,"photo_path"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"updated_at"?: string
                  }
                  Update: {
                    "applicants_count"?: number | null,"created_at"?: string,"drive_date"?: string | null,"host_name"?: string,"id"?: string,"owner_id"?: string | null,"photo_path"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "drives_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "drives_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "created_at": string,"id": number,"lead_id": string | null,"name": string,"page": string | null,"props": NonNullable<Json>,"session_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: number,"lead_id"?: string | null,"name": string,"page"?: string | null,"props"?: NonNullable<Json>,"session_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: number,"lead_id"?: string | null,"name"?: string,"page"?: string | null,"props"?: NonNullable<Json>,"session_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "events_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads_inbox"
      referencedColumns: ["id"]
    }
                  ]
                },"faqs": {
                  Row: {
                    "answer": string,"created_at": string,"id": string,"owner_id": string | null,"publish_state": Database["public"]['Enums']["publish_state"],"question": string,"service_key": string | null,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answer": string,"created_at"?: string,"id"?: string,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"question": string,"service_key"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "answer"?: string,"created_at"?: string,"id"?: string,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"question"?: string,"service_key"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "faqs_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "faqs_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "faqs_service_key_fkey"
      columns: ["service_key"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["key"]
    }
                  ]
                },"lead_events": {
                  Row: {
                    "actor_id": string | null,"created_at": string,"data": NonNullable<Json>,"id": string,"lead_id": string,"type": Database["public"]['Enums']["lead_event_type"]
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_id"?: string | null,"created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"lead_id": string,"type": Database["public"]['Enums']["lead_event_type"]
                  }
                  Update: {
                    "actor_id"?: string | null,"created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"lead_id"?: string,"type"?: Database["public"]['Enums']["lead_event_type"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "lead_events_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lead_events_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lead_events_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lead_events_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads_inbox"
      referencedColumns: ["id"]
    }
                  ]
                },"lead_steps": {
                  Row: {
                    "answers": NonNullable<Json>,"created_at": string,"id": string,"lead_id": string,"saved_at": string,"step_index": number,"step_key": string,"updated_at": string,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "answers"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"lead_id": string,"saved_at"?: string,"step_index": number,"step_key": string,"updated_at"?: string,"version"?: number
                  }
                  Update: {
                    "answers"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"lead_id"?: string,"saved_at"?: string,"step_index"?: number,"step_key"?: string,"updated_at"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "lead_steps_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lead_steps_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads_inbox"
      referencedColumns: ["id"]
    }
                  ]
                },"leads": {
                  Row: {
                    "best_time": string,"closed_reason": string | null,"consent_at": string,"created_at": string,"first_reply_at": string | null,"form_version": number,"full_name": string,"heard_from": string | null,"id": string,"is_partial": boolean,"owner_id": string | null,"ref": string,"referrer": string | null,"service_key": string,"source_page": string | null,"status": Database["public"]['Enums']["lead_status"],"steps_completed": number,"steps_total": number,"submission_count": number,"updated_at": string,"utm_campaign": string | null,"utm_medium": string | null,"utm_source": string | null,"whatsapp": string
                  }
                  ComputedFields: never
                  Insert: {
                    "best_time": string,"closed_reason"?: string | null,"consent_at": string,"created_at"?: string,"first_reply_at"?: string | null,"form_version": number,"full_name": string,"heard_from"?: string | null,"id"?: string,"is_partial"?: boolean,"owner_id"?: string | null,"ref": string,"referrer"?: string | null,"service_key": string,"source_page"?: string | null,"status"?: Database["public"]['Enums']["lead_status"],"steps_completed"?: number,"steps_total": number,"submission_count"?: number,"updated_at"?: string,"utm_campaign"?: string | null,"utm_medium"?: string | null,"utm_source"?: string | null,"whatsapp": string
                  }
                  Update: {
                    "best_time"?: string,"closed_reason"?: string | null,"consent_at"?: string,"created_at"?: string,"first_reply_at"?: string | null,"form_version"?: number,"full_name"?: string,"heard_from"?: string | null,"id"?: string,"is_partial"?: boolean,"owner_id"?: string | null,"ref"?: string,"referrer"?: string | null,"service_key"?: string,"source_page"?: string | null,"status"?: Database["public"]['Enums']["lead_status"],"steps_completed"?: number,"steps_total"?: number,"submission_count"?: number,"updated_at"?: string,"utm_campaign"?: string | null,"utm_medium"?: string | null,"utm_source"?: string | null,"whatsapp"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "leads_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "leads_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "leads_service_key_fkey"
      columns: ["service_key"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["key"]
    }
                  ]
                },"live_schedule": {
                  Row: {
                    "created_at": string,"ends_at_time": string,"host_id": string | null,"starts_at_time": string,"topic": string | null,"updated_at": string,"weekday": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"ends_at_time": string,"host_id"?: string | null,"starts_at_time": string,"topic"?: string | null,"updated_at"?: string,"weekday": number
                  }
                  Update: {
                    "created_at"?: string,"ends_at_time"?: string,"host_id"?: string | null,"starts_at_time"?: string,"topic"?: string | null,"updated_at"?: string,"weekday"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "live_schedule_host_id_fkey"
      columns: ["host_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "live_schedule_host_id_fkey"
      columns: ["host_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "assigned_to": string | null,"body": string,"consent_at": string,"created_at": string,"email": string | null,"full_name": string,"id": string,"status": string,"topic": string | null,"updated_at": string,"whatsapp": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_to"?: string | null,"body": string,"consent_at": string,"created_at"?: string,"email"?: string | null,"full_name": string,"id"?: string,"status"?: string,"topic"?: string | null,"updated_at"?: string,"whatsapp": string
                  }
                  Update: {
                    "assigned_to"?: string | null,"body"?: string,"consent_at"?: string,"created_at"?: string,"email"?: string | null,"full_name"?: string,"id"?: string,"status"?: string,"topic"?: string | null,"updated_at"?: string,"whatsapp"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_assigned_to_fkey"
      columns: ["assigned_to"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_assigned_to_fkey"
      columns: ["assigned_to"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "attempts": number,"channel": Database["public"]['Enums']["notify_channel"],"claimed_at": string | null,"created_at": string,"id": string,"idempotency_key": string,"last_error": string | null,"lead_id": string | null,"payload": NonNullable<Json>,"provider_id": string | null,"send_after": string,"sent_at": string | null,"status": Database["public"]['Enums']["notify_status"],"template": string,"to_address": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempts"?: number,"channel": Database["public"]['Enums']["notify_channel"],"claimed_at"?: string | null,"created_at"?: string,"id"?: string,"idempotency_key": string,"last_error"?: string | null,"lead_id"?: string | null,"payload"?: NonNullable<Json>,"provider_id"?: string | null,"send_after"?: string,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["notify_status"],"template": string,"to_address": string,"updated_at"?: string
                  }
                  Update: {
                    "attempts"?: number,"channel"?: Database["public"]['Enums']["notify_channel"],"claimed_at"?: string | null,"created_at"?: string,"id"?: string,"idempotency_key"?: string,"last_error"?: string | null,"lead_id"?: string | null,"payload"?: NonNullable<Json>,"provider_id"?: string | null,"send_after"?: string,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["notify_status"],"template"?: string,"to_address"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads_inbox"
      referencedColumns: ["id"]
    }
                  ]
                },"openings": {
                  Row: {
                    "candidate_costs": string | null,"correct_as_of": string | null,"country": string,"created_at": string,"id": string,"keyword": string | null,"owner_id": string | null,"publish_state": Database["public"]['Enums']["publish_state"],"requirements": string | null,"sector": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "candidate_costs"?: string | null,"correct_as_of"?: string | null,"country": string,"created_at"?: string,"id"?: string,"keyword"?: string | null,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"requirements"?: string | null,"sector"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "candidate_costs"?: string | null,"correct_as_of"?: string | null,"country"?: string,"created_at"?: string,"id"?: string,"keyword"?: string | null,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"requirements"?: string | null,"sector"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "openings_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "openings_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"posts": {
                  Row: {
                    "author_id": string | null,"body": NonNullable<Json>,"body_html": string | null,"category": Database["public"]['Enums']["post_category"],"cover_alt": string | null,"cover_path": string | null,"created_at": string,"id": string,"owner_id": string | null,"publish_state": Database["public"]['Enums']["publish_state"],"published_at": string | null,"reviewed_by": string | null,"seo_description": string | null,"seo_title": string | null,"slug": string,"summary": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body"?: NonNullable<Json>,"body_html"?: string | null,"category": Database["public"]['Enums']["post_category"],"cover_alt"?: string | null,"cover_path"?: string | null,"created_at"?: string,"id"?: string,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"published_at"?: string | null,"reviewed_by"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"summary"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: NonNullable<Json>,"body_html"?: string | null,"category"?: Database["public"]['Enums']["post_category"],"cover_alt"?: string | null,"cover_path"?: string | null,"created_at"?: string,"id"?: string,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"published_at"?: string | null,"reviewed_by"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"summary"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "posts_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "posts_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "posts_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "posts_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "posts_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "posts_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"prices": {
                  Row: {
                    "amount_ghs": number | null,"created_at": string,"is_public": boolean,"key": string,"label": string,"never_public": boolean,"shown_on": (string)[],"time_text": string | null,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_ghs"?: number | null,"created_at"?: string,"is_public"?: boolean,"key": string,"label": string,"never_public"?: boolean,"shown_on"?: (string)[],"time_text"?: string | null,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "amount_ghs"?: number | null,"created_at"?: string,"is_public"?: boolean,"key"?: string,"label"?: string,"never_public"?: boolean,"shown_on"?: (string)[],"time_text"?: string | null,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "prices_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "prices_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"programmes": {
                  Row: {
                    "city": string | null,"correct_as_of": string | null,"country": string,"created_at": string,"duration_text": string | null,"id": string,"internal_school_name": string | null,"keyword": string | null,"kind": Database["public"]['Enums']["programme_kind"],"level": string | null,"owner_id": string | null,"publish_state": Database["public"]['Enums']["publish_state"],"title": string,"tuition_text": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "city"?: string | null,"correct_as_of"?: string | null,"country": string,"created_at"?: string,"duration_text"?: string | null,"id"?: string,"internal_school_name"?: string | null,"keyword"?: string | null,"kind": Database["public"]['Enums']["programme_kind"],"level"?: string | null,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"title": string,"tuition_text"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "city"?: string | null,"correct_as_of"?: string | null,"country"?: string,"created_at"?: string,"duration_text"?: string | null,"id"?: string,"internal_school_name"?: string | null,"keyword"?: string | null,"kind"?: Database["public"]['Enums']["programme_kind"],"level"?: string | null,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"title"?: string,"tuition_text"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "programmes_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "programmes_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"rate_limits": {
                  Row: {
                    "created_at": string,"id": number,"key_hash": string,"scope": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: number,"key_hash": string,"scope": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: number,"key_hash"?: string,"scope"?: string
                  }
                  Relationships: [
                    
                  ]
                },"scholarships": {
                  Row: {
                    "covers": string | null,"created_at": string,"deadline_on": string | null,"deadline_text": string | null,"id": string,"levels": (string)[],"name": string,"not_pay_to_apply": boolean,"official_url": string | null,"opens_on": string | null,"owner_id": string | null,"publish_state": Database["public"]['Enums']["publish_state"],"slug": string,"updated_at": string,"verified_by": string | null,"verified_on": string | null,"where_text": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "covers"?: string | null,"created_at"?: string,"deadline_on"?: string | null,"deadline_text"?: string | null,"id"?: string,"levels"?: (string)[],"name": string,"not_pay_to_apply"?: boolean,"official_url"?: string | null,"opens_on"?: string | null,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"slug": string,"updated_at"?: string,"verified_by"?: string | null,"verified_on"?: string | null,"where_text"?: string | null
                  }
                  Update: {
                    "covers"?: string | null,"created_at"?: string,"deadline_on"?: string | null,"deadline_text"?: string | null,"id"?: string,"levels"?: (string)[],"name"?: string,"not_pay_to_apply"?: boolean,"official_url"?: string | null,"opens_on"?: string | null,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"slug"?: string,"updated_at"?: string,"verified_by"?: string | null,"verified_on"?: string | null,"where_text"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "scholarships_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "scholarships_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "scholarships_verified_by_fkey"
      columns: ["verified_by"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "scholarships_verified_by_fkey"
      columns: ["verified_by"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"services": {
                  Row: {
                    "created_at": string,"key": string,"name": string,"owner_id": string | null,"ref_prefix": string,"short_description": string,"slug": string,"sort_order": number,"updated_at": string,"whatsapp_keyword": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"key": string,"name": string,"owner_id"?: string | null,"ref_prefix": string,"short_description": string,"slug": string,"sort_order"?: number,"updated_at"?: string,"whatsapp_keyword": string
                  }
                  Update: {
                    "created_at"?: string,"key"?: string,"name"?: string,"owner_id"?: string | null,"ref_prefix"?: string,"short_description"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string,"whatsapp_keyword"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "services_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "services_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"settings": {
                  Row: {
                    "created_at": string,"key": string,"updated_at": string,"updated_by": string | null,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"key": string,"updated_at"?: string,"updated_by"?: string | null,"value": NonNullable<Json>
                  }
                  Update: {
                    "created_at"?: string,"key"?: string,"updated_at"?: string,"updated_by"?: string | null,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "settings_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "settings_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"staff": {
                  Row: {
                    "bio": string | null,"created_at": string,"email": string,"full_name": string,"id": string,"is_active": boolean,"phone": string | null,"photo_path": string | null,"role": Database["public"]['Enums']["staff_role"],"show_on_site": boolean,"sort_order": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bio"?: string | null,"created_at"?: string,"email": string,"full_name": string,"id": string,"is_active"?: boolean,"phone"?: string | null,"photo_path"?: string | null,"role": Database["public"]['Enums']["staff_role"],"show_on_site"?: boolean,"sort_order"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "bio"?: string | null,"created_at"?: string,"email"?: string,"full_name"?: string,"id"?: string,"is_active"?: boolean,"phone"?: string | null,"photo_path"?: string | null,"role"?: Database["public"]['Enums']["staff_role"],"show_on_site"?: boolean,"sort_order"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"staff_content_access": {
                  Row: {
                    "content_type": Database["public"]['Enums']["content_type"],"created_at": string,"staff_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content_type": Database["public"]['Enums']["content_type"],"created_at"?: string,"staff_id": string,"updated_at"?: string
                  }
                  Update: {
                    "content_type"?: Database["public"]['Enums']["content_type"],"created_at"?: string,"staff_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "staff_content_access_staff_id_fkey"
      columns: ["staff_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "staff_content_access_staff_id_fkey"
      columns: ["staff_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"subscribers": {
                  Row: {
                    "consent_at": string,"created_at": string,"id": string,"list": string,"unsubscribed_at": string | null,"updated_at": string,"whatsapp": string
                  }
                  ComputedFields: never
                  Insert: {
                    "consent_at": string,"created_at"?: string,"id"?: string,"list"?: string,"unsubscribed_at"?: string | null,"updated_at"?: string,"whatsapp": string
                  }
                  Update: {
                    "consent_at"?: string,"created_at"?: string,"id"?: string,"list"?: string,"unsubscribed_at"?: string | null,"updated_at"?: string,"whatsapp"?: string
                  }
                  Relationships: [
                    
                  ]
                },"testimonials": {
                  Row: {
                    "created_at": string,"display_name": string,"id": string,"owner_id": string | null,"permission_on_file": boolean,"photo_path": string | null,"publish_state": Database["public"]['Enums']["publish_state"],"quote": string,"service_key": string | null,"updated_at": string,"year": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name": string,"id"?: string,"owner_id"?: string | null,"permission_on_file"?: boolean,"photo_path"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"quote": string,"service_key"?: string | null,"updated_at"?: string,"year"?: number | null
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"id"?: string,"owner_id"?: string | null,"permission_on_file"?: boolean,"photo_path"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"quote"?: string,"service_key"?: string | null,"updated_at"?: string,"year"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "testimonials_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "testimonials_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "testimonials_service_key_fkey"
      columns: ["service_key"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["key"]
    }
                  ]
                },"trips": {
                  Row: {
                    "created_at": string,"destination": string,"ends_on": string | null,"id": string,"owner_id": string | null,"photo_path": string | null,"price_from_ghs": number | null,"publish_state": Database["public"]['Enums']["publish_state"],"seats_left": number | null,"starts_on": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"destination": string,"ends_on"?: string | null,"id"?: string,"owner_id"?: string | null,"photo_path"?: string | null,"price_from_ghs"?: number | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"seats_left"?: number | null,"starts_on"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"destination"?: string,"ends_on"?: string | null,"id"?: string,"owner_id"?: string | null,"photo_path"?: string | null,"price_from_ghs"?: number | null,"publish_state"?: Database["public"]['Enums']["publish_state"],"seats_left"?: number | null,"starts_on"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "trips_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "trips_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"video_placements": {
                  Row: {
                    "created_at": string,"page_key": string,"updated_at": string,"video_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"page_key": string,"updated_at"?: string,"video_id": string
                  }
                  Update: {
                    "created_at"?: string,"page_key"?: string,"updated_at"?: string,"video_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "video_placements_video_id_fkey"
      columns: ["video_id"]
isOneToOne: false
      referencedRelation: "videos"
      referencedColumns: ["id"]
    }
                  ]
                },"videos": {
                  Row: {
                    "added_by": string | null,"created_at": string,"embed_html": string | null,"id": string,"keyword": string | null,"owner_id": string | null,"pinned": boolean,"platform": Database["public"]['Enums']["video_platform"],"publish_state": Database["public"]['Enums']["publish_state"],"published_at": string | null,"thumbnail_url": string | null,"title": string,"updated_at": string,"url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "added_by"?: string | null,"created_at"?: string,"embed_html"?: string | null,"id"?: string,"keyword"?: string | null,"owner_id"?: string | null,"pinned"?: boolean,"platform": Database["public"]['Enums']["video_platform"],"publish_state"?: Database["public"]['Enums']["publish_state"],"published_at"?: string | null,"thumbnail_url"?: string | null,"title": string,"updated_at"?: string,"url": string
                  }
                  Update: {
                    "added_by"?: string | null,"created_at"?: string,"embed_html"?: string | null,"id"?: string,"keyword"?: string | null,"owner_id"?: string | null,"pinned"?: boolean,"platform"?: Database["public"]['Enums']["video_platform"],"publish_state"?: Database["public"]['Enums']["publish_state"],"published_at"?: string | null,"thumbnail_url"?: string | null,"title"?: string,"updated_at"?: string,"url"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "videos_added_by_fkey"
      columns: ["added_by"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "videos_added_by_fkey"
      columns: ["added_by"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "videos_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "videos_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "lead_steps_latest": {
                  Row: {
                    "answers": NonNullable<Json>,"created_at": string,"id": string,"lead_id": string,"saved_at": string,"step_index": number,"step_key": string,"updated_at": string,"version": number
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "lead_steps_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lead_steps_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads_inbox"
      referencedColumns: ["id"]
    }
                  ]
                },"leads_inbox": {
                  Row: {
                    "best_time": string,"closed_reason": string | null,"consent_at": string,"created_at": string,"first_reply_at": string | null,"form_version": number,"full_name": string,"heard_from": string | null,"id": string,"is_partial": boolean,"overdue": boolean | null,"owner_id": string | null,"owner_name": string | null,"ref": string,"referrer": string | null,"service_key": string,"service_name": string,"source_page": string | null,"status": Database["public"]['Enums']["lead_status"],"steps_completed": number,"steps_total": number,"submission_count": number,"updated_at": string,"utm_campaign": string | null,"utm_medium": string | null,"utm_source": string | null,"whatsapp": string
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "leads_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "leads_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "leads_service_key_fkey"
      columns: ["service_key"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["key"]
    }
                  ]
                },"live_schedule_public": {
                  Row: {
                    "ends_at_time": string,"host_name": string | null,"starts_at_time": string,"topic": string | null,"weekday": number
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"prices_public": {
                  Row: {
                    "amount_ghs": number | null,"key": string,"label": string,"shown_on": (string)[],"time_text": string | null
                  }
                  ComputedFields: never
                  Insert: {
                           "amount_ghs"?: number | null,"key"?: string | null,"label"?: string | null,"shown_on"?: (string)[] | null,"time_text"?: string | null
                         }
                        Update: {
                           "amount_ghs"?: number | null,"key"?: string | null,"label"?: string | null,"shown_on"?: (string)[] | null,"time_text"?: string | null
                         }
                        Relationships: [
                    
                  ]
                },"scholarships_public": {
                  Row: {
                    "covers": string | null,"created_at": string,"deadline_on": string | null,"deadline_text": string | null,"id": string,"levels": (string)[],"name": string,"not_pay_to_apply": boolean,"official_url": string | null,"opens_on": string | null,"owner_id": string | null,"publish_state": Database["public"]['Enums']["publish_state"],"slug": string,"status": string | null,"updated_at": string,"verified_by": string | null,"verified_on": string | null,"where_text": string | null
                  }
                  ComputedFields: never
                  Insert: {
                           "covers"?: string | null,"created_at"?: string | null,"deadline_on"?: string | null,"deadline_text"?: string | null,"id"?: string | null,"levels"?: (string)[] | null,"name"?: string | null,"not_pay_to_apply"?: boolean | null,"official_url"?: string | null,"opens_on"?: string | null,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"] | null,"slug"?: string | null,"status"?: never,"updated_at"?: string | null,"verified_by"?: string | null,"verified_on"?: string | null,"where_text"?: string | null
                         }
                        Update: {
                           "covers"?: string | null,"created_at"?: string | null,"deadline_on"?: string | null,"deadline_text"?: string | null,"id"?: string | null,"levels"?: (string)[] | null,"name"?: string | null,"not_pay_to_apply"?: boolean | null,"official_url"?: string | null,"opens_on"?: string | null,"owner_id"?: string | null,"publish_state"?: Database["public"]['Enums']["publish_state"] | null,"slug"?: string | null,"status"?: never,"updated_at"?: string | null,"verified_by"?: string | null,"verified_on"?: string | null,"where_text"?: string | null
                         }
                        Relationships: [
                    {
      foreignKeyName: "scholarships_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "scholarships_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "scholarships_verified_by_fkey"
      columns: ["verified_by"]
isOneToOne: false
      referencedRelation: "staff"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "scholarships_verified_by_fkey"
      columns: ["verified_by"]
isOneToOne: false
      referencedRelation: "staff_public"
      referencedColumns: ["id"]
    }
                  ]
                },"settings_public": {
                  Row: {
                    "key": string,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                           "key"?: string | null,"value"?: Json | null
                         }
                        Update: {
                           "key"?: string | null,"value"?: Json | null
                         }
                        Relationships: [
                    
                  ]
                },"staff_public": {
                  Row: {
                    "bio": string | null,"full_name": string,"id": string,"photo_path": string | null,"sort_order": number,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                           "bio"?: string | null,"full_name"?: string | null,"id"?: string | null,"photo_path"?: string | null,"sort_order"?: number | null,"title"?: string | null
                         }
                        Update: {
                           "bio"?: string | null,"full_name"?: string | null,"id"?: string | null,"photo_path"?: string | null,"sort_order"?: number | null,"title"?: string | null
                         }
                        Relationships: [
                    
                  ]
                },"subscribers_active": {
                  Row: {
                    "consent_at": string,"id": string,"list": string,"whatsapp": string
                  }
                  ComputedFields: never
                  Insert: {
                           "consent_at"?: string | null,"id"?: string | null,"list"?: string | null,"whatsapp"?: string | null
                         }
                        Update: {
                           "consent_at"?: string | null,"id"?: string | null,"list"?: string | null,"whatsapp"?: string | null
                         }
                        Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "check_rate_limit":
{ Args: { "p_key": string,"p_limit": number,"p_scope": string,"p_window": string }; Returns: boolean
                           },
"claim_notifications":
{ Args: { "p_limit"?: number }; Returns: {
              "attempts": number,
"channel": Database["public"]['Enums']["notify_channel"],
"claimed_at": string | null,
"created_at": string,
"id": string,
"idempotency_key": string,
"last_error": string | null,
"lead_id": string | null,
"payload": NonNullable<Json>,
"provider_id": string | null,
"send_after": string,
"sent_at": string | null,
"status": Database["public"]['Enums']["notify_status"],
"template": string,
"to_address": string,
"updated_at": string
            }[]
                          SetofOptions: {
        from: "*"
        to: "notifications"
        isOneToOne: false
        isSetofReturn: true
      } },
"create_or_attach_lead":
{ Args: { "p_best_time": string,"p_form_version": number,"p_full_name": string,"p_referrer"?: string,"p_service": string,"p_session_lead"?: string,"p_session_submission"?: number,"p_source_page"?: string,"p_steps_total": number,"p_utm_campaign"?: string,"p_utm_medium"?: string,"p_utm_source"?: string,"p_whatsapp": string }; Returns: {
              "is_new": boolean,"lead_id": string,"ref": string,"submission": number
            }[]
                           },
"find_duplicate_lead":
{ Args: { "p_service": string,"p_whatsapp": string }; Returns: string
                           },
"has_content_access":
{ Args: { "p_type": Database["public"]['Enums']["content_type"] }; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"lead_is_overdue":
{ Args: { "p_created_at": string,"p_now"?: string,"p_status": Database["public"]['Enums']["lead_status"] }; Returns: boolean
                           },
"log_export":
{ Args: { "p_filters": Json,"p_table": string }; Returns: undefined
                           },
"my_staff_access":
{ Args: Record<PropertyKey, never>; Returns: {
              "aal": string,"full_name": string,"is_active": boolean,"role": Database["public"]['Enums']["staff_role"]
            }[]
                           },
"next_lead_ref":
{ Args: { "p_service": string }; Returns: string
                           },
"record_notification_failure":
{ Args: { "p_error": string,"p_id": string,"p_retry_minutes"?: number }; Returns: Database["public"]['Enums']["notify_status"]
                           },
"record_notification_sent":
{ Args: { "p_id": string,"p_provider_id": string }; Returns: boolean
                           },
"resend_lead_ack":
{ Args: { "p_lead_id": string }; Returns: string
                           },
"save_lead_step":
{ Args: { "p_answers": Json,"p_heard_from"?: string,"p_lead_id": string,"p_referrer"?: string,"p_source_page"?: string,"p_step_index": number,"p_step_key": string,"p_submission"?: number,"p_utm_campaign"?: string,"p_utm_medium"?: string,"p_utm_source"?: string }; Returns: {
              "is_partial": boolean,"steps_completed": number,"steps_total": number
            }[]
                           },
"staff_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["staff_role"]
                           },
"trigger_send_notifications":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"unsubscribe":
{ Args: { "p_whatsapp": string }; Returns: boolean
                           },
"working_minutes_between":
{ Args: { "p_cap"?: number,"p_from": string,"p_to": string }; Returns: number
                           }
          }
          Enums: {
            "content_type": "scholarship"|"post"|"video"|"programme"|"opening"|"drive"|"trip"|"faq"|"testimonial"|"team","lead_event_type": "created"|"step_saved"|"completed"|"status_changed"|"assigned"|"note"|"sms_sent"|"email_sent"|"merged"|"resubmitted","lead_status": "new"|"contacted"|"started"|"paid"|"closed","notify_channel": "sms"|"email","notify_status": "pending"|"sending"|"sent"|"failed","post_category": "passports"|"school_applications"|"visas"|"exams"|"scholarships"|"student_stories"|"work_abroad"|"travel","programme_kind": "study"|"bridging","publish_state": "draft"|"in_review"|"published"|"archived","staff_role": "admin"|"editor"|"front_desk","video_platform": "tiktok"|"instagram"|"facebook"|"youtube"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "content_type": ["scholarship", "post", "video", "programme", "opening", "drive", "trip", "faq", "testimonial", "team"],"lead_event_type": ["created", "step_saved", "completed", "status_changed", "assigned", "note", "sms_sent", "email_sent", "merged", "resubmitted"],"lead_status": ["new", "contacted", "started", "paid", "closed"],"notify_channel": ["sms", "email"],"notify_status": ["pending", "sending", "sent", "failed"],"post_category": ["passports", "school_applications", "visas", "exams", "scholarships", "student_stories", "work_abroad", "travel"],"programme_kind": ["study", "bridging"],"publish_state": ["draft", "in_review", "published", "archived"],"staff_role": ["admin", "editor", "front_desk"],"video_platform": ["tiktok", "instagram", "facebook", "youtube"]
          }
        }
} as const
