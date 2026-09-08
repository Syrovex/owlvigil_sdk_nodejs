/** Generated from the OwlVigil OpenAPI Management contract. */

export interface Envelope {
  "code": string;
  "data": unknown;
  "message": string;
  "request_id": string;
}

export interface Deleted {
  "deleted": boolean;
}

export interface ListAccessInvitation {
  "items": Array<AccessInvitation>;
  "page_info": PageInfo;
}

export interface ListAccessMember {
  "items": Array<AccessMember>;
  "page_info": PageInfo;
}

export interface ListAccessRole {
  "items": Array<AccessRole>;
  "page_info": PageInfo;
}

export interface ListAccessTeam {
  "items": Array<AccessTeam>;
  "page_info": PageInfo;
}

export interface ListBillingInvoice {
  "items": Array<BillingInvoice>;
  "page_info": PageInfo;
}

export interface ListBillingOrder {
  "items": Array<BillingOrder>;
  "page_info": PageInfo;
}

export interface ListBillingPaymentMethod {
  "items": Array<BillingPaymentMethod>;
  "page_info": PageInfo;
}

export interface ListBillingPlan {
  "items": Array<BillingPlan>;
  "page_info": PageInfo;
}

export interface ListBillingTopupPlan {
  "items": Array<BillingTopupPlan>;
  "page_info": PageInfo;
}

export interface ListCatalogModel {
  "items": Array<CatalogModel>;
  "page_info": PageInfo;
}

export interface ListCatalogRouteCandidate {
  "items": Array<CatalogRouteCandidate>;
  "page_info": PageInfo;
}

export interface ListFinancialMemberSpendingLimit {
  "items": Array<FinancialMemberSpendingLimit>;
  "page_info": PageInfo;
}

export interface ListGatewaykeyDTO {
  "items": Array<GatewaykeyDTO>;
  "page_info": PageInfo;
}

export interface ListLogsAuditLog {
  "items": Array<LogsAuditLog>;
  "page_info": PageInfo;
}

export interface ListLogsPayloadSummary {
  "items": Array<LogsPayloadSummary>;
  "page_info": PageInfo;
}

export interface ListObservabilityRequestLog {
  "items": Array<ObservabilityRequestLog>;
  "page_info": PageInfo;
}

export interface ListObservabilityTrace {
  "items": Array<ObservabilityTrace>;
  "page_info": PageInfo;
}

export interface ListProviderDTO {
  "items": Array<ProviderDTO>;
  "page_info": PageInfo;
}

export interface ListUsageRecord {
  "items": Array<UsageRecord>;
  "page_info": PageInfo;
}

export interface ListWebhookEndpoint {
  "items": Array<WebhookEndpoint>;
  "page_info": PageInfo;
}

export interface ListWebhookEventType {
  "items": Array<WebhookEventType>;
  "page_info": PageInfo;
}

export interface ListWebhookEvent {
  "items": Array<WebhookEvent>;
  "page_info": PageInfo;
}

export interface ListWorkspaceDTO {
  "items": Array<WorkspaceDTO>;
  "page_info": PageInfo;
}

export interface PageInfo {
  "has_more": boolean;
  "next_cursor"?: string;
}

export interface AccessCreateInvitationRequest {
  "email": string;
  "expires_in_hours"?: number;
  "role": string;
  "team_id"?: number;
}

export interface AccessCreateRoleRequest {
  "description"?: string;
  "key"?: string;
  "name": string;
  "permissions": Array<string>;
}

export interface AccessCreateTeamRequest {
  "description"?: string;
  "monthly_budget_limit"?: number;
  "name": string;
}

export interface AccessInvitation {
  "created_at": string;
  "email": string;
  "expires_at": string;
  "id": number;
  "invited_by"?: AccessUserBrief;
  "invited_by_user_id": number;
  "project_id": number;
  "role": string;
  "status": string;
  "team_id"?: number;
  "token"?: string;
  "updated_at": string;
  "workspace_id": number;
}

export interface AccessInviteMemberRequest {
  "email": string;
  "role": string;
  "team_id"?: number;
}

export interface AccessMember {
  "email": string;
  "id": number;
  "invitation_expires_at"?: string;
  "invitation_id"?: number;
  "invitation_token"?: string;
  "invited_by"?: string;
  "joined_at": string;
  "member_type"?: string;
  "name": string;
  "role": string;
  "status": string;
  "team"?: string;
  "team_id"?: number;
  "user"?: AccessUserBrief;
  "user_id": number;
  "workspace_id": number;
}

export interface AccessMemberPermissions {
  "effective": Array<string>;
  "groups": Array<AccessPermissionGroup>;
  "role": string;
  "user_id": number;
  "workspace_id": number;
}

export interface AccessPermission {
  "default": boolean;
  "effective": boolean;
  "id": string;
  "label": string;
  "override"?: string;
}

export interface AccessPermissionGroup {
  "id": string;
  "label": string;
  "permissions": Array<AccessPermission>;
}

export interface AccessPermissionGroups {
  "groups": Array<AccessPermissionGroup>;
}

export interface AccessRole {
  "built_in": boolean;
  "created_at": string;
  "description"?: string;
  "id": number;
  "key"?: string;
  "name": string;
  "permissions": Array<string>;
  "scope_id": number;
  "scope_type": string;
  "updated_at": string;
}

export interface AccessRoleOption {
  "enabled": boolean;
  "label": string;
  "value": string;
}

export interface AccessRoleOptions {
  "edit_roles": Array<AccessRoleOption>;
  "invite_roles": Array<AccessRoleOption>;
}

export interface AccessTeam {
  "created_at": string;
  "deleted_at"?: string;
  "description"?: string;
  "id": number;
  "is_default": boolean;
  "member_count": number;
  "monthly_budget_limit"?: number;
  "name": string;
  "project_id": number;
  "status": string;
  "updated_at": string;
  "workspace_id": number;
}

export interface AccessUpdateMemberRequest {
  "role"?: string;
  "status"?: "active" | "pending" | "suspended";
  "team_id"?: number;
}

export interface AccessUpdatePermissionsRequest {
  "permissions": { [key: string]: boolean; };
}

export interface AccessUpdateRoleRequest {
  "description"?: string;
  "name"?: string;
  "permissions"?: Array<string>;
}

export interface AccessUpdateTeamRequest {
  "description"?: string;
  "monthly_budget_limit"?: number;
  "name"?: string;
}

export interface AccessUserBrief {
  "email": string;
  "id": number;
  "name": string;
}

export interface AccountChangePasswordRequest {
  "new_password": string;
  "old_password": string;
}

export interface AccountInvitation {
  "converted_at": string;
  "created_at": string;
  "id": number;
  "invite_code": string;
  "invited_email": string;
  "invited_user_id": number;
  "inviter_user_id": number;
  "status": string;
}

export interface AccountInvitationSent {
  "emails_sent": number;
  "message": string;
}

export interface AccountInvitationStats {
  "conversion_rate": number;
  "converted_invitations": number;
  "invite_code": string;
  "invite_link": string;
  "pending_invitations": number;
  "total_invitations": number;
}

export interface AccountMessage {
  "message": string;
}

export interface AccountNotificationPreferences {
  "billing": boolean;
  "budget": boolean;
  "marketing": boolean;
  "reports": boolean;
}

export interface AccountNotifyEmailEntry {
  "disabled": boolean;
  "email": string;
  "verified": boolean;
}

export interface AccountProfile {
  "avatar_url"?: string;
  "balance_notify_enabled": boolean;
  "balance_notify_extra_emails"?: Array<AccountNotifyEmailEntry>;
  "balance_notify_threshold"?: number;
  "created_at": string;
  "default_workspace_id"?: number;
  "display_name"?: string;
  "email": string;
  "id": number;
  "name"?: string;
  "status": string;
  "updated_at": string;
  "user_id": number;
  "username": string;
}

export interface AccountSendInvitationRequest {
  "emails": Array<string>;
  "message"?: string;
}

export interface AccountSupportRequest {
  "description": string;
  "issue_type": "Technical Issue" | "Billing & Plan" | "Provider / Gateway Setup" | "Usage, Cost & Budget" | "Workspace & Team Access" | "Governance & Compliance" | "Bug Report" | "Other";
  "subject": string;
}

export interface AccountUpdateProfileRequest {
  "avatar_url"?: unknown;
  "balance_notify_enabled"?: boolean;
  "balance_notify_extra_emails"?: Array<AccountNotifyEmailEntry>;
  "balance_notify_threshold"?: unknown;
  "default_workspace_id"?: number;
  "username"?: string;
}

export interface BillingAutoCharge {
  "charge_amount": number;
  "configured": boolean;
  "currency": string;
  "enabled": boolean;
  "failure_reason"?: string;
  "payer_name"?: string;
  "payer_user_id"?: number;
  "payment_method"?: BillingAutoChargePaymentMethod;
  "status": string;
  "threshold_amount": number;
  "workspace_id": number;
  "workspace_name": string;
}

export interface BillingAutoChargePaymentMethod {
  "brand": string;
  "last4": string;
}

export interface BillingBalance {
  "balance": number;
  "workspace_id": number;
}

export interface BillingBillingContact {
  "address": string;
  "cc_recipients": Array<string>;
  "email": string;
  "name": string;
  "phone": string;
  "tax_id": string;
}

export interface BillingCancelSubscriptionRequest {
  "cancel_immediately"?: boolean;
  "reason"?: string;
}

export interface BillingChangeSubscriptionRequest {
  "interval": string;
  "plan_id": string;
}

export interface BillingCheckout {
  "amount": number;
  "checkout_url": string;
  "currency": string;
  "expires_at": string;
  "order_id": number;
  "order_type": string;
  "out_trade_no": string;
  "session_id": string;
  "status": string;
  "stripe_mode": string;
  "subscription"?: string;
  "workspace_id": number;
}

export interface BillingCheckoutConfirmation {
  "balance": number;
  "order_id": number;
  "order_type": string;
  "status": string;
  "total_recharged": number;
  "workspace_id": number;
}

export interface BillingConfirmStripeSessionRequest {
  "session_id"?: string;
}

export interface BillingConfirmSubscriptionRequest {
  "plan_id": string;
  "stripe_subscription_id": string;
}

export interface BillingConfirmTopupRequest {
  "client_secret": string;
  "payment_intent_id": string;
}

export interface BillingDetails {
  "details": { [key: string]: unknown; };
  "workspace_id": number;
}

export interface BillingInAppPayment {
  "amount": number;
  "balance"?: number;
  "client_secret"?: string;
  "currency": string;
  "message"?: string;
  "order_id": number;
  "order_type": string;
  "payment_intent_id"?: string;
  "status": string;
  "total_recharged"?: number;
  "workspace_id": number;
}

export interface BillingInvoice {
  "amount_due": number;
  "amount_paid": number;
  "created_at": string;
  "currency": string;
  "due_date"?: string;
  "hosted_invoice_url"?: string;
  "id": number;
  "invoice_number"?: string;
  "invoice_pdf_url"?: string;
  "paid_at"?: string;
  "period_end"?: string;
  "period_start"?: string;
  "status": string;
  "stripe_invoice_id": string;
  "updated_at": string;
  "workspace_id": number;
}

export interface BillingOrder {
  "amount": number;
  "completed_at"?: string;
  "created_at": string;
  "currency": string;
  "expires_at": string;
  "failed_at"?: string;
  "failed_reason"?: string;
  "id": number;
  "order_type": string;
  "out_trade_no": string;
  "paid_at"?: string;
  "pay_amount": number;
  "pay_url"?: string;
  "payment_trade_no"?: string;
  "payment_type": string;
  "plan_id"?: number;
  "provider_snapshot"?: { [key: string]: unknown; };
  "receipt_url"?: string;
  "recharge_code"?: string;
  "source"?: string;
  "status": string;
  "stripe_payment_intent_id"?: string;
  "stripe_session_id"?: string;
  "updated_at": string;
  "user_id": number;
  "workspace_id"?: number;
}

export interface BillingOverview {
  "balance": number;
  "billing_details": { [key: string]: unknown; };
  "current_month_cost": number;
  "current_month_requests": number;
  "current_month_tokens": number;
  "monthly_budget_limit"?: number;
  "recent_invoices": Array<BillingInvoice>;
  "recent_invoices_page_info": BillingPageInfo;
  "workspace_id": number;
}

export interface BillingPageInfo {
  "has_more": boolean;
  "next_cursor"?: string;
}

export interface BillingPaymentMethod {
  "billing_email"?: string;
  "brand"?: string;
  "created_at": string;
  "expiry_month"?: number;
  "expiry_year"?: number;
  "id": string;
  "is_default": boolean;
  "last4"?: string;
  "type": string;
}

export interface BillingPlan {
  "created_at": string;
  "currency": string;
  "description": string;
  "feature_items": Array<string>;
  "features": string;
  "for_sale": boolean;
  "id": number;
  "is_public": boolean;
  "max_api_keys": number;
  "max_members": number;
  "max_teams": number;
  "max_workspaces": number;
  "monthly_cost_quota"?: number;
  "monthly_request_quota"?: number;
  "name": string;
  "price_monthly": number;
  "price_yearly"?: number;
  "slug": string;
  "sort_order": number;
  "status": string;
  "stripe_price_id_monthly"?: string;
  "stripe_price_id_yearly"?: string;
  "trial_days": number;
  "updated_at": string;
}

export interface BillingRetryAutoChargeRequest {
  "workspace_id": number;
}

export interface BillingSavePaymentMethodRequest {
  "payment_method_id": string;
  "set_as_default"?: boolean;
}

export interface BillingSetupIntent {
  "client_secret": string;
  "setup_intent_id": string;
  "status": string;
}

export interface BillingSetupIntentRequest {
  "workspace_id": number;
}

export interface BillingSubscription {
  "can_create_more_workspaces": boolean;
  "current_period_end"?: string;
  "current_period_start"?: string;
  "current_workspace_count": number;
  "effective_plan"?: BillingPlan;
  "effective_subscription_plan_id"?: number;
  "effective_subscription_tier": string;
  "is_trial_expired": boolean;
  "max_workspaces": number;
  "pending_plan_effective_at"?: string;
  "pending_plan_id"?: number;
  "plan"?: BillingPlan;
  "stripe_customer_id"?: string;
  "stripe_schedule_id"?: string;
  "stripe_subscription_id"?: string;
  "subscription_cancel_at_period_end": boolean;
  "subscription_plan_id"?: number;
  "subscription_status": string;
  "subscription_tier": string;
  "trial_ends_at"?: string;
  "user_id": number;
}

export interface BillingSubscriptionCheckout {
  "checkout_url": string;
  "expires_at": string;
  "metadata"?: { [key: string]: unknown; };
  "order_id"?: number;
  "session_id": string;
  "status": string;
}

export interface BillingSubscriptionCheckoutRequest {
  "cancel_url": string;
  "interval": string;
  "plan_id": string;
  "success_url": string;
}

export interface BillingSubscriptionInApp {
  "amount": number;
  "client_secret": string;
  "currency": string;
  "payment_intent_id": string;
  "status": string;
  "stripe_subscription_id": string;
}

export interface BillingSubscriptionInAppRequest {
  "interval": string;
  "plan_id": string;
  "return_url": string;
}

export interface BillingTopupCheckoutRequest {
  "amount": number;
  "cancel_url": string;
  "success_url": string;
  "topup_plan_id"?: string;
  "workspace_id": number;
}

export interface BillingTopupInAppRequest {
  "amount": number;
  "return_url": string;
  "topup_plan_id"?: string;
  "workspace_id": number;
}

export interface BillingTopupPlan {
  "currency": string;
  "custom_amount": boolean;
  "fee_rate": number;
  "id": string;
  "max_amount": number;
  "min_amount": number;
  "name": string;
  "payment_channels": Array<string>;
}

export interface BillingUpdateAutoChargeRequest {
  "charge_amount": number;
  "enabled": boolean;
  "transfer_payer"?: boolean;
  "workspace_id": number;
}

export interface BillingUpdateDetailsRequest {
  "address"?: string;
  "billing_details"?: BillingBillingContact;
  "cc_recipients"?: Array<string>;
  "email"?: string;
  "name"?: string;
  "phone"?: string;
  "tax_id"?: string;
}

export interface CatalogModel {
  "created_at": string;
  "developer": string;
  "group"?: string;
  "icon"?: string;
  "id": number;
  "model_id": string;
  "name": string;
  "route_count": number;
  "status": string;
  "type": string;
  "updated_at": string;
}

export interface CatalogModelDetail {
  "created_at": string;
  "developer": string;
  "group"?: string;
  "icon"?: string;
  "id": number;
  "model_card"?: unknown;
  "model_id": string;
  "name": string;
  "route_count": number;
  "routes": Array<CatalogRouteCandidate>;
  "status": string;
  "type": string;
  "updated_at": string;
}

export interface CatalogPreview {
  "candidate_count": number;
  "candidates": Array<CatalogRouteCandidate>;
  "model": string;
  "preview_metadata"?: { [key: string]: unknown; };
  "workspace_id": number;
}

export interface CatalogPreviewRequest {
  "key_id"?: number;
  "metadata"?: { [key: string]: unknown; };
  "model": string;
  "workspace_id": number;
}

export interface CatalogRouteCandidate {
  "actual_model": string;
  "channel_id": number;
  "channel_name": string;
  "channel_status": string;
  "channel_type": string;
  "id": number;
  "match_source": string;
  "model": string;
  "price"?: unknown;
  "price_reference_id"?: string;
  "provider_platform"?: string;
  "provider_source": string;
  "route_id": string;
  "workspace_id": number;
}

export interface FinancialBudgetCap {
  "api_key_id"?: number;
  "current_spend"?: number;
  "email"?: string;
  "enabled": boolean;
  "monthly_amount": number;
  "name"?: string;
  "scope_id"?: number;
  "scope_type": string;
  "team_id"?: number;
  "user_id"?: number;
}

export interface FinancialGovernance {
  "currency": string;
  "exceeded_action": string;
  "gateway_key_caps": Array<FinancialBudgetCap>;
  "member_caps": Array<FinancialBudgetCap>;
  "member_limits": Array<FinancialMemberSpendingLimit>;
  "notification_channels": Array<string>;
  "team_caps": Array<FinancialBudgetCap>;
  "thresholds": FinancialThresholds;
  "usage_multiplier": number;
  "workspace_cap": FinancialBudgetCap;
  "workspace_id": number;
}

export interface FinancialMemberSpendingLimit {
  "daily_limit"?: number;
  "daily_spend"?: number;
  "email"?: string;
  "monthly_limit"?: number;
  "monthly_spend"?: number;
  "name"?: string;
  "user_id": number;
  "weekly_limit"?: number;
  "weekly_spend"?: number;
}

export interface FinancialPreview {
  "affected_gateway_keys"?: Array<number>;
  "affected_members"?: Array<number>;
  "affected_teams"?: Array<number>;
  "valid": boolean;
  "violations"?: Array<string>;
}

export interface FinancialPreviewRequest {
  "gateway_key_caps"?: Array<FinancialBudgetCap>;
  "member_caps"?: Array<FinancialBudgetCap>;
  "team_caps"?: Array<FinancialBudgetCap>;
  "workspace_cap"?: FinancialBudgetCap;
}

export interface FinancialSpendDetail {
  "limit"?: number;
  "name"?: string;
  "percent"?: number;
  "scope_id"?: number;
  "scope_type": string;
  "spend": number;
  "status": string;
}

export interface FinancialSpendSummary {
  "current_period": string;
  "gateway_key_spends"?: Array<FinancialSpendDetail>;
  "member_spends"?: Array<FinancialSpendDetail>;
  "team_spends"?: Array<FinancialSpendDetail>;
  "workspace_id": number;
  "workspace_spend": FinancialSpendDetail;
}

export interface FinancialThresholds {
  "critical_percent": number;
  "exceeded_action": string;
  "warning_percent": number;
}

export interface FinancialUpdateBudgetCapsRequest {
  "gateway_key_caps"?: Array<FinancialBudgetCap>;
  "member_caps"?: Array<FinancialBudgetCap>;
  "team_caps"?: Array<FinancialBudgetCap>;
  "workspace_cap"?: FinancialBudgetCap;
}

export interface FinancialUpdateGovernanceRequest {
  "exceeded_action"?: string;
  "gateway_key_caps"?: Array<FinancialBudgetCap>;
  "member_caps"?: Array<FinancialBudgetCap>;
  "member_limits"?: Array<FinancialMemberSpendingLimit>;
  "team_caps"?: Array<FinancialBudgetCap>;
  "thresholds"?: FinancialThresholds;
  "usage_multiplier"?: number;
  "workspace_cap"?: FinancialBudgetCap;
}

export interface FinancialUpdateScopeBudgetCapRequest {
  "enabled"?: boolean;
  "monthly_amount"?: number;
}

export interface FinancialUpdateSpendingLimitsRequest {
  "limits": Array<FinancialMemberSpendingLimit>;
}

export interface FinancialUpdateThresholdsRequest {
  "critical_percent"?: number;
  "exceeded_action"?: string;
  "warning_percent"?: number;
}

export interface FinancialUpdateUserSpendingLimitRequest {
  "daily_limit"?: number;
  "monthly_limit"?: number;
  "weekly_limit"?: number;
}

export interface GatewaykeyCreateRequest {
  "assignee_user_id"?: number;
  "budget_limit"?: number;
  "name": string;
  "provider_platform"?: string;
  "provider_source"?: string;
  "rate_limit_rpm"?: number;
  "team_id"?: number;
  "usage_multiplier"?: number;
  "workspace_id": number;
}

export interface GatewaykeyDTO {
  "assignee_user_id"?: number;
  "created_at": string;
  "id": number;
  "key"?: string;
  "masked_key": string;
  "name": string;
  "provider_platform"?: string;
  "provider_source": string;
  "rate_limit_rpm"?: number;
  "status": string;
  "team_id"?: number;
  "updated_at": string;
  "usage_multiplier": number;
  "workspace_id": number;
}

export interface GatewaykeyUpdateRequest {
  "assignee_user_id"?: number;
  "budget_limit"?: number;
  "clear_assignee_user_id"?: boolean;
  "clear_team_id"?: boolean;
  "name"?: string;
  "provider_platform"?: string;
  "provider_source"?: string;
  "rate_limit_rpm"?: number;
  "team_id"?: number;
  "usage_multiplier"?: number;
}

export interface LogsAuditLog {
  "action": string;
  "actor_label": string;
  "after_state"?: { [key: string]: unknown; };
  "before_after_summary": string;
  "before_state"?: { [key: string]: unknown; };
  "created_at": string;
  "error_message"?: string;
  "id": number;
  "ip_address"?: string;
  "metadata"?: { [key: string]: unknown; };
  "resource_id": string;
  "resource_name"?: string;
  "resource_type": string;
  "status": string;
  "target_label": string;
  "user_agent"?: string;
  "user_email"?: string;
  "user_id": number;
  "user_name"?: string;
  "workspace_id": number;
}

export interface LogsLogDataQuota {
  "cleanup_recommended": boolean;
  "deleted_bytes"?: number;
  "deleted_objects"?: number;
  "last_calculated_at": string;
  "last_error"?: string;
  "limit_bytes": number;
  "over_limit": boolean;
  "usage_percent": number;
  "used_bytes": number;
  "warning": boolean;
}

export interface LogsLoggingSettings {
  "capture_headers": boolean;
  "capture_request_body": boolean;
  "capture_response_body": boolean;
  "capture_stream_chunks": boolean;
  "enabled": boolean;
  "log_data_quota"?: LogsLogDataQuota;
  "mask_sensitive_headers": boolean;
  "max_body_size": number;
  "redact_headers": Array<string>;
  "retention_days": number;
}

export interface LogsPayload {
  "api_key_id"?: number;
  "channel_id"?: number;
  "client_ip"?: string;
  "created_at": string;
  "duration_ms"?: number;
  "executions"?: Array<LogsPayloadExecution>;
  "external_id"?: string;
  "first_token_ms"?: number;
  "format": string;
  "id": number;
  "model": string;
  "reasoning_duration_ms"?: number;
  "request_body"?: unknown;
  "request_id": string;
  "response_body"?: unknown;
  "response_chunks"?: unknown;
  "status": string;
  "stream": boolean;
  "trace_id"?: number;
  "trace_key"?: string;
  "updated_at": string;
  "workspace_id": number;
}

export interface LogsPayloadAccess {
  "capture_request_body": boolean;
  "capture_response_body": boolean;
  "capture_stream_chunks": boolean;
  "enabled": boolean;
  "message"?: string;
  "request_disabled_message"?: string;
  "response_disabled_message"?: string;
}

export interface LogsPayloadExecution {
  "channel_id"?: number;
  "created_at": string;
  "error_message"?: string;
  "external_id"?: string;
  "format": string;
  "id": number;
  "model": string;
  "request_body"?: unknown;
  "response_body"?: unknown;
  "response_chunks"?: unknown;
  "status": string;
  "status_code"?: number;
  "stream": boolean;
  "updated_at": string;
}

export interface LogsPayloadSummary {
  "created_at": string;
  "format": string;
  "id": number;
  "model": string;
  "request_id": string;
  "status": string;
  "stream": boolean;
  "trace_id"?: number;
  "trace_key"?: string;
  "workspace_id": number;
}

export interface LogsUpdateLoggingSettingsRequest {
  "capture_headers"?: boolean;
  "capture_request_body"?: boolean;
  "capture_response_body"?: boolean;
  "capture_stream_chunks"?: boolean;
  "enabled"?: boolean;
  "mask_sensitive_headers"?: boolean;
  "max_body_size"?: number;
  "redact_headers"?: Array<string>;
  "retention_days"?: number;
}

export interface ObservabilityRequestLog {
  "created_at": string;
  "format"?: string;
  "gateway_key_id": number;
  "id": number;
  "input_tokens": number;
  "key_name": string;
  "latency_ms": number;
  "member_name": string;
  "model": string;
  "output_tokens": number;
  "provider": string;
  "provider_id": number;
  "provider_source": string;
  "request_id": string;
  "status": string;
  "status_code": number;
  "stream": boolean;
  "team_id": number;
  "team_name": string;
  "total_cost": number;
  "total_tokens": number;
  "trace_id": string;
  "user_id": number;
  "workspace_id": number;
}

export interface ObservabilityTrace {
  "created_at": string;
  "id": number;
  "thread_id"?: number;
  "trace_id": string;
  "updated_at": string;
  "workspace_id": number;
}

export interface PolicyAddKeywordRequest {
  "description"?: string;
  "enabled"?: boolean;
  "keyword": string;
  "workspace_id": number;
}

export interface PolicyBudgetPolicy {
  "current_spend": number;
  "enforcement_mode": string;
  "id": number;
  "monthly_limit": number;
  "scope": string;
  "scope_id": number;
}

export interface PolicyDTO {
  "budget_policies": Array<PolicyBudgetPolicy>;
  "key_id"?: number;
  "keyword_policies": Array<PolicyKeywordPolicy>;
  "log_policies": Array<PolicyLogPolicy>;
  "model_policies": Array<PolicyModelPolicy>;
  "rate_limits": Array<PolicyRateLimit>;
  "warnings"?: Array<string>;
  "workspace_id": number;
}

export interface PolicyKeywordPolicy {
  "action": string;
  "description"?: string;
  "enabled": boolean;
  "id": number;
  "keyword": string;
  "scope": string;
}

export interface PolicyLogPolicy {
  "capture_request": boolean;
  "capture_response": boolean;
  "id": number;
  "retention_days": number;
  "scope": string;
}

export interface PolicyModelPolicy {
  "action": string;
  "applies_to"?: Array<string>;
  "id": number;
  "model_id": string;
  "priority": number;
  "provider": string;
  "reason"?: string;
  "redirect_to"?: string;
  "scope": string;
}

export interface PolicyPreview {
  "allowed": boolean;
  "blocked_by": Array<string>;
  "budget_check": string;
  "modified_by": Array<string>;
  "rate_limit_check": string;
  "redirected_to"?: string;
  "warnings": Array<string>;
}

export interface PolicyPreviewRequest {
  "key_id"?: number;
  "model": string;
  "request"?: { [key: string]: unknown; };
  "workspace_id": number;
}

export interface PolicyRateLimit {
  "enforcement_mode": string;
  "id": number;
  "requests_per_min"?: number;
  "scope": string;
  "tokens_per_min"?: number;
}

export interface PolicyUpdateRequest {
  "action"?: string;
  "enabled"?: boolean;
  "priority"?: number;
  "redirect_to"?: string;
}

export interface ProviderCreateRequest {
  "api_key": string;
  "api_mode"?: string;
  "base_url"?: string;
  "default_model"?: string;
  "name": string;
  "type": string;
  "workspace_id": number;
}

export interface ProviderDTO {
  "api_mode": string;
  "base_url": string;
  "created_at": string;
  "default_model": string;
  "error_count": number;
  "id": number;
  "is_platform_managed"?: boolean;
  "last_used_at"?: string;
  "name": string;
  "provider_platform"?: string;
  "provider_source": string;
  "request_count": number;
  "status": string;
  "type": string;
  "updated_at": string;
  "workspace_id": number;
}

export interface ProviderUpdateRequest {
  "api_key"?: string;
  "api_mode"?: string;
  "base_url"?: string;
  "default_model"?: string;
  "name"?: string;
  "status"?: string;
  "workspace_id": number;
}

export interface ProviderVerification {
  "latency_ms"?: number;
  "message": string;
  "success": boolean;
}

export interface ProviderVerifyRequest {
  "api_key"?: string;
  "api_mode"?: string;
  "base_url"?: string;
  "default_model"?: string;
  "provider_id"?: number;
  "type"?: string;
  "workspace_id": number;
}

export interface UsageQuota {
  "limit": number;
  "remaining": number;
  "used": number;
}

export interface UsageRecord {
  "cost": number;
  "id": string;
  "model": string;
  "provider"?: string;
  "requests": number;
  "timestamp": string;
  "tokens": number;
}

export interface UsageSummary {
  "cost": number;
  "requests": number;
  "tokens": number;
}

export interface WebhookBulkRedeliverRequest {
  "endpoint_id"?: number;
  "event_ids"?: Array<number>;
  "event_type"?: string;
  "limit"?: number;
  "workspace_id": number;
}

export interface WebhookCreateEndpointRequest {
  "event_types": Array<"billing.payment_failed" | "billing.invoice_available" | "quota.threshold_reached" | "workspace.member_added" | "gateway.key.created" | "gateway.key.updated">;
  "url": string;
  "workspace_id": number;
}

export interface WebhookEndpoint {
  "created_at": string;
  "event_types": Array<string>;
  "id": number;
  "secret"?: string;
  "status": string;
  "updated_at": string;
  "url": string;
  "workspace_id": number;
}

export interface WebhookEvent {
  "attempts": number;
  "created_at": string;
  "delivered_at"?: string;
  "endpoint_id": number;
  "event_type": string;
  "id": number;
  "last_error"?: string;
  "payload": { [key: string]: unknown; };
  "status": string;
  "updated_at": string;
  "workspace_id": number;
}

export interface WebhookEventType {
  "description": string;
  "type": string;
}

export interface WebhookUpdateEndpointRequest {
  "event_types"?: Array<"billing.payment_failed" | "billing.invoice_available" | "quota.threshold_reached" | "workspace.member_added" | "gateway.key.created" | "gateway.key.updated">;
  "status"?: "enabled" | "disabled";
  "url"?: string;
}

export interface WorkspaceActivity {
  "created_at": string;
  "id": number;
  "ip"?: string;
  "meta": string;
  "tab": string;
  "what": string;
  "who": string;
}

export interface WorkspaceBreakdown {
  "by_member": Array<WorkspaceBreakdownRow>;
  "by_provider": Array<WorkspaceBreakdownRow>;
  "by_team": Array<WorkspaceBreakdownRow>;
}

export interface WorkspaceBreakdownRow {
  "cost": number;
  "id"?: number;
  "key_count"?: number;
  "member_count"?: number;
  "name": string;
  "request_count"?: number;
  "token_label": string;
  "token_used": number;
}

export interface WorkspaceCostSummary {
  "budget": number;
  "current": number;
  "percent": number;
  "weekly_budget": number;
  "weekly_current": number;
}

export interface WorkspaceCreateRequest {
  "description"?: string;
  "name": string;
  "region"?: string;
  "slug"?: string;
  "type"?: string;
}

export interface WorkspaceDTO {
  "created_at": string;
  "description": string;
  "id": number;
  "name": string;
  "region": string;
  "role"?: string;
  "slug": string;
  "status": string;
  "type": string;
  "updated_at": string;
  "workspace_id": number;
}

export interface WorkspaceMetricAnalysis {
  "by_member": Array<{ [key: string]: unknown; }>;
  "by_provider": Array<{ [key: string]: unknown; }>;
  "by_team": Array<{ [key: string]: unknown; }>;
  "series": WorkspaceSeriesCatalog;
  "total": Array<{ [key: string]: unknown; }>;
}

export interface WorkspaceOverview {
  "breakdown": WorkspaceBreakdown;
  "cost_analysis": WorkspaceMetricAnalysis;
  "range": string;
  "recent_activity": WorkspaceOverviewRecentActivity;
  "summary": WorkspaceOverviewSummary;
  "usage_analysis": WorkspaceMetricAnalysis;
}

export interface WorkspaceOverviewAuditLog {
  "action": string;
  "after"?: string;
  "before"?: string;
  "created_at": string;
  "id": number;
  "ip_address"?: string;
  "resource_name": string;
  "resource_type": string;
  "status": string;
  "user_name": string;
}

export interface WorkspaceOverviewRecentActivity {
  "audit_logs": Array<WorkspaceOverviewAuditLog>;
  "audit_logs_available": boolean;
  "request_logs": Array<WorkspaceOverviewRequestLog>;
}

export interface WorkspaceOverviewRequestLog {
  "created_at": string;
  "id": number;
  "input_tokens": number;
  "key_name": string;
  "latency_ms"?: number;
  "member"?: string;
  "model": string;
  "output_tokens": number;
  "provider": string;
  "status": string;
  "status_code": number;
  "team"?: string;
  "total_cost": number;
  "total_tokens": number;
  "trace_id"?: string;
}

export interface WorkspaceOverviewSummary {
  "cost": WorkspaceCostSummary;
  "resources": WorkspaceResourceSummary;
  "system_status": WorkspaceSystemStatus;
  "token_usage": WorkspaceTokenSummary;
}

export interface WorkspaceQuotaCounter {
  "limit": number;
  "used": number;
}

export interface WorkspaceQuotaItem {
  "key": string;
  "label": string;
  "limit": number;
  "unit"?: string;
  "used": number;
}

export interface WorkspaceQuotaPlan {
  "name": string;
  "quotas": { [key: string]: number; };
  "slug": string;
}

export interface WorkspaceQuotaSummary {
  "items": Array<WorkspaceQuotaItem>;
  "plan": WorkspaceQuotaPlan;
  "workspace_id": number;
}

export interface WorkspaceQuotaUsage {
  "api_keys": WorkspaceQuotaCounter;
  "members": WorkspaceQuotaCounter;
  "teams": WorkspaceQuotaCounter;
}

export interface WorkspaceResourceSummary {
  "active_keys": number;
  "members": number;
  "providers": number;
  "teams": number;
}

export interface WorkspaceSeriesCatalog {
  "members": Array<string>;
  "providers": Array<string>;
  "teams": Array<string>;
}

export interface WorkspaceSystemStatus {
  "avg_latency_ms": number;
  "health_pct": number;
  "success_rate": number;
  "tone": string;
}

export interface WorkspaceTokenSummary {
  "current": number;
  "label": string;
  "weekly_current": number;
  "weekly_label": string;
}

export interface WorkspaceUpdateRequest {
  "description"?: string;
  "name"?: string;
}

export interface ManagementOperationData {
  "get_billing_auto-charge": BillingAutoCharge;
  "put_billing_auto-charge": BillingAutoCharge;
  "post_billing_auto-charge_retry": BillingAutoCharge;
  "get_billing_balance": BillingBalance;
  "get_billing_invoices": ListBillingInvoice;
  "get_billing_invoices_invoice_id": BillingInvoice;
  "get_billing_orders": ListBillingOrder;
  "get_billing_orders_order_id": BillingOrder;
  "post_billing_orders_order_id_confirm-stripe-session": BillingCheckoutConfirmation;
  "get_billing_overview": BillingOverview;
  "get_billing_payment-methods": ListBillingPaymentMethod;
  "post_billing_payment-methods": BillingPaymentMethod;
  "post_billing_payment-methods_setup-intent": BillingSetupIntent;
  "delete_billing_payment-methods_payment_method_id": Deleted;
  "put_billing_payment-methods_payment_method_id_default": BillingPaymentMethod;
  "get_billing_plans": ListBillingPlan;
  "get_billing_plans_plan_id": BillingPlan;
  "get_billing_subscription": BillingSubscription;
  "post_billing_subscription_cancel": BillingSubscription;
  "post_billing_subscription_checkout": BillingSubscriptionCheckout;
  "post_billing_subscription_checkout-sessions_sync-latest": BillingSubscriptionCheckout;
  "get_billing_subscription_checkout-sessions_session_id": BillingSubscriptionCheckout;
  "post_billing_subscription_downgrade": BillingSubscription;
  "post_billing_subscription_in-app": BillingSubscriptionInApp;
  "post_billing_subscription_in-app_confirm": BillingSubscription;
  "post_billing_subscription_reactivate": BillingSubscription;
  "post_billing_subscription_upgrade": BillingSubscription;
  "get_billing_topup-plans": ListBillingTopupPlan;
  "get_billing_topups": ListBillingOrder;
  "post_billing_topups_checkout": BillingCheckout;
  "post_billing_topups_in-app": BillingInAppPayment;
  "post_billing_topups_in-app_confirm": BillingOrder;
  "get_billing_topups_topup_id": BillingOrder;
  "get_gateway_keys": ListGatewaykeyDTO;
  "post_gateway_keys": GatewaykeyDTO;
  "delete_gateway_keys_key_id": Deleted;
  "get_gateway_keys_key_id": GatewaykeyDTO;
  "patch_gateway_keys_key_id": GatewaykeyDTO;
  "post_gateway_keys_key_id_disable": GatewaykeyDTO;
  "post_gateway_keys_key_id_enable": GatewaykeyDTO;
  "post_gateway_keys_key_id_rotate": GatewaykeyDTO;
  "get_gateway_models": ListCatalogModel;
  "get_gateway_models_model_id": CatalogModelDetail;
  "get_gateway_payload-logs": ListLogsPayloadSummary;
  "get_gateway_payload-logs_access": LogsPayloadAccess;
  "get_gateway_payload-logs_payload_id": LogsPayload;
  "get_gateway_policies": PolicyDTO;
  "post_gateway_policies_keywords": PolicyDTO;
  "delete_gateway_policies_keywords_keyword_id": PolicyDTO;
  "post_gateway_policies_preview": PolicyPreview;
  "patch_gateway_policies_policy_id": PolicyModelPolicy;
  "get_gateway_providers": ListProviderDTO;
  "post_gateway_providers": ProviderDTO;
  "post_gateway_providers_verify-connection": ProviderVerification;
  "delete_gateway_providers_provider_id": Deleted;
  "get_gateway_providers_provider_id": ProviderDTO;
  "patch_gateway_providers_provider_id": ProviderDTO;
  "get_gateway_quota": UsageQuota;
  "get_gateway_request-logs": ListObservabilityRequestLog;
  "get_gateway_request-logs_request_id": ObservabilityRequestLog;
  "get_gateway_routes": ListCatalogRouteCandidate;
  "post_gateway_routes_preview": CatalogPreview;
  "get_gateway_routes_route_id": CatalogRouteCandidate;
  "get_gateway_traces": ListObservabilityTrace;
  "get_gateway_traces_trace_id": ObservabilityTrace;
  "get_gateway_usage": ListUsageRecord;
  "get_gateway_usage_summary": UsageSummary;
  "get_user_notification-preferences": AccountNotificationPreferences;
  "put_user_notification-preferences": AccountNotificationPreferences;
  "put_user_password": AccountMessage;
  "get_user_profile": AccountProfile;
  "put_user_profile": AccountProfile;
  "post_user_support-requests": AccountMessage;
  "get_users_me_invitation-stats": AccountInvitationStats;
  "get_users_me_invitations": Array<AccountInvitation>;
  "get_users_me_invite-link": AccountInvitationStats;
  "post_users_me_send-invitation": AccountInvitationSent;
  "get_webhook-endpoints": ListWebhookEndpoint;
  "post_webhook-endpoints": WebhookEndpoint;
  "delete_webhook-endpoints_endpoint_id": Deleted;
  "get_webhook-endpoints_endpoint_id": WebhookEndpoint;
  "patch_webhook-endpoints_endpoint_id": WebhookEndpoint;
  "post_webhook-endpoints_endpoint_id_disable": WebhookEndpoint;
  "post_webhook-endpoints_endpoint_id_enable": WebhookEndpoint;
  "get_webhook-endpoints_endpoint_id_events": ListWebhookEvent;
  "post_webhook-endpoints_endpoint_id_rotate-secret": WebhookEndpoint;
  "post_webhook-endpoints_endpoint_id_test": WebhookEvent;
  "get_webhook-event-types": ListWebhookEventType;
  "get_webhook-events": ListWebhookEvent;
  "post_webhook-events_bulk-redeliver": ListWebhookEvent;
  "get_webhook-events_event_id": WebhookEvent;
  "post_webhook-events_event_id_redeliver": WebhookEvent;
  "post_webhook-events_event_id_retry": WebhookEvent;
  "get_workspaces": ListWorkspaceDTO;
  "post_workspaces": WorkspaceDTO;
  "delete_workspaces_workspace_id": unknown;
  "get_workspaces_workspace_id": WorkspaceDTO;
  "patch_workspaces_workspace_id": WorkspaceDTO;
  "get_workspaces_workspace_id_activity": Array<WorkspaceActivity>;
  "get_workspaces_workspace_id_audit-logs": ListLogsAuditLog;
  "get_workspaces_workspace_id_audit-logs_audit_log_id": LogsAuditLog;
  "get_workspaces_workspace_id_billing-details": BillingDetails;
  "put_workspaces_workspace_id_billing-details": BillingDetails;
  "get_workspaces_workspace_id_governance_financial": FinancialGovernance;
  "put_workspaces_workspace_id_governance_financial": FinancialGovernance;
  "get_workspaces_workspace_id_governance_financial_budget-caps": FinancialGovernance;
  "put_workspaces_workspace_id_governance_financial_budget-caps": FinancialGovernance;
  "patch_workspaces_workspace_id_governance_financial_budget-caps_scope_type_scope_id": FinancialBudgetCap;
  "post_workspaces_workspace_id_governance_financial_preview": FinancialPreview;
  "get_workspaces_workspace_id_governance_financial_spend-summary": FinancialSpendSummary;
  "get_workspaces_workspace_id_governance_financial_spending-limits": ListFinancialMemberSpendingLimit;
  "put_workspaces_workspace_id_governance_financial_spending-limits": ListFinancialMemberSpendingLimit;
  "patch_workspaces_workspace_id_governance_financial_spending-limits_users_user_id": FinancialMemberSpendingLimit;
  "get_workspaces_workspace_id_governance_financial_thresholds": FinancialThresholds;
  "put_workspaces_workspace_id_governance_financial_thresholds": FinancialThresholds;
  "get_workspaces_workspace_id_invitations": ListAccessInvitation;
  "post_workspaces_workspace_id_invitations": AccessInvitation;
  "post_workspaces_workspace_id_invitations_invitation_id_resend": AccessInvitation;
  "post_workspaces_workspace_id_invitations_invitation_id_revoke": AccessInvitation;
  "get_workspaces_workspace_id_logging-settings": LogsLoggingSettings;
  "put_workspaces_workspace_id_logging-settings": LogsLoggingSettings;
  "get_workspaces_workspace_id_members": ListAccessMember;
  "post_workspaces_workspace_id_members": AccessMember;
  "get_workspaces_workspace_id_members_role-options": AccessRoleOptions;
  "delete_workspaces_workspace_id_members_member_id": Deleted;
  "get_workspaces_workspace_id_members_member_id": AccessMember;
  "patch_workspaces_workspace_id_members_member_id": AccessMember;
  "get_workspaces_workspace_id_members_member_id_permissions": AccessMemberPermissions;
  "put_workspaces_workspace_id_members_member_id_permissions": AccessMemberPermissions;
  "post_workspaces_workspace_id_members_member_id_permissions_reset": AccessMemberPermissions;
  "get_workspaces_workspace_id_overview": WorkspaceOverview;
  "get_workspaces_workspace_id_permissions": AccessPermissionGroups;
  "get_workspaces_workspace_id_quota-summary": WorkspaceQuotaSummary;
  "get_workspaces_workspace_id_quota-usage": WorkspaceQuotaUsage;
  "get_workspaces_workspace_id_roles": ListAccessRole;
  "post_workspaces_workspace_id_roles": AccessRole;
  "delete_workspaces_workspace_id_roles_role_id": Deleted;
  "get_workspaces_workspace_id_roles_role_id": AccessRole;
  "patch_workspaces_workspace_id_roles_role_id": AccessRole;
  "get_workspaces_workspace_id_teams": ListAccessTeam;
  "post_workspaces_workspace_id_teams": AccessTeam;
  "delete_workspaces_workspace_id_teams_team_id": Deleted;
  "get_workspaces_workspace_id_teams_team_id": AccessTeam;
  "patch_workspaces_workspace_id_teams_team_id": AccessTeam;
}

export interface ManagementOperationBody {
  "get_billing_auto-charge": unknown;
  "put_billing_auto-charge": BillingUpdateAutoChargeRequest;
  "post_billing_auto-charge_retry": BillingRetryAutoChargeRequest;
  "get_billing_balance": unknown;
  "get_billing_invoices": unknown;
  "get_billing_invoices_invoice_id": unknown;
  "get_billing_orders": unknown;
  "get_billing_orders_order_id": unknown;
  "post_billing_orders_order_id_confirm-stripe-session": BillingConfirmStripeSessionRequest;
  "get_billing_overview": unknown;
  "get_billing_payment-methods": unknown;
  "post_billing_payment-methods": BillingSavePaymentMethodRequest;
  "post_billing_payment-methods_setup-intent": BillingSetupIntentRequest;
  "delete_billing_payment-methods_payment_method_id": unknown;
  "put_billing_payment-methods_payment_method_id_default": unknown;
  "get_billing_plans": unknown;
  "get_billing_plans_plan_id": unknown;
  "get_billing_subscription": unknown;
  "post_billing_subscription_cancel": BillingCancelSubscriptionRequest;
  "post_billing_subscription_checkout": BillingSubscriptionCheckoutRequest;
  "post_billing_subscription_checkout-sessions_sync-latest": unknown;
  "get_billing_subscription_checkout-sessions_session_id": unknown;
  "post_billing_subscription_downgrade": BillingChangeSubscriptionRequest;
  "post_billing_subscription_in-app": BillingSubscriptionInAppRequest;
  "post_billing_subscription_in-app_confirm": BillingConfirmSubscriptionRequest;
  "post_billing_subscription_reactivate": unknown;
  "post_billing_subscription_upgrade": BillingChangeSubscriptionRequest;
  "get_billing_topup-plans": unknown;
  "get_billing_topups": unknown;
  "post_billing_topups_checkout": BillingTopupCheckoutRequest;
  "post_billing_topups_in-app": BillingTopupInAppRequest;
  "post_billing_topups_in-app_confirm": BillingConfirmTopupRequest;
  "get_billing_topups_topup_id": unknown;
  "get_gateway_keys": unknown;
  "post_gateway_keys": GatewaykeyCreateRequest;
  "delete_gateway_keys_key_id": unknown;
  "get_gateway_keys_key_id": unknown;
  "patch_gateway_keys_key_id": GatewaykeyUpdateRequest;
  "post_gateway_keys_key_id_disable": unknown;
  "post_gateway_keys_key_id_enable": unknown;
  "post_gateway_keys_key_id_rotate": unknown;
  "get_gateway_models": unknown;
  "get_gateway_models_model_id": unknown;
  "get_gateway_payload-logs": unknown;
  "get_gateway_payload-logs_access": unknown;
  "get_gateway_payload-logs_payload_id": unknown;
  "get_gateway_policies": unknown;
  "post_gateway_policies_keywords": PolicyAddKeywordRequest;
  "delete_gateway_policies_keywords_keyword_id": unknown;
  "post_gateway_policies_preview": PolicyPreviewRequest;
  "patch_gateway_policies_policy_id": PolicyUpdateRequest;
  "get_gateway_providers": unknown;
  "post_gateway_providers": ProviderCreateRequest;
  "post_gateway_providers_verify-connection": ProviderVerifyRequest;
  "delete_gateway_providers_provider_id": unknown;
  "get_gateway_providers_provider_id": unknown;
  "patch_gateway_providers_provider_id": ProviderUpdateRequest;
  "get_gateway_quota": unknown;
  "get_gateway_request-logs": unknown;
  "get_gateway_request-logs_request_id": unknown;
  "get_gateway_routes": unknown;
  "post_gateway_routes_preview": CatalogPreviewRequest;
  "get_gateway_routes_route_id": unknown;
  "get_gateway_traces": unknown;
  "get_gateway_traces_trace_id": unknown;
  "get_gateway_usage": unknown;
  "get_gateway_usage_summary": unknown;
  "get_user_notification-preferences": unknown;
  "put_user_notification-preferences": AccountNotificationPreferences;
  "put_user_password": AccountChangePasswordRequest;
  "get_user_profile": unknown;
  "put_user_profile": AccountUpdateProfileRequest;
  "post_user_support-requests": AccountSupportRequest;
  "get_users_me_invitation-stats": unknown;
  "get_users_me_invitations": unknown;
  "get_users_me_invite-link": unknown;
  "post_users_me_send-invitation": AccountSendInvitationRequest;
  "get_webhook-endpoints": unknown;
  "post_webhook-endpoints": WebhookCreateEndpointRequest;
  "delete_webhook-endpoints_endpoint_id": unknown;
  "get_webhook-endpoints_endpoint_id": unknown;
  "patch_webhook-endpoints_endpoint_id": WebhookUpdateEndpointRequest;
  "post_webhook-endpoints_endpoint_id_disable": unknown;
  "post_webhook-endpoints_endpoint_id_enable": unknown;
  "get_webhook-endpoints_endpoint_id_events": unknown;
  "post_webhook-endpoints_endpoint_id_rotate-secret": unknown;
  "post_webhook-endpoints_endpoint_id_test": unknown;
  "get_webhook-event-types": unknown;
  "get_webhook-events": unknown;
  "post_webhook-events_bulk-redeliver": WebhookBulkRedeliverRequest;
  "get_webhook-events_event_id": unknown;
  "post_webhook-events_event_id_redeliver": unknown;
  "post_webhook-events_event_id_retry": unknown;
  "get_workspaces": unknown;
  "post_workspaces": WorkspaceCreateRequest;
  "delete_workspaces_workspace_id": unknown;
  "get_workspaces_workspace_id": unknown;
  "patch_workspaces_workspace_id": WorkspaceUpdateRequest;
  "get_workspaces_workspace_id_activity": unknown;
  "get_workspaces_workspace_id_audit-logs": unknown;
  "get_workspaces_workspace_id_audit-logs_audit_log_id": unknown;
  "get_workspaces_workspace_id_billing-details": unknown;
  "put_workspaces_workspace_id_billing-details": BillingUpdateDetailsRequest;
  "get_workspaces_workspace_id_governance_financial": unknown;
  "put_workspaces_workspace_id_governance_financial": FinancialUpdateGovernanceRequest;
  "get_workspaces_workspace_id_governance_financial_budget-caps": unknown;
  "put_workspaces_workspace_id_governance_financial_budget-caps": FinancialUpdateBudgetCapsRequest;
  "patch_workspaces_workspace_id_governance_financial_budget-caps_scope_type_scope_id": FinancialUpdateScopeBudgetCapRequest;
  "post_workspaces_workspace_id_governance_financial_preview": FinancialPreviewRequest;
  "get_workspaces_workspace_id_governance_financial_spend-summary": unknown;
  "get_workspaces_workspace_id_governance_financial_spending-limits": unknown;
  "put_workspaces_workspace_id_governance_financial_spending-limits": FinancialUpdateSpendingLimitsRequest;
  "patch_workspaces_workspace_id_governance_financial_spending-limits_users_user_id": FinancialUpdateUserSpendingLimitRequest;
  "get_workspaces_workspace_id_governance_financial_thresholds": unknown;
  "put_workspaces_workspace_id_governance_financial_thresholds": FinancialUpdateThresholdsRequest;
  "get_workspaces_workspace_id_invitations": unknown;
  "post_workspaces_workspace_id_invitations": AccessCreateInvitationRequest;
  "post_workspaces_workspace_id_invitations_invitation_id_resend": unknown;
  "post_workspaces_workspace_id_invitations_invitation_id_revoke": unknown;
  "get_workspaces_workspace_id_logging-settings": unknown;
  "put_workspaces_workspace_id_logging-settings": LogsUpdateLoggingSettingsRequest;
  "get_workspaces_workspace_id_members": unknown;
  "post_workspaces_workspace_id_members": AccessInviteMemberRequest;
  "get_workspaces_workspace_id_members_role-options": unknown;
  "delete_workspaces_workspace_id_members_member_id": unknown;
  "get_workspaces_workspace_id_members_member_id": unknown;
  "patch_workspaces_workspace_id_members_member_id": AccessUpdateMemberRequest;
  "get_workspaces_workspace_id_members_member_id_permissions": unknown;
  "put_workspaces_workspace_id_members_member_id_permissions": AccessUpdatePermissionsRequest;
  "post_workspaces_workspace_id_members_member_id_permissions_reset": unknown;
  "get_workspaces_workspace_id_overview": unknown;
  "get_workspaces_workspace_id_permissions": unknown;
  "get_workspaces_workspace_id_quota-summary": unknown;
  "get_workspaces_workspace_id_quota-usage": unknown;
  "get_workspaces_workspace_id_roles": unknown;
  "post_workspaces_workspace_id_roles": AccessCreateRoleRequest;
  "delete_workspaces_workspace_id_roles_role_id": unknown;
  "get_workspaces_workspace_id_roles_role_id": unknown;
  "patch_workspaces_workspace_id_roles_role_id": AccessUpdateRoleRequest;
  "get_workspaces_workspace_id_teams": unknown;
  "post_workspaces_workspace_id_teams": AccessCreateTeamRequest;
  "delete_workspaces_workspace_id_teams_team_id": unknown;
  "get_workspaces_workspace_id_teams_team_id": unknown;
  "patch_workspaces_workspace_id_teams_team_id": AccessUpdateTeamRequest;
}
