export type Language = 'en' | 'fr' | 'ar';

export interface Translations {
  // General / UI
  lang_en: string;
  lang_fr: string;
  lang_ar: string;
  back: string;
  back_to_noc: string;
  cancel: string;
  save: string;
  confirm: string;
  close: string;
  actions: string;
  status: string;
  search: string;
  all: string;
  currency: string;
  admin: string;
  field_tech: string;
  technician: string;
  mobile: string;
  live: string;

  // Table Columns (Exact terms requested)
  col_subscriber_location: string;
  col_neighborhood: string;
  col_monthly_fee: string;
  col_status: string;
  col_cpe_antenna: string;
  col_pppoe_router: string;
  col_cpe_pppoe: string;
  col_neighborhood_address: string;
  col_monthly_due: string;

  // Status Badges (Exact terms requested)
  status_active: string;
  status_due_soon: string;
  status_overdue: string;
  status_suspended: string;
  status_archived: string;

  // Action Buttons (Exact terms requested)
  action_record_payment: string;
  action_new_installation: string;
  action_edit: string;
  action_delete: string;
  action_send_whatsapp: string;
  action_open_ticket: string;

  // Search & Filters (Exact terms requested)
  dir_search_placeholder: string;
  filter_all_neighborhoods: string;
  urgent_badge_accounts: string;

  // Ticket & Field Management Terms (Exact terms requested)
  ticket_status_open: string;
  ticket_status_in_progress: string;
  ticket_status_resolved: string;

  // FieldTech Header & Details
  fieldtech_title: string;
  fieldtech_subtitle: string;
  role_rooftop: string;
  role_antenna: string;
  pending: string;
  done_today: string;
  tab_active_tasks: string;
  tab_resolved: string;
  empty_tasks_title: string;
  empty_tasks_msg: string;
  empty_resolved_msg: string;
  call: string;
  directions: string;
  mark_resolved: string;
  reopen_task: string;
  start_task: string;
  telemetry_title: string;
  antenna_model: string;
  antenna_mac: string;
  pppoe_account: string;
  wifi_ssid: string;
  resolution_modal_title: string;
  resolution_modal_sub: string;
  resolution_action_label: string;
  resolution_default_note: string;
  completed_action: string;
  client_contact: string;

  // Categories & Priorities
  cat_no_internet: string;
  cat_weak_signal: string;
  cat_power_adapter: string;
  cat_new_installation: string;
  cat_router_config: string;
  prio_urgent: string;
  prio_high: string;
  prio_normal: string;

  // Admin NOC & Navbar
  nav_brand: string;
  nav_dashboard: string;
  nav_clients: string;
  nav_tickets: string;
  nav_team: string;
  nav_fieldtech: string;
  nav_reset_demo: string;
  nav_sign_out: string;
  reset_modal_title: string;
  reset_modal_desc: string;
  reset_modal_confirm: string;

  // Dashboard NOC
  dash_title: string;
  dash_subtitle: string;
  dash_record_payment: string;
  dash_new_installation: string;
  dash_new_ticket: string;
  metric_active_subs: string;
  metric_monthly_revenue: string;
  metric_today_revenue: string;
  metric_overdue_uncollected: string;
  metric_open_tickets: string;
  connected_label: string;
  overdue_label: string;
  urgent_center_title: string;
  urgent_center_subtitle: string;
  all_accounts_up_to_date: string;
  all_accounts_up_to_date_sub: string;
  no_subscribers_registered: string;
  no_subscribers_registered_sub: string;
  register_first_client: string;
  recent_payments_title: string;
  recent_payments_subtitle: string;
  no_payments_found: string;
  no_payments_found_sub: string;
  infrastructure_title: string;
  infrastructure_subtitle: string;
  bandwidth_consumption: string;

  // Client Directory
  dir_title: string;
  dir_subtitle: string;
  no_clients_found: string;
  no_clients_match_filters: string;

  // Tickets
  tickets_title: string;
  tickets_subtitle: string;
  create_ticket_btn: string;
  all_clear_title: string;
  all_clear_subtitle: string;
  no_tickets_found: string;
  col_open: string;
  col_in_progress: string;
  col_resolved: string;

  // Delete & Edit Modals
  delete_modal_title: string;
  delete_modal_sub: string;
  delete_modal_confirm_msg: string;
  delete_modal_cascade_warning: string;
  delete_confirm_btn: string;
  deleting_in_progress: string;
  delete_success_toast: string;
  delete_error_toast: string;
  payment_history_count_label: string;
  tickets_count_label: string;

  // Payment Recording Modal
  record_payment_modal_title: string;
  record_payment_modal_sub: string;
  select_subscriber: string;
  base_fee_label: string;
  base_fee_desc: string;
  base_fee_default_badge: string;
  update_permanent_rate_label: string;
  extra_fees_label: string;
  extra_fees_toggle: string;
  extra_fees_desc: string;
  extra_amount_label: string;
  extra_reason_label: string;
  payment_method_label: string;
  payment_method_cash: string;
  payment_method_bank: string;
  payment_method_check: string;
  payment_method_card: string;
  payment_date_label: string;
  extend_period_label: string;
  days_count_label: string;
  notes_label: string;
  notes_placeholder: string;
  new_due_date_preview_label: string;
  confirm_record_payment_btn: string;
  total_to_collect: string;

  // Client Detail Modal
  tab_general: string;
  tab_hardware: string;
  tab_history: string;
  edit_rate_btn: string;
  custom_rate_badge: string;
  rate_updated_success_msg: string;
  view_slip_btn: string;
  archive_client_btn: string;
  delete_client_btn: string;
  call_client: string;
  open_maps: string;

  // Monthly Reconciliation & Ledger
  reconciliation_title: string;
  financial_month_label: string;
  future_month_badge: string;
  current_active_month: string;
  past_archive_badge: string;
  reconciliation_future_desc: string;
  reconciliation_active_desc: string;
  total_advance_collected: string;
  total_month_collected: string;
  total_paid_subs: string;
  projected_revenue_label: string;
  unpaid_due_label: string;
  collection_rate_label: string;
  advance_coverage_label: string;
  filter_all_subs: string;
  filter_advance_paid: string;
  filter_paid: string;
  filter_due_renewal: string;
  filter_unpaid: string;
  send_advance_reminder: string;
  send_whatsapp_reminder: string;
  record_advance_payment: string;
  payment_slip: string;
  export_bilan_csv_btn: string;

  // Technician & Field Additions
  assigned_tasks_badge: string;
  offline_mode_banner: string;
  saved_locally: string;
  quick_notes_label: string;
  resolution_placeholder: string;
  preset_note_rj45: string;
  preset_note_poe: string;
  preset_note_realign: string;
  preset_note_cable: string;
  preset_note_pppoe: string;
  field_intervention_in_progress: string;

  // Payment Modal Additions
  record_payment_subtitle: string;
  target_billing_month: string;
  advance_payment_badge: string;
  monthly_reconciliation_badge: string;
  no_subscribers_title: string;
  no_subscribers_desc: string;
  base_fee_title: string;
  base_fee_hint: string;
  update_permanent_rate_checkbox: string;
  extra_fees_title: string;
  extra_fees_subtitle: string;
  btn_remove: string;
  btn_add_extra: string;
  itemized_calculation_title: string;
  auto_calculated_badge: string;
  base_subscription_item: string;
  extra_charges_item: string;
  total_due_collect: string;
  current_due_label: string;
  new_renewal_preview: string;
  payment_channel_label: string;
  method_cash_name: string;
  method_cash_sub: string;
  method_cih_name: string;
  method_cih_sub: string;
  method_bank_name: string;
  method_bank_sub: string;
  method_agency_name: string;
  method_agency_sub: string;
  confirm_payment_btn_text: string;
  custom_extra_placeholder: string;
  preset_fee_late: string;
  preset_fee_prorated: string;
  preset_fee_hardware: string;
  preset_fee_boost: string;
  preset_fee_maintenance: string;
  preset_fee_custom: string;

  // Client Details Modal Additions
  plan_and_rate_title: string;
  billing_due_date_title: string;
  installation_date_title: string;
  last_paid_label: string;
  days_overdue_text: string;
  due_in_days_text: string;
  archived_account_badge: string;
  wireless_link_title: string;
  signal_quality_label: string;
  connected_sector_label: string;
  cpe_ip_label: string;
  indoor_router_title: string;
  indoor_router_model: string;
  customer_wifi_ssid: string;
  pppoe_username_label: string;
  pppoe_password_label: string;
  technician_notes_title: string;
  payment_ledger_title: string;
  payment_ledger_sub: string;
  no_past_payments: string;
  account_lifecycle_title: string;
  account_lifecycle_desc: string;
  archived_subscriber_pill: string;
  archived_subscriber_notice: string;
  archive_confirm_title: string;
  archive_confirm_msg: string;
  archive_confirm_btn: string;
  delete_confirm_title: string;
  delete_confirm_permanent_warning: string;
  delete_confirm_action_btn: string;
  create_trouble_ticket_btn: string;
  signal_excellent: string;
  signal_good: string;
  signal_marginal: string;
  signal_poor: string;

  // Navbar & Navigation Additions
  nav_operations_noc: string;
  nav_theme_preferences: string;
  nav_quick_demo_switch: string;
  nav_main_navigation: string;
  nav_display_language: string;
  nav_manage_team_rbac: string;
  nav_add_techs_roles: string;
  nav_backup_export: string;
  nav_backup_desc: string;
  nav_payments_invoices: string;
  nav_portal_noc: string;
  nav_field_mode: string;
  nav_active_session: string;

  // Automated Month Rollover & Simulation
  sim_bar_title: string;
  sim_active_badge: string;
  sim_exit_btn: string;
  sim_next_month_1st: string;
  sim_next_month_15th: string;
  sim_today_real: string;
  sim_custom_date: string;
  sim_banner_desc: string;
  remind_all_unpaid_btn: string;
  bulk_remind_modal_title: string;
  bulk_remind_modal_sub: string;
  bulk_copy_report_btn: string;
  bulk_copied_toast: string;
  bulk_open_wa_btn: string;
  bulk_sent_badge: string;
  expected_monthly_label: string;
  arrears_real_time_label: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    lang_en: 'EN',
    lang_fr: 'FR',
    lang_ar: 'عربي',
    back: 'Back',
    back_to_noc: 'Return to Admin NOC',
    cancel: 'Cancel',
    save: 'Save',
    confirm: 'Confirm',
    close: 'Close',
    actions: 'Actions',
    status: 'Status',
    search: 'Search',
    all: 'All',
    currency: 'DH',
    admin: 'ADMIN',
    field_tech: 'FIELD TECH',
    technician: 'Field Technician',
    mobile: 'Mobile',
    live: 'Live Real-Time',

    // Table Columns
    col_subscriber_location: 'Subscriber & Location',
    col_neighborhood: 'Neighborhood',
    col_monthly_fee: 'Monthly Fee',
    col_status: 'Status',
    col_cpe_antenna: 'Antenna / CPE',
    col_pppoe_router: 'PPPoE Account & Router',
    col_cpe_pppoe: 'CPE & PPPoE',
    col_neighborhood_address: 'Neighborhood & Address',
    col_monthly_due: 'Monthly Due',

    // Status Badges
    status_active: 'Active / Paid',
    status_due_soon: 'Due Soon',
    status_overdue: 'Overdue',
    status_suspended: 'Suspended',
    status_archived: 'Archived',

    // Action Buttons
    action_record_payment: 'Record Payment',
    action_new_installation: 'New Installation',
    action_edit: 'Edit',
    action_delete: 'Delete',
    action_send_whatsapp: 'Send WhatsApp Reminder',
    action_open_ticket: 'Open Maintenance Ticket',

    // Search & Filters
    dir_search_placeholder: 'Search by Name, Phone, MAC, or PPPoE...',
    filter_all_neighborhoods: 'All Neighborhoods',
    urgent_badge_accounts: 'Urgent Accounts',

    // Ticket & Field Management Terms
    ticket_status_open: 'Open',
    ticket_status_in_progress: 'In Progress',
    ticket_status_resolved: 'Resolved',

    // FieldTech
    fieldtech_title: 'Youness WiFi FieldTech',
    fieldtech_subtitle: 'Fast Field Dispatch & Diagnostics',
    role_rooftop: 'Rooftop Mounts & Router Configuration',
    role_antenna: 'Antenna Alignment & RF Diagnostics',
    pending: 'Pending',
    done_today: 'Done Today',
    tab_active_tasks: 'Active Field Tasks',
    tab_resolved: 'Resolved',
    empty_tasks_title: 'No Tasks In This Queue',
    empty_tasks_msg: 'Great job {name}! All assigned field tickets are resolved.',
    empty_resolved_msg: 'No resolved tickets logged today yet.',
    call: 'Call',
    directions: 'Google Maps',
    mark_resolved: 'Mark Resolved',
    reopen_task: 'Reopen Task',
    start_task: 'Start Intervention',
    telemetry_title: 'Hardware Telemetry & Credentials',
    antenna_model: 'Antenna / CPE',
    antenna_mac: 'Antenna MAC',
    pppoe_account: 'PPPoE Account',
    wifi_ssid: 'Wi-Fi SSID',
    resolution_modal_title: 'Confirm Ticket Resolution',
    resolution_modal_sub: 'Log field action details before closing ticket',
    resolution_action_label: 'Action taken on site',
    resolution_default_note: 'Issue resolved on site. Cabling, RF signal, and speeds verified.',
    completed_action: 'Completed Action:',
    client_contact: 'Subscriber & Location',

    // Categories & Priorities
    cat_no_internet: 'Total Outage (No Net)',
    cat_weak_signal: 'Weak Signal / Slow Link',
    cat_power_adapter: 'PoE / Power Supply Burned',
    cat_new_installation: 'New Subscriber Installation',
    cat_router_config: 'Router / PPPoE Config',
    prio_urgent: 'URGENT',
    prio_high: 'High',
    prio_normal: 'Normal',

    // Admin NOC & Navbar
    nav_brand: 'Youness WiFi',
    nav_dashboard: "Overview",
    nav_clients: "Subscribers",
    nav_tickets: "Field work",
    nav_team: "Team",
    nav_fieldtech: "Field workspace",
    nav_reset_demo: 'Reset Mock Seed Data',
    nav_sign_out: 'Sign Out',
    reset_modal_title: 'Reset Workspace & Wipe Mock Data?',
    reset_modal_desc: 'This will clear all clients, tickets, and payment records from localStorage and reset the workspace to a clean, empty state.',
    reset_modal_confirm: 'Yes, Wipe & Reset',

    // Dashboard NOC
    dash_title: "Your network at a glance",
    dash_subtitle: "Keep track of your subscribers, payments, and field work in Tétouan.",
    dash_record_payment: "Record payment",
    dash_new_installation: "New subscriber",
    dash_new_ticket: "Create ticket",
    metric_active_subs: "Active subscribers",
    metric_monthly_revenue: "Collected this month",
    metric_today_revenue: "Today's Revenue",
    metric_overdue_uncollected: "Outstanding balance",
    metric_open_tickets: "Open tickets",
    connected_label: 'connected',
    overdue_label: 'overdue',
    urgent_center_title: "Needs attention",
    urgent_center_subtitle: "Subscriptions that are overdue or due within 3 days.",
    all_accounts_up_to_date: 'All Accounts Are Up to Date!',
    all_accounts_up_to_date_sub: 'No clients are overdue or due within the next 3 days.',
    no_subscribers_registered: 'No subscribers registered yet',
    no_subscribers_registered_sub: 'Your subscriber database is currently empty. Register a customer in Tétouan to track billing status.',
    register_first_client: 'Register First Client',
    recent_payments_title: "Recent payments",
    recent_payments_subtitle: 'Verified collection transactions & 30-day renewals',
    no_payments_found: 'No payment records found',
    no_payments_found_sub: 'Payments recorded in the system or on the field will appear here.',
    infrastructure_title: 'WISP Infrastructure (Tétouan)',
    infrastructure_subtitle: 'Tower relay stations & sector health',
    bandwidth_consumption: 'Bandwidth Consumption',

    // Client Directory
    dir_title: "Your subscribers",
    dir_subtitle: "Find every subscriber and their network setup.",
    no_clients_found: 'No Subscribers Registered',
    no_clients_match_filters: 'No subscribers match the current filters.',

    // Tickets
    tickets_title: "Field work",
    tickets_subtitle: "Organize requests and coordinate your field team.",
    create_ticket_btn: 'Create Incident Ticket',
    all_clear_title: 'All Clear — Zero Active Incident Tickets',
    all_clear_subtitle: 'There are currently no open support requests or repair dispatches in Tétouan.',
    no_tickets_found: 'No support tickets found',
    col_open: 'Open & Dispatched',
    col_in_progress: 'In Progress (Field Tech)',
    col_resolved: 'Resolved & Verified',

    // Delete & Edit Modals
    delete_modal_title: 'Permanently Delete Subscriber',
    delete_modal_sub: 'Irreversible action • Automatic cascade cleanup',
    delete_modal_confirm_msg: 'Are you sure you want to permanently delete subscriber {name}? This action will also delete all associated payment records and tickets.',
    delete_modal_cascade_warning: 'According to the ON DELETE CASCADE rule, all associated data in Supabase will be immediately and permanently removed.',
    delete_confirm_btn: 'Permanently Delete',
    deleting_in_progress: 'Deleting in progress...',
    delete_success_toast: 'Subscriber "{name}" and associated records were deleted successfully.',
    delete_error_toast: 'Error while deleting subscriber "{name}".',
    payment_history_count_label: 'Payment history:',
    tickets_count_label: 'Support tickets:',

    // Payment Recording Modal
    record_payment_modal_title: 'Record Monthly Payment & Invoice',
    record_payment_modal_sub: 'Flexible base subscription, extra fees & itemized calculation',
    select_subscriber: 'Select Subscriber',
    base_fee_label: 'Base Monthly Subscription Fee',
    base_fee_desc: 'Adjust or override the monthly fee for special bandwidth agreements',
    base_fee_default_badge: 'Default: 100 MAD',
    update_permanent_rate_label: 'Update subscriber permanent monthly rate to {amount} MAD for future months',
    extra_fees_label: 'Extra Fees & Adjustments',
    extra_fees_toggle: 'Add extra charges (cable, intervention, late fee...)',
    extra_fees_desc: 'Itemize additional hardware or service charges on the invoice',
    extra_amount_label: 'Extra Fee Amount',
    extra_reason_label: 'Extra Fee Reason',
    payment_method_label: 'Payment Method',
    payment_method_cash: 'Cash',
    payment_method_bank: 'Bank Transfer (CIH / Attijari)',
    payment_method_check: 'Check',
    payment_method_card: 'Credit Card',
    payment_date_label: 'Payment Date',
    extend_period_label: 'Extend Validity By',
    days_count_label: '{days} days (1 month)',
    notes_label: 'Notes or Comments',
    notes_placeholder: 'Optional payment notes...',
    new_due_date_preview_label: 'New calculated due date:',
    confirm_record_payment_btn: 'Confirm & Generate Receipt Slip',
    total_to_collect: 'Total to Collect:',

    // Client Detail Modal
    tab_general: 'General',
    tab_hardware: 'Hardware & Network',
    tab_history: 'Payment History',
    edit_rate_btn: 'Edit Rate',
    custom_rate_badge: 'Custom Rate',
    rate_updated_success_msg: 'Rate updated successfully',
    view_slip_btn: 'Receipt Slip',
    archive_client_btn: 'Archive Subscriber',
    delete_client_btn: 'Delete Subscriber',
    call_client: 'Call',
    open_maps: 'Google Maps',

    // Monthly Reconciliation & Ledger
    reconciliation_title: "Monthly payments",
    financial_month_label: 'Financial Month:',
    future_month_badge: 'Future Month • Advance Payments',
    current_active_month: 'Current Active Month',
    past_archive_badge: 'Past Archive',
    reconciliation_future_desc: 'Track advance payments, projected revenue, and renewals due early',
    reconciliation_active_desc: 'Monthly ledger, uncollected dues tracking, and automatic reconciliation',
    total_advance_collected: 'Total Advance Payments (Avances)',
    total_month_collected: 'Total Collected This Month',
    total_paid_subs: 'Total Paid Subscriptions',
    projected_revenue_label: 'Projected Revenue to Collect',
    unpaid_due_label: 'Pending / Uncollected',
    collection_rate_label: 'Collection Rate',
    advance_coverage_label: 'Advance Coverage Rate',
    filter_all_subs: 'All Subscriptions',
    filter_advance_paid: 'Paid in Advance',
    filter_paid: 'Paid',
    filter_due_renewal: 'Due for Renewal',
    filter_unpaid: 'Unpaid',
    send_advance_reminder: 'Advance Reminder',
    send_whatsapp_reminder: 'WhatsApp Reminder',
    record_advance_payment: 'Advance Payment',
    payment_slip: 'Receipt Slip',
    export_bilan_csv_btn: 'Export Ledger (CSV)',

    // Technician & Field Additions
    assigned_tasks_badge: 'Assigned Field Tasks',
    offline_mode_banner: 'Offline Mode (Cellular 4G unavailable)',
    saved_locally: 'Saved locally',
    quick_notes_label: 'Quick 1-Tap Notes:',
    resolution_placeholder: 'Ex: Replaced RJ45 connector, reset PoE adapter, signal -61 dBm...',
    preset_note_rj45: 'Replaced RJ45 connector',
    preset_note_poe: 'Reset POE adapter',
    preset_note_realign: 'Re-aligned antenna (-61 dBm)',
    preset_note_cable: 'New Cat6 cable drop',
    preset_note_pppoe: 'Reconfigured PPPoE',
    field_intervention_in_progress: 'On-site field intervention in progress.',

    // Payment Modal Additions
    record_payment_subtitle: 'Flexible base subscription, extra fees & itemized calculation',
    target_billing_month: 'Target billing month:',
    advance_payment_badge: '✨ Advance Payment',
    monthly_reconciliation_badge: 'Monthly Settlement',
    no_subscribers_title: 'No Subscribers Registered',
    no_subscribers_desc: 'You must register at least one client before logging a payment transaction.',
    base_fee_title: 'Base Monthly Subscription Fee',
    base_fee_hint: 'Adjust or override the monthly fee for special bandwidth agreements',
    update_permanent_rate_checkbox: 'Update subscriber permanent monthly rate to {amount} MAD for future months',
    extra_fees_title: 'Extra Charges / Adjustments (Frais Supplémentaires)',
    extra_fees_subtitle: 'Late payment fees, equipment replacement, speed boost, or prorated days',
    btn_remove: 'Remove',
    btn_add_extra: 'Add Extra Fee',
    itemized_calculation_title: 'Itemized Invoice Calculation',
    auto_calculated_badge: 'Auto-Calculated',
    base_subscription_item: 'Base Monthly Subscription:',
    extra_charges_item: 'Extra Charges:',
    total_due_collect: 'Total Amount Due / To Collect',
    current_due_label: 'Current Due:',
    new_renewal_preview: 'New Renewal Date (+{days}d):',
    payment_channel_label: 'Payment Channel',
    method_cash_name: 'Cash (Espèces)',
    method_cash_sub: 'Hand to hand',
    method_cih_name: 'CIH Mobile',
    method_cih_sub: 'Instant transfer',
    method_bank_name: 'Bank Transfer',
    method_bank_sub: 'Attijari / BMCE',
    method_agency_name: 'Wafacash / CashPlus',
    method_agency_sub: 'Transfer agency',
    confirm_payment_btn_text: 'Confirm Payment ({amount} MAD)',
    custom_extra_placeholder: 'Specify custom reason (e.g., Installation 2nd access point)...',
    preset_fee_late: 'Late payment fee',
    preset_fee_prorated: 'Extra days prorated',
    preset_fee_hardware: 'Replacement cable / adapter',
    preset_fee_boost: 'Temporary speed boost',
    preset_fee_maintenance: 'Technical maintenance',
    preset_fee_custom: 'Custom adjustment',

    // Client Details Modal Additions
    plan_and_rate_title: 'Plan & Monthly Rate',
    billing_due_date_title: 'Billing Due Date',
    installation_date_title: 'Installation Date',
    last_paid_label: 'Last Paid:',
    days_overdue_text: '{days} days overdue',
    due_in_days_text: 'Due in {days} days',
    archived_account_badge: 'Archived Account (Excluded from dues)',
    wireless_link_title: 'Wireless Link & CPE Hardware',
    signal_quality_label: 'Signal Quality Level',
    connected_sector_label: 'Connected Sector / Tower AP',
    cpe_ip_label: 'CPE Management IP',
    indoor_router_title: 'Indoor Router & PPPoE Authentication',
    indoor_router_model: 'Indoor Router Model',
    customer_wifi_ssid: 'Customer Wi-Fi SSID',
    pppoe_username_label: 'PPPoE Username',
    pppoe_password_label: 'PPPoE Password',
    technician_notes_title: 'Technician Notes:',
    payment_ledger_title: 'Payment Ledger History ({count})',
    payment_ledger_sub: 'Itemized invoices & receipts',
    no_past_payments: 'No past payment logs on record.',
    account_lifecycle_title: 'Subscriber Lifecycle & Account Operations',
    account_lifecycle_desc: 'You can archive the subscriber to freeze recurring charges and exclude them from overdue lists, or permanently delete their record.',
    archived_subscriber_pill: 'Archived Subscriber',
    archived_subscriber_notice: 'Subscriber currently in archive (exempt from overdue debts)',
    archive_confirm_title: 'Confirm Subscriber Archiving',
    archive_confirm_msg: 'Are you sure you want to archive subscriber {name}? Recurring fees will be halted, and they will be removed from the urgent center while keeping their ledger.',
    archive_confirm_btn: 'Confirm Archiving',
    delete_confirm_title: 'Warning: Permanently Delete Subscriber',
    delete_confirm_permanent_warning: '⚠️ This action cannot be undone and will erase all data associated with this client.',
    delete_confirm_action_btn: 'Yes, Delete Permanently',
    create_trouble_ticket_btn: 'Open Ticket',
    signal_excellent: 'Excellent',
    signal_good: 'Good / Stable',
    signal_marginal: 'Marginal',
    signal_poor: 'Poor / Misaligned',

    // Navbar & Navigation Additions
    nav_operations_noc: 'Network & NOC Operations',
    nav_theme_preferences: 'Theme & Preferences',
    nav_quick_demo_switch: 'Quick Switch (Demo)',
    nav_main_navigation: 'Main Navigation',
    nav_display_language: 'Display Language',
    nav_manage_team_rbac: 'Manage Team & RBAC',
    nav_add_techs_roles: 'Add technicians & roles',
    nav_backup_export: 'Export Backup (JSON)',
    nav_backup_desc: 'Save database backup file',
    nav_payments_invoices: 'Payments & Receipts',
    nav_portal_noc: 'NOC Portal',
    nav_field_mode: 'Field Mode',
    nav_active_session: 'Active Session',

    // Automated Month Rollover & Simulation
    sim_bar_title: 'Temporal Simulation Mode (Dev & Audit)',
    sim_active_badge: 'Simulation Active',
    sim_exit_btn: 'Exit Simulation',
    sim_next_month_1st: '1st of Next Month',
    sim_next_month_15th: '15th of Next Month',
    sim_today_real: 'Real Today',
    sim_custom_date: 'Custom Date',
    sim_banner_desc: 'Simulating new month rollover. KPIs reset dynamically, overdue accounts update automatically.',
    remind_all_unpaid_btn: 'Remind All Unpaid',
    bulk_remind_modal_title: 'Bulk WhatsApp Reminders',
    bulk_remind_modal_sub: 'Direct payment reminder messages for all uncollected subscribers',
    bulk_copy_report_btn: 'Copy Full Summary Report',
    bulk_copied_toast: 'Report copied to clipboard',
    bulk_open_wa_btn: 'Open WhatsApp',
    bulk_sent_badge: 'Sent',
    expected_monthly_label: 'Expected Revenue',
    arrears_real_time_label: 'Real-Time Arrears',
  },

  fr: {
    lang_en: 'EN',
    lang_fr: 'FR',
    lang_ar: 'عربي',
    back: 'Retour',
    back_to_noc: 'Retourner au NOC Administrateur',
    cancel: 'Annuler',
    save: 'Enregistrer',
    confirm: 'Confirmer',
    close: 'Fermer',
    actions: 'Actions',
    status: 'Statut',
    search: 'Rechercher',
    all: 'Tous',
    currency: 'DH',
    admin: 'ADMIN',
    field_tech: 'TECH TERRAIN',
    technician: 'Technicien de maintenance',
    mobile: 'Mobile',
    live: 'Temps Réel Direct',

    // Table Columns
    col_subscriber_location: 'Abonné & Emplacement',
    col_neighborhood: 'Quartier',
    col_monthly_fee: 'Abonnement Mensuel',
    col_status: 'Statut',
    col_cpe_antenna: 'Antenne / CPE',
    col_pppoe_router: 'Compte PPPoE & Routeur',
    col_cpe_pppoe: 'CPE & PPPoE',
    col_neighborhood_address: 'Quartier & Adresse',
    col_monthly_due: 'Mensualité Due',

    // Status Badges
    status_active: 'Actif / À jour',
    status_due_soon: 'Échéance Proche',
    status_overdue: 'En Retard de Paiement',
    status_suspended: 'Suspendu',
    status_archived: 'Archivé',

    // Action Buttons
    action_record_payment: 'Encaisser Mensualité',
    action_new_installation: 'Nouvelle Installation',
    action_edit: 'Modifier',
    action_delete: 'Supprimer',
    action_send_whatsapp: 'Envoyer Rappel WhatsApp',
    action_open_ticket: "Créer Ticket d'Incident",

    // Search & Filters
    dir_search_placeholder: 'Rechercher par nom, téléphone, MAC ou PPPoE...',
    filter_all_neighborhoods: 'Tous les quartiers',
    urgent_badge_accounts: 'Comptes Urgents',

    // Ticket & Field Management Terms
    ticket_status_open: 'Ouvert',
    ticket_status_in_progress: 'En Cours',
    ticket_status_resolved: 'Résolu',

    // FieldTech
    fieldtech_title: 'Youness WiFi FieldTech',
    fieldtech_subtitle: 'Interventions Rapides & Diagnostics',
    role_rooftop: 'Installations Toiture & Configuration Routeur',
    role_antenna: 'Alignement Antenne & Diagnostics RF',
    pending: 'En attente',
    done_today: "Terminées aujourd'hui",
    tab_active_tasks: 'Tâches En Cours',
    tab_resolved: 'Résolues',
    empty_tasks_title: 'Aucune tâche dans cette file',
    empty_tasks_msg: 'Bravo {name} ! Tous les tickets assignés sont résolus.',
    empty_resolved_msg: "Aucun ticket résolu enregistré aujourd'hui.",
    call: 'Appeler',
    directions: 'Google Maps',
    mark_resolved: 'Marquer comme résolu',
    reopen_task: 'Rouvrir la tâche',
    start_task: 'Démarrer intervention',
    telemetry_title: 'Télémétrie Matériel & Identifiants',
    antenna_model: 'Antenne / CPE',
    antenna_mac: 'MAC Antenne',
    pppoe_account: 'Compte PPPoE',
    wifi_ssid: 'SSID Wi-Fi',
    resolution_modal_title: 'Confirmer la Résolution du Ticket',
    resolution_modal_sub: 'Enregistrer le compte-rendu technique avant clôture',
    resolution_action_label: 'Action effectuée sur place',
    resolution_default_note: 'Problème résolu sur place. Câblage et signal radio vérifiés.',
    completed_action: 'Action effectuée :',
    client_contact: 'Abonné & Emplacement',

    // Categories & Priorities
    cat_no_internet: 'Coupure Totale (No Net)',
    cat_weak_signal: 'Signal Faible / Lenteur',
    cat_power_adapter: 'PoE / Alimentation Grillée',
    cat_new_installation: 'Nouvelle Installation Client',
    cat_router_config: 'Routeur Wi-Fi / Config PPPoE',
    prio_urgent: 'URGENT',
    prio_high: 'Élevé',
    prio_normal: 'Normal',

    // Admin NOC & Navbar
    nav_brand: 'Youness WiFi',
    nav_dashboard: "Vue d’ensemble",
    nav_clients: "Abonnés",
    nav_tickets: "Interventions",
    nav_team: "Équipe",
    nav_fieldtech: "Espace terrain",
    nav_reset_demo: 'Réinitialiser les données démo',
    nav_sign_out: 'Déconnexion',
    reset_modal_title: 'Réinitialiser le système & vider les données ?',
    reset_modal_desc: 'Cette action efface tous les abonnés, tickets et journaux de paiement du stockage local pour repartir sur une base propre.',
    reset_modal_confirm: 'Oui, tout réinitialiser',

    // Dashboard NOC
    dash_title: "Votre réseau, en un coup d’œil",
    dash_subtitle: "Suivez vos abonnés, encaissements et interventions à Tétouan.",
    dash_record_payment: "Encaisser",
    dash_new_installation: "Nouvel abonné",
    dash_new_ticket: "Créer un ticket",
    metric_active_subs: "Abonnés actifs",
    metric_monthly_revenue: "Encaissements du mois",
    metric_today_revenue: 'Recettes du Jour',
    metric_overdue_uncollected: "Impayés",
    metric_open_tickets: "Tickets ouverts",
    connected_label: 'connectés',
    overdue_label: 'en retard',
    urgent_center_title: "À traiter",
    urgent_center_subtitle: "Abonnements en retard ou à échéance sous 3 jours.",
    all_accounts_up_to_date: 'Tous les comptes sont à jour !',
    all_accounts_up_to_date_sub: 'Aucun abonné en retard ou arrivant à échéance sous 3 jours.',
    no_subscribers_registered: 'Aucun abonné enregistré pour le moment',
    no_subscribers_registered_sub: 'Votre base de données est propre et vide. Enregistrez votre premier client à Tétouan pour commencer le suivi.',
    register_first_client: 'Enregistrer Premier Client',
    recent_payments_title: "Derniers encaissements",
    recent_payments_subtitle: 'Paiements validés & renouvellements 30 jours',
    no_payments_found: 'Aucun reçu de paiement enregistré',
    no_payments_found_sub: 'Les paiements enregistrés au bureau ou sur le terrain apparaîtront ici.',
    infrastructure_title: 'Infrastructure WISP (Tétouan)',
    infrastructure_subtitle: 'Stations relais pylônes & santé des secteurs',
    bandwidth_consumption: 'Consommation Bande Passante',

    // Client Directory
    dir_title: "Vos abonnés",
    dir_subtitle: "Retrouvez chaque abonné et sa configuration réseau.",
    no_clients_found: 'Aucun Abonné Enregistré',
    no_clients_match_filters: 'Aucun abonné ne correspond aux filtres sélectionnés.',

    // Tickets
    tickets_title: "Interventions",
    tickets_subtitle: "Organisez les demandes et coordonnez votre équipe terrain.",
    create_ticket_btn: 'Créer un Ticket Incident',
    all_clear_title: 'Rien à Signaler — Aucun Ticket d’Incident Actif',
    all_clear_subtitle: 'Aucune demande d’intervention ou panne actuellement signalée à Tétouan.',
    no_tickets_found: 'Aucun ticket de support trouvé',
    col_open: 'Ouverts & Assignés',
    col_in_progress: 'En Cours (Terrain)',
    col_resolved: 'Résolus & Validés',

    // Delete & Edit Modals
    delete_modal_title: "Supprimer définitivement l'abonné",
    delete_modal_sub: 'Action irréversible • Nettoyage automatique en cascade',
    delete_modal_confirm_msg: "Êtes-vous sûr de vouloir supprimer définitivement l'abonné {name} ? Cette action supprimera également son historique de paiements et ses tickets associés.",
    delete_modal_cascade_warning: 'Conformément à la règle ON DELETE CASCADE, toutes les données associées dans Supabase seront immédiatement et définitivement effacées.',
    delete_confirm_btn: 'Supprimer définitivement',
    deleting_in_progress: 'Suppression en cours...',
    delete_success_toast: 'L\'abonné "{name}" et ses données associées ont été supprimés avec succès.',
    delete_error_toast: 'Erreur lors de la suppression de l\'abonné "{name}".',
    payment_history_count_label: 'Historique des paiements :',
    tickets_count_label: 'Tickets d\'intervention :',

    // Payment Recording Modal
    record_payment_modal_title: 'Enregistrer Paiement & Reçu',
    record_payment_modal_sub: 'Forfait mensuel flexible, frais annexes et calcul détaillé',
    select_subscriber: 'Sélectionner un abonné',
    base_fee_label: 'Tarif mensuel de base',
    base_fee_desc: 'Ajuster ou modifier le montant pour des débits spécifiques',
    base_fee_default_badge: 'Par défaut : 100 MAD',
    update_permanent_rate_label: 'Mettre à jour le tarif permanent de l\'abonné à {amount} MAD pour les prochains mois',
    extra_fees_label: 'Frais supplémentaires & ajustements',
    extra_fees_toggle: 'Ajouter des frais supplémentaires (câble, intervention, retard...)',
    extra_fees_desc: 'Détailler les coûts additionnels sur le reçu de paiement',
    extra_amount_label: 'Montant des frais supplémentaires',
    extra_reason_label: 'Motif des frais supplémentaires',
    payment_method_label: 'Moyen de paiement',
    payment_method_cash: 'Espèces',
    payment_method_bank: 'Virement bancaire (CIH / Attijari)',
    payment_method_check: 'Chèque',
    payment_method_card: 'Carte bancaire',
    payment_date_label: 'Date de paiement',
    extend_period_label: 'Prolonger l\'abonnement de',
    days_count_label: '{days} jours (1 mois)',
    notes_label: 'Notes ou remarques',
    notes_placeholder: 'Remarques facultatives...',
    new_due_date_preview_label: 'Nouvelle date d\'échéance calculée :',
    confirm_record_payment_btn: 'Valider l\'encaissement & Générer le reçu',
    total_to_collect: 'Total à encaisser :',

    // Client Detail Modal
    tab_general: 'Général',
    tab_hardware: 'Matériel & Réseau',
    tab_history: 'Historique des paiements',
    edit_rate_btn: 'Modifier le tarif',
    custom_rate_badge: 'Tarif personnalisé',
    rate_updated_success_msg: 'Tarif mis à jour avec succès',
    view_slip_btn: 'Voir le reçu',
    archive_client_btn: 'Archiver l\'abonné',
    delete_client_btn: 'Supprimer l\'abonné',
    call_client: 'Appeler',
    open_maps: 'Google Maps',

    // Monthly Reconciliation & Ledger
    reconciliation_title: "Suivi mensuel",
    financial_month_label: 'Mois Financier :',
    future_month_badge: 'Mois Futur • Paiements d’avance',
    current_active_month: 'Mois Actif en Cours',
    past_archive_badge: 'Archive Passée',
    reconciliation_future_desc: 'Suivi des paiements d’avance, revenus prévisionnels et renouvellements anticipés',
    reconciliation_active_desc: 'Grand livre mensuel, suivi des impayés et rapprochement automatisé',
    total_advance_collected: 'Total Avances Encaissées',
    total_month_collected: 'Total Encaissé du Mois',
    total_paid_subs: 'Total Abonnements Réglés',
    projected_revenue_label: 'Revenu Projeté à Encaisser',
    unpaid_due_label: 'Impayés / En Attente',
    collection_rate_label: 'Taux de Recouvrement',
    advance_coverage_label: 'Taux de Couverture Anticipée',
    filter_all_subs: 'Tous les Abonnements',
    filter_advance_paid: 'Payés d’avance',
    filter_paid: 'Payés',
    filter_due_renewal: 'À Renouveler',
    filter_unpaid: 'Impayés',
    send_advance_reminder: 'Rappel Anticipé',
    send_whatsapp_reminder: 'Rappel WhatsApp',
    record_advance_payment: 'Règlement d’Avance',
    payment_slip: 'Reçu de Paiement',
    export_bilan_csv_btn: 'Exporter le Bilan (CSV)',

    // Technician & Field Additions
    assigned_tasks_badge: 'Interventions Assignées',
    offline_mode_banner: 'Mode hors ligne (Réseau 4G indisponible)',
    saved_locally: 'Enregistré en local',
    quick_notes_label: 'Notes rapides 1-clic :',
    resolution_placeholder: 'Ex: Remplacement connecteur RJ45, redémarrage PoE, signal -61 dBm...',
    preset_note_rj45: 'Remplacement connecteur RJ45',
    preset_note_poe: 'Réinitialisation adaptateur PoE',
    preset_note_realign: 'Réalignement antenne (-61 dBm)',
    preset_note_cable: 'Pose nouveau câble Cat6',
    preset_note_pppoe: 'Reconfiguration PPPoE',
    field_intervention_in_progress: 'Intervention sur place en cours.',

    // Payment Modal Additions
    record_payment_subtitle: 'Forfait mensuel flexible, frais annexes et calcul détaillé',
    target_billing_month: 'Mois de facturation ciblé :',
    advance_payment_badge: '✨ Paiement d\'avance (Avance)',
    monthly_reconciliation_badge: 'Régularisation mensuelle',
    no_subscribers_title: 'Aucun abonné enregistré',
    no_subscribers_desc: 'Vous devez enregistrer au moins un client avant de saisir un paiement.',
    base_fee_title: 'Tarif mensuel de base',
    base_fee_hint: 'Ajuster ou modifier le montant pour des débits spécifiques',
    update_permanent_rate_checkbox: 'Mettre à jour le tarif permanent de l\'abonné à {amount} MAD pour les prochains mois',
    extra_fees_title: 'Frais Supplémentaires / Ajustements',
    extra_fees_subtitle: 'Frais de retard, remplacement matériel, boost de débit ou jours prorata',
    btn_remove: 'Supprimer',
    btn_add_extra: 'Ajouter Frais',
    itemized_calculation_title: 'Calcul Détaillé de Facturation',
    auto_calculated_badge: 'Calcul automatique',
    base_subscription_item: 'Abonnement Mensuel de Base :',
    extra_charges_item: 'Frais Supplémentaires :',
    total_due_collect: 'Montant Total Dû / À Encaisser',
    current_due_label: 'Échéance actuelle :',
    new_renewal_preview: 'Nouvelle date d\'échéance (+{days}j) :',
    payment_channel_label: 'Canal de Paiement',
    method_cash_name: 'Espèces (Cash)',
    method_cash_sub: 'Remise en main propre',
    method_cih_name: 'CIH Mobile',
    method_cih_sub: 'Virement instantané',
    method_bank_name: 'Virement Bancaire',
    method_bank_sub: 'Attijari / BMCE',
    method_agency_name: 'Wafacash / CashPlus',
    method_agency_sub: 'Agence de transfert',
    confirm_payment_btn_text: 'Confirmer l\'encaissement ({amount} MAD)',
    custom_extra_placeholder: 'Précisez le motif (ex: Installation 2ème point d\'accès)...',
    preset_fee_late: 'Frais de retard de paiement',
    preset_fee_prorated: 'Jours supplémentaires au prorata',
    preset_fee_hardware: 'Remplacement câble / adaptateur PoE',
    preset_fee_boost: 'Augmentation temporaire de débit',
    preset_fee_maintenance: 'Intervention technique / maintenance',
    preset_fee_custom: 'Ajustement personnalisé',

    // Client Details Modal Additions
    plan_and_rate_title: 'Forfait & Tarif Mensuel',
    billing_due_date_title: 'Date d\'Échéance',
    installation_date_title: 'Date d\'Installation',
    last_paid_label: 'Dernier règlement :',
    days_overdue_text: '{days} jours de retard',
    due_in_days_text: 'Échéance dans {days} jours',
    archived_account_badge: 'Compte archivé (Exclu des impayés)',
    wireless_link_title: 'Liaison Sans Fil & Matériel CPE',
    signal_quality_label: 'Qualité du Signal Radio',
    connected_sector_label: 'Secteur Relais Connecté',
    cpe_ip_label: 'IP de Gestion CPE',
    indoor_router_title: 'Routeur Intérieur & Authentification PPPoE',
    indoor_router_model: 'Modèle Routeur Intérieur',
    customer_wifi_ssid: 'SSID Wi-Fi Client',
    pppoe_username_label: 'Identifiant PPPoE',
    pppoe_password_label: 'Mot de passe PPPoE',
    technician_notes_title: 'Notes du Technicien :',
    payment_ledger_title: 'Historique des Règlements ({count})',
    payment_ledger_sub: 'Factures détaillées & reçus imprimables',
    no_past_payments: 'Aucun paiement antérieur enregistré.',
    account_lifecycle_title: 'Gestion du Compte & Cycle de Vie',
    account_lifecycle_desc: 'Vous pouvez archiver l\'abonné pour geler les impayés et l\'exclure des relances, ou le supprimer définitivement de la base de données.',
    archived_subscriber_pill: 'Abonné Archivé',
    archived_subscriber_notice: 'Abonné actuellement archivé (exempt d\'impayés)',
    archive_confirm_title: 'Confirmer l\'archivage de l\'abonné',
    archive_confirm_msg: 'Êtes-vous sûr de vouloir archiver l\'abonné {name} ? Les facturations récurrentes seront gelées et il sera retiré des impayés tout en conservant son historique.',
    archive_confirm_btn: 'Confirmer l\'Archivage',
    delete_confirm_title: 'Attention : Suppression définitive de l\'abonné',
    delete_confirm_permanent_warning: '⚠️ Cette action est irréversible et effacera définitivement toutes les données de ce client.',
    delete_confirm_action_btn: 'Oui, Supprimer Définitivement',
    create_trouble_ticket_btn: 'Créer Ticket d\'Incident',
    signal_excellent: 'Excellent',
    signal_good: 'Bon / Stable',
    signal_marginal: 'Moyen / Limite',
    signal_poor: 'Faible / Mal orienté',

    // Navbar & Navigation Additions
    nav_operations_noc: 'Opérations Réseau & NOC',
    nav_theme_preferences: 'Thème & Préférences',
    nav_quick_demo_switch: 'Bascule Rapide (Démo)',
    nav_main_navigation: 'Navigation Principale',
    nav_display_language: 'Langue d\'affichage',
    nav_manage_team_rbac: 'Gérer l\'Équipe & RBAC',
    nav_add_techs_roles: 'Ajouter techniciens & rôles',
    nav_backup_export: 'Sauvegarder la base de données (JSON)',
    nav_backup_desc: 'Sauvegarder la base de données',
    nav_payments_invoices: 'Paiements & Factures',
    nav_portal_noc: 'Portail NOC',
    nav_field_mode: 'Mode Terrain',
    nav_active_session: 'Session Active',

    // Automated Month Rollover & Simulation
    sim_bar_title: 'Mode Test & Simulation Temporelle (Dev & Audit)',
    sim_active_badge: 'Simulation Active',
    sim_exit_btn: 'Quitter la simulation',
    sim_next_month_1st: '1er du mois prochain',
    sim_next_month_15th: '15 du mois prochain',
    sim_today_real: "Aujourd'hui (Réel)",
    sim_custom_date: 'Date personnalisée',
    sim_banner_desc: 'Simulation du passage au nouveau mois : Recettes à 0.00 DH, comptes impayés basculés automatiquement.',
    remind_all_unpaid_btn: 'Relancer tous les impayés',
    bulk_remind_modal_title: 'Relance Groupée WhatsApp',
    bulk_remind_modal_sub: 'Messages de rappel de paiement pour tous les abonnés non réglés',
    bulk_copy_report_btn: 'Copier le rapport complet',
    bulk_copied_toast: 'Rapport copié dans le presse-papiers',
    bulk_open_wa_btn: 'Ouvrir WhatsApp',
    bulk_sent_badge: 'Envoyé',
    expected_monthly_label: 'Revenus prévus',
    arrears_real_time_label: 'Arriérés en temps réel',
  },

  ar: {
    lang_en: 'EN',
    lang_fr: 'FR',
    lang_ar: 'عربي',
    back: 'رجوع',
    back_to_noc: 'العودة إلى لوحة تحكم الإدارة NOC',
    cancel: 'إلغاء',
    save: 'حفظ',
    confirm: 'تأكيد',
    close: 'إغلاق',
    actions: 'الإجراءات',
    status: 'الحالة',
    search: 'بحث',
    all: 'الكل',
    currency: 'د.م.',
    admin: 'المسؤول',
    field_tech: 'تقني ميداني',
    technician: 'فني الصيانة',
    mobile: 'الجوال',
    live: 'مباشر وحي',

    // Table Columns (Exact terms requested by user)
    col_subscriber_location: 'المشترك والموقع',
    col_neighborhood: 'الحي',
    col_monthly_fee: 'الاشتراك الشهري',
    col_status: 'الحالة',
    col_cpe_antenna: 'اللاقط / CPE',
    col_pppoe_router: 'حساب PPPoE والروتر',
    col_cpe_pppoe: 'اللاقط و PPPoE',
    col_neighborhood_address: 'الحي والعنوان',
    col_monthly_due: 'الواجب الشهري',

    // Status Badges (Exact terms requested by user)
    status_active: 'نشط / مسوّى',
    status_due_soon: 'اقتراب الأجل',
    status_overdue: 'متأخر عن الأداء',
    status_suspended: 'معلق',
    status_archived: 'مؤرشف',

    // Action Buttons (Exact terms requested by user)
    action_record_payment: 'استخلاص الاشتراك',
    action_new_installation: 'تركيب جديد',
    action_edit: 'تعديل',
    action_delete: 'حذف',
    action_send_whatsapp: 'إرسال تذكير واتساب',
    action_open_ticket: 'فتح تذكرة صيانة',

    // Search & Filters (Exact terms requested by user)
    dir_search_placeholder: 'بحث بالاسم، الهاتف، الماك أو PPPoE...',
    filter_all_neighborhoods: 'جميع الأحياء',
    urgent_badge_accounts: 'حسابات مستعجلة',

    // Ticket & Field Management Terms (Exact terms requested by user)
    ticket_status_open: 'مفتوح',
    ticket_status_in_progress: 'قيد المعالجة',
    ticket_status_resolved: 'محلول',

    // FieldTech
    fieldtech_title: 'يونس واي فاي الميداني',
    fieldtech_subtitle: 'التدخلات الميدانية والتشخيص السريع',
    role_rooftop: 'تثبيت الأسطح وإعداد الراوتر',
    role_antenna: 'توجيه الهوائيات وتشخيص الترددات',
    pending: 'قيد الانتظار',
    done_today: 'أُنجزت اليوم',
    tab_active_tasks: 'مهام قيد الإنجاز',
    tab_resolved: 'تم الإصلاح',
    empty_tasks_title: 'لا توجد مهام في هذه القائمة',
    empty_tasks_msg: 'عمل رائع يا {name}! تم حل جميع تذاكر التدخل المسندة إليك.',
    empty_resolved_msg: 'لم يتم تسجيل أي تذاكر تم حلها اليوم بعد.',
    call: 'اتصال',
    directions: 'خرائط جوجل',
    mark_resolved: 'تم الحل',
    reopen_task: 'إعادة فتح المهمة',
    start_task: 'بدء التدخل',
    telemetry_title: 'بيانات العتاد ومعلومات الاتصال',
    antenna_model: 'الهوائي / CPE',
    antenna_mac: 'عنوان MAC للهوائي',
    pppoe_account: 'حساب PPPoE',
    wifi_ssid: 'اسم شبكة الواي فاي',
    resolution_modal_title: 'تأكيد حل تذكرة التدخل',
    resolution_modal_sub: 'سجل تفاصيل الإجراء الميداني قبل إغلاق التذكرة',
    resolution_action_label: 'الإجراء المتخذ ميدانياً',
    resolution_default_note: 'تم حل المشكل ميدانياً والتحقق من الأسلاك وقوة إشارة الراديو والسرعة.',
    completed_action: 'الإجراء المنجز:',
    client_contact: 'المشترك والعنوان',

    // Categories & Priorities
    cat_no_internet: 'انقطاع تام للإنترنت',
    cat_weak_signal: 'إشارة ضعيفة / بطء',
    cat_power_adapter: 'محول الطاقة PoE محترق',
    cat_new_installation: 'تركيب واشتراك جديد',
    cat_router_config: 'إعداد الراوتر / PPPoE',
    prio_urgent: 'أولوية عاجلة',
    prio_high: 'مرتفع',
    prio_normal: 'عادي',

    // Admin NOC & Navbar
    nav_brand: 'يونس واي فاي',
    nav_dashboard: "نظرة عامة",
    nav_clients: "المشتركون",
    nav_tickets: "التدخلات",
    nav_team: "الفريق",
    nav_fieldtech: "الفضاء الميداني",
    nav_reset_demo: 'إعادة ضبط البيانات التجريبية',
    nav_sign_out: 'تسجيل الخروج',
    reset_modal_title: 'إعادة ضبط ومسح البيانات التجريبية؟',
    reset_modal_desc: 'سيؤدي هذا إلى مسح جميع المشتركين والتذاكر وسجلات الأداء من التخزين والبدء من جديد بحالة نظيفة.',
    reset_modal_confirm: 'نعم، مسح وإعادة الضبط',

    // Dashboard NOC
    dash_title: "شبكتك في لمحة",
    dash_subtitle: "تابع المشتركين والمدفوعات والتدخلات في تطوان.",
    dash_record_payment: "استخلاص",
    dash_new_installation: "مشترك جديد",
    dash_new_ticket: "إنشاء تذكرة",
    metric_active_subs: "المشتركون النشطون",
    metric_monthly_revenue: "تحصيل هذا الشهر",
    metric_today_revenue: 'مداخيل اليوم',
    metric_overdue_uncollected: "المتأخرات",
    metric_open_tickets: "التذاكر المفتوحة",
    connected_label: 'متصلون',
    overdue_label: 'متأخرون',
    urgent_center_title: "يتطلب المتابعة",
    urgent_center_subtitle: "الاشتراكات المتأخرة أو المستحقة خلال 3 أيام.",
    all_accounts_up_to_date: 'جميع الحسابات محدثة ومسواة!',
    all_accounts_up_to_date_sub: 'لا يوجد أي مشترك متأخر أو ينتهي اشتراكه خلال الأيام الـ 3 القادمة.',
    no_subscribers_registered: 'لم يتم تسجيل أي مشتركين بعد',
    no_subscribers_registered_sub: 'قاعدة بيانات المشتركين فارغة حالياً. ابدأ بتسجيل أول مشترك في تطوان لمتابعة الفوترة وحالة الاتصال.',
    register_first_client: 'تسجيل أول مشترك',
    recent_payments_title: "الدفعات الأخيرة",
    recent_payments_subtitle: 'عمليات الأداء الموثقة وتمديد الاشتراك لـ 30 يوماً',
    no_payments_found: 'لا توجد سجلات أداء سابقة',
    no_payments_found_sub: 'عمليات الأداء المسجلة بالإدارة أو الميدان ستظهر هنا فور تسجيلها.',
    infrastructure_title: 'البنية التحتية اللاسلكية (تطوان)',
    infrastructure_subtitle: 'أبراج الترحيل وحالة قطاعات التغطية',
    bandwidth_consumption: 'استهلاك صبيب الإنترنت',

    // Client Directory
    dir_title: "المشتركون",
    dir_subtitle: "اعثر على كل مشترك وإعدادات شبكته.",
    no_clients_found: 'لا يوجد مشتركون مسجلون',
    no_clients_match_filters: 'لا يوجد مشتركون يطابقون خيارات البحث المحددة.',

    // Tickets
    tickets_title: "التدخلات",
    tickets_subtitle: "نظّم الطلبات ونسّق عمل فريقك الميداني.",
    create_ticket_btn: 'إنشاء تذكرة تدخل',
    all_clear_title: 'الوضع مستقر — لا توجد أي تذاكر أعطال نشطة',
    all_clear_subtitle: 'لا توجد أي بلاغات انقطاع أو مهام تصليح معلقة حالياً في قطاعات تطوان.',
    no_tickets_found: 'لم يتم العثور على أي تذاكر صيانة',
    col_open: 'مفتوحة وموجهة للميدان',
    col_in_progress: 'قيد الإنجاز (التقني)',
    col_resolved: 'تم الإصلاح والتحقق',

    // Delete & Edit Modals
    delete_modal_title: 'حذف المشترك نهائياً',
    delete_modal_sub: 'إجراء لا رجعة فيه • تنظيف تلقائي تسلسلي',
    delete_modal_confirm_msg: 'هل أنت متأكد من رغبتك في حذف المشترك {name} نهائياً؟ سيؤدي هذا الإجراء أيضاً إلى حذف سجل الأداءات والتذاكر المرتبطة به.',
    delete_modal_cascade_warning: 'وفقاً لقاعدة الحذف المتسلسل (CASCADE)، سيتم مسح كافة البيانات المرتبطة من قاعدة البيانات فوراً وبشكل نهائي.',
    delete_confirm_btn: 'تأكيد الحذف النهائي',
    deleting_in_progress: 'جاري الحذف...',
    delete_success_toast: 'تم حذف المشترك "{name}" وكافة سجلاته المرتبطة بنجاح.',
    delete_error_toast: 'حدث خطأ أثناء محاولة حذف المشترك "{name}".',
    payment_history_count_label: 'سجل الأداءات:',
    tickets_count_label: 'تذاكر التدخل:',

    // Payment Recording Modal
    record_payment_modal_title: 'استخلاص الاشتراك الشهري وإصدار الوصل',
    record_payment_modal_sub: 'واجب اشتراك مرن، مصاريف إضافية وحساب مفصل للوصل',
    select_subscriber: 'اختر المشترك',
    base_fee_label: 'الواجب الشهري الأساسي',
    base_fee_desc: 'تعديل أو تخصيص المبلغ الشهري للاتفاقيات الخاصة',
    base_fee_default_badge: 'افتراضي: 100 درهم',
    update_permanent_rate_label: 'تحديث الواجب الشهري الدائم للمشترك إلى {amount} درهم للأشهر القادمة',
    extra_fees_label: 'مصاريف إضافية وتعديلات',
    extra_fees_toggle: 'إضافة مصاريف إضافية (كابل، صيانة، تأخير...)',
    extra_fees_desc: 'تفصيل المصاريف الإضافية في وصل الأداء',
    extra_amount_label: 'مبلغ المصاريف الإضافية',
    extra_reason_label: 'سبب المصاريف الإضافية',
    payment_method_label: 'طريقة الأداء',
    payment_method_cash: 'نقداً (كاش)',
    payment_method_bank: 'تحويل بنكي (CIH / التجاري وفا)',
    payment_method_check: 'شيك بنكي',
    payment_method_card: 'بطاقة بنكية',
    payment_date_label: 'تاريخ الأداء',
    extend_period_label: 'تمديد مدة الاشتراك بـ',
    days_count_label: '{days} يوماً (شهر كامل)',
    notes_label: 'ملاحظات أو تفاصيل إضافية',
    notes_placeholder: 'ملاحظات اختيارية...',
    new_due_date_preview_label: 'تاريخ الأجل الجديد المحسوب:',
    confirm_record_payment_btn: 'تأكيد الاستخلاص وإصدار وصل الأداء',
    total_to_collect: 'المجموع الواجب أداؤه:',

    // Client Detail Modal
    tab_general: 'عام',
    tab_hardware: 'العتاد والشبكة',
    tab_history: 'سجل الأداءات',
    edit_rate_btn: 'تعديل السعر',
    custom_rate_badge: 'سعر مخصص',
    rate_updated_success_msg: 'تم تحديث السعر بنجاح',
    view_slip_btn: 'معاينة الوصل',
    archive_client_btn: 'أرشفة المشترك',
    delete_client_btn: 'حذف المشترك',
    call_client: 'اتصال',
    open_maps: 'خرائط جوجل',

    // Monthly Reconciliation & Ledger
    reconciliation_title: "متابعة الأداء الشهري",
    financial_month_label: 'الشهر المالي:',
    future_month_badge: 'شهر مستقبلي • تتبع الدفعات المسبقة',
    current_active_month: 'الشهر الحالي النشط',
    past_archive_badge: 'أرشيف سابق',
    reconciliation_future_desc: 'رصد الدفعات المسبقة، تقدير المداخيل المرتقبة، ومتابعة الاشتراكات المستحقة للتجديد مسبقاً',
    reconciliation_active_desc: 'كشف الحساب الشهري، رصد غير المؤدين، والتحقق التلقائي من تسوية اشتراكات كل شهر',
    total_advance_collected: 'إجمالي الدفعات المسبقة (Paiements d’avance)',
    total_month_collected: 'إجمالي المحصل للشهر (Encaissé)',
    total_paid_subs: 'إجمالي الاشتراكات المؤداة (Payés)',
    projected_revenue_label: 'المداخيل المتوقعة للتحصيل (Revenu projeté)',
    unpaid_due_label: 'المتخلفون عن الأداء / قيد التحصيل',
    collection_rate_label: 'نسبة التحصيل (Collection Rate)',
    advance_coverage_label: 'نسبة التغطية المسبقة (Couverture anticipée)',
    filter_all_subs: 'جميع الاشتراكات',
    filter_advance_paid: 'دفعات مسبقة',
    filter_paid: 'المؤدون',
    filter_due_renewal: 'مستحق للتجديد',
    filter_unpaid: 'غير المؤدين',
    send_advance_reminder: 'تذكير مسبق',
    send_whatsapp_reminder: 'تذكير واتساب',
    record_advance_payment: 'أداء مسبق',
    payment_slip: 'وصل الأداء',
    export_bilan_csv_btn: 'تصدير الكشف (CSV)',

    // Technician & Field Additions
    assigned_tasks_badge: 'المهام المعينة',
    offline_mode_banner: 'وضع عدم الاتصال (شبكة 4G غير متوفرة)',
    saved_locally: 'محفوظ محلياً',
    quick_notes_label: 'ملاحظات سريعة بنقرة واحدة:',
    resolution_placeholder: 'مثال: استبدال موصل RJ45، إعادة تشغيل محول PoE، الإشارة -61 dBm...',
    preset_note_rj45: 'استبدال موصل RJ45',
    preset_note_poe: 'إعادة تشغيل محول PoE',
    preset_note_realign: 'إعادة توجيه اللاقط (-61 dBm)',
    preset_note_cable: 'تمديد كابل Cat6 جديد',
    preset_note_pppoe: 'إعادة ضبط حساب PPPoE',
    field_intervention_in_progress: 'تدخل ميداني قيد التنفيذ حالياً.',

    // Payment Modal Additions
    record_payment_subtitle: 'اشتراك شهري مرن، مصاريف إضافية واحتساب مفصل للوصل',
    target_billing_month: 'شهر الفوترة المستهدف:',
    advance_payment_badge: '✨ دفعة مسبقة (Avance)',
    monthly_reconciliation_badge: 'تسوية شهرية',
    no_subscribers_title: 'لا يوجد مشتركون مسجلون',
    no_subscribers_desc: 'يجب تسجيل مشترك واحد على الأقل قبل تسجيل عملية استخلاص.',
    base_fee_title: 'الواجب الشهري الأساسي',
    base_fee_hint: 'تعديل أو تخصيص الواجب الشهري للاتفاقيات الخاصة',
    update_permanent_rate_checkbox: 'تحديث الواجب الشهري الدائم للمشترك إلى {amount} درهم للأشهر القادمة',
    extra_fees_title: 'مصاريف إضافية / تعديلات (Frais Supplémentaires)',
    extra_fees_subtitle: 'غرامات تأخير، استبدال عتاد، ترقية صبيب أو أيام إضافية',
    btn_remove: 'إزالة',
    btn_add_extra: 'إضافة مصاريف',
    itemized_calculation_title: 'احتساب مفصل للوصل',
    auto_calculated_badge: 'حساب تلقائي',
    base_subscription_item: 'الاشتراك الشهري الأساسي:',
    extra_charges_item: 'المصاريف الإضافية:',
    total_due_collect: 'المجموع الإجمالي الواجب استخلاصه',
    current_due_label: 'الأجل الحالي:',
    new_renewal_preview: 'تاريخ التجديد الجديد (+{days} يوم):',
    payment_channel_label: 'طريقة / قناة الأداء',
    method_cash_name: 'نقداً (كاش)',
    method_cash_sub: 'تسليم يدوي',
    method_cih_name: 'تطبيق CIH بنك',
    method_cih_sub: 'تحويل فوري',
    method_bank_name: 'تحويل بنكي',
    method_bank_sub: 'التجاري وفا / بنك إفريقيا',
    method_agency_name: 'وفاكاش / كاش بلوس',
    method_agency_sub: 'وكالة تحويل أموال',
    confirm_payment_btn_text: 'تأكيد استخلاص ({amount} درهم)',
    custom_extra_placeholder: 'حدد السبب (مثال: تركيب نقطة اتصال ثانية)...',
    preset_fee_late: 'غرامة تأخير الأداء',
    preset_fee_prorated: 'أيام إضافية بنسبة تناسبية',
    preset_fee_hardware: 'استبدال كابل / محول طاقة',
    preset_fee_boost: 'رفع مؤقت لسرعة الصبيب',
    preset_fee_maintenance: 'صيانة وتدخل تقني',
    preset_fee_custom: 'تعديل مخصص',

    // Client Details Modal Additions
    plan_and_rate_title: 'الاشتراك والواجب الشهري',
    billing_due_date_title: 'أجل استحقاق الفاتورة',
    installation_date_title: 'تاريخ التركيب',
    last_paid_label: 'آخر أداء:',
    days_overdue_text: 'متأخر بـ {days} يوماً',
    due_in_days_text: 'يستحق خلال {days} يوماً',
    archived_account_badge: 'حساب مؤرشف (معفى من المتأخرات)',
    wireless_link_title: 'الربط اللاسلكي وعتاد اللاقط CPE',
    signal_quality_label: 'مستوى جودة الإشارة',
    connected_sector_label: 'محطة البث / البرج المتصل',
    cpe_ip_label: 'عنوان IP لإدارة اللاقط',
    indoor_router_title: 'الروتر المنزلي ومصادقة PPPoE',
    indoor_router_model: 'طراز الروتر الداخلي',
    customer_wifi_ssid: 'اسم شبكة الواي فاي للزبون',
    pppoe_username_label: 'اسم مستخدم PPPoE',
    pppoe_password_label: 'كلمة مرور PPPoE',
    technician_notes_title: 'ملاحظات الفني:',
    payment_ledger_title: 'سجل عمليات الأداء السابقة ({count})',
    payment_ledger_sub: 'وصولات وفواتير مفصلة قابلة للطباعة',
    no_past_payments: 'لا توجد سجلات أداء مسجلة لهذا المشترك.',
    account_lifecycle_title: 'إدارة حالة المشترك والعمليات الإدارية',
    account_lifecycle_desc: 'يمكنك أرشفة المشترك عند إنهاء العقد لإيقاف احتساب الديون والمتأخرات التراكمية، أو حذفه نهائياً من قاعدة البيانات.',
    archived_subscriber_pill: 'مشترك مؤرشف',
    archived_subscriber_notice: 'المشترك في الأرشيف حالياً (معفى من المتأخرات)',
    archive_confirm_title: 'تأكيد أرشفة المشترك',
    archive_confirm_msg: 'هل أنت متأكد من رغبتك في أرشفة المشترك {name}؟ سيتم إيقاف احتساب الاشتراكات والمتأخرات التراكمية، واستبعاده من لوحة العمليات العاجلة مع الاحتفاظ بسجلاته.',
    archive_confirm_btn: 'تأكيد الأرشفة',
    delete_confirm_title: 'تحذير: حذف المشترك نهائياً',
    delete_confirm_permanent_warning: '⚠️ هذا الإجراء لا يمكن التراجع عنه وسيتم مسح بيانات المشترك بالكامل.',
    delete_confirm_action_btn: 'نعم، حذف نهائي',
    create_trouble_ticket_btn: 'فتح تذكرة صيانة',
    signal_excellent: 'ممتازة',
    signal_good: 'جيدة ومستقرة',
    signal_marginal: 'متوسطة',
    signal_poor: 'ضعيفة / انحراف التوجيه',

    // Navbar & Navigation Additions
    nav_operations_noc: 'عمليات الشبكة ومركز NOC',
    nav_theme_preferences: 'المظهر والتفضيلات',
    nav_quick_demo_switch: 'تبديل سريع (عرض تجريبي)',
    nav_main_navigation: 'التنقل الرئيسي',
    nav_display_language: 'لغة العرض',
    nav_manage_team_rbac: 'إدارة الفريق والصلاحيات',
    nav_add_techs_roles: 'إضافة تقنيين وتعيين الأدوار',
    nav_backup_export: 'تصدير نسخة احتياطية (JSON)',
    nav_backup_desc: 'حفظ قاعدة البيانات بالكامل',
    nav_payments_invoices: 'الأداءات والوصولات',
    nav_portal_noc: 'بوابة NOC',
    nav_field_mode: 'وضع الميدان',
    nav_active_session: 'الجلسة النشطة',

    // Automated Month Rollover & Simulation
    sim_bar_title: 'وضع الاختبار والمحاكاة الزمنية (تجديد الشهر التلقائي)',
    sim_active_badge: 'المحاكاة مفعلة',
    sim_exit_btn: 'إنهاء المحاكاة',
    sim_next_month_1st: 'فاتح الشهر القادم',
    sim_next_month_15th: '15 من الشهر القادم',
    sim_today_real: 'اليوم (الفعلي)',
    sim_custom_date: 'تاريخ مخصص',
    sim_banner_desc: 'محاكاة حلول الشهر الجديد: تصفير مداخيل الشهر، ونقل المشتركين غير المسوين إلى قائمة المتأخرات تلقائياً.',
    remind_all_unpaid_btn: 'تذكير جميع غير المؤدين',
    bulk_remind_modal_title: 'تذكير جماعي عبر واتساب',
    bulk_remind_modal_sub: 'إرسال رسائل تذكير مباشرة لجميع المشتركين غير المؤدين لهذا الشهر',
    bulk_copy_report_btn: 'نسخ التقرير الشامل',
    bulk_copied_toast: 'تم نسخ تقرير المتأخرات بنجاح',
    bulk_open_wa_btn: 'فتح واتساب',
    bulk_sent_badge: 'تم الإرسال',
    expected_monthly_label: 'المداخيل المتوقعة',
    arrears_real_time_label: 'المتأخرات الحية',
  },
};

export function getTranslation(
  lang: Language,
  key: keyof Translations,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.fr;
  let text = dict[key] || translations.en[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

// ─────────────────────────────────────────────────────────────
// DATABASE VALUE LOCALIZATION HELPERS
// (ترجمة القيم المخزنة في قاعدة البيانات تلقائياً حسب اللغة)
// ─────────────────────────────────────────────────────────────

/**
 * Localizes stored plan names (e.g. "Standard Wi-Fi Plan (100 MAD)", "Pack Éco", etc.)
 */
export function localizePlanName(planName?: string, lang: Language = 'fr'): string {
  if (!planName) return lang === 'ar' ? 'اشتراك قياسي' : lang === 'fr' ? 'Abonnement Standard' : 'Standard Plan';

  const normalized = planName.trim().toLowerCase();

  if (lang === 'ar') {
    if (normalized.includes('eco') || normalized.includes('éco') || normalized.includes('50')) {
      return 'باقة اقتصادية (50 درهم)';
    }
    if (normalized.includes('fiber') || normalized.includes('fibre') || normalized.includes('30 mbps')) {
      return '30 ميغابت ألياف هوائية';
    }
    if (normalized.includes('pro') || normalized.includes('150') || normalized.includes('200')) {
      return 'باقة احترافية عالية الصبيب';
    }
    if (normalized.includes('standard') || normalized.includes('100')) {
      return 'اشتراك واي فاي قياسي (100 درهم)';
    }
    // Generic fallback replacement for common patterns
    return planName
      .replace(/standard/gi, 'قياسي')
      .replace(/pack/gi, 'باقة')
      .replace(/plan/gi, 'اشتراك')
      .replace(/mad/gi, 'درهم')
      .replace(/dh/gi, 'درهم');
  }

  if (lang === 'fr') {
    if (normalized.includes('standard')) return 'Abonnement Wi-Fi Standard (100 DH)';
    if (normalized.includes('eco') || normalized.includes('éco')) return 'Pack Éco (50 DH)';
    if (normalized.includes('pro')) return 'Pack Pro Haute Vitesse';
    return planName;
  }

  return planName;
}

/**
 * Localizes subscriber status codes ('active', 'due_soon', 'overdue', 'suspended', 'archived')
 */
export function localizeStatus(status?: string, lang: Language = 'fr'): string {
  const s = (status || '').toLowerCase().trim();

  if (lang === 'ar') {
    switch (s) {
      case 'active':
        return 'نشط / مسوّى';
      case 'due_soon':
        return 'اقتراب الأجل';
      case 'overdue':
        return 'متأخر عن الأداء';
      case 'suspended':
        return 'معلق';
      case 'archived':
        return 'مؤرشف';
      default:
        return 'نشط / مسوّى';
    }
  }

  if (lang === 'fr') {
    switch (s) {
      case 'active':
        return 'Actif / À jour';
      case 'due_soon':
        return 'Échéance Proche';
      case 'overdue':
        return 'En Retard';
      case 'suspended':
        return 'Suspendu';
      case 'archived':
        return 'Archivé';
      default:
        return 'Actif';
    }
  }

  // English fallback
  switch (s) {
    case 'active':
      return 'Active / Paid';
    case 'due_soon':
      return 'Due Soon';
    case 'overdue':
      return 'Overdue';
    case 'suspended':
      return 'Suspended';
    case 'archived':
      return 'Archived';
    default:
      return 'Active';
  }
}

/**
 * Localizes ticket status codes ('open', 'in_progress', 'resolved')
 */
export function localizeTicketStatus(status?: string, lang: Language = 'fr'): string {
  const s = (status || '').toLowerCase().trim();

  if (lang === 'ar') {
    switch (s) {
      case 'open':
        return 'مفتوح';
      case 'in_progress':
        return 'قيد المعالجة';
      case 'resolved':
        return 'محلول';
      default:
        return 'مفتوح';
    }
  }

  if (lang === 'fr') {
    switch (s) {
      case 'open':
        return 'Ouvert';
      case 'in_progress':
        return 'En cours';
      case 'resolved':
        return 'Résolu';
      default:
        return 'Ouvert';
    }
  }

  switch (s) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    default:
      return 'Open';
  }
}

/**
 * Localizes ticket priority codes ('urgent', 'high', 'normal')
 */
export function localizeTicketPriority(priority?: string, lang: Language = 'fr'): string {
  const p = (priority || '').toLowerCase().trim();

  if (lang === 'ar') {
    switch (p) {
      case 'urgent':
        return 'أولوية عاجلة';
      case 'high':
        return 'مرتفع';
      case 'normal':
        return 'عادي';
      default:
        return 'عادي';
    }
  }

  if (lang === 'fr') {
    switch (p) {
      case 'urgent':
        return 'URGENT';
      case 'high':
        return 'Élevé';
      case 'normal':
        return 'Normal';
      default:
        return 'Normal';
    }
  }

  switch (p) {
    case 'urgent':
      return 'Urgent';
    case 'high':
      return 'High';
    case 'normal':
      return 'Normal';
    default:
      return 'Normal';
  }
}

/**
 * Localizes payment method values ('cash', 'bank_transfer', 'check', 'card')
 */
export function localizePaymentMethod(method?: string, lang: Language = 'fr'): string {
  const m = (method || '').toLowerCase().trim();

  if (lang === 'ar') {
    switch (m) {
      case 'cash':
        return 'نقداً (كاش)';
      case 'bank_transfer':
        return 'تحويل بنكي';
      case 'check':
        return 'شيك';
      case 'card':
        return 'بطاقة بنكية';
      default:
        return 'نقداً';
    }
  }

  if (lang === 'fr') {
    switch (m) {
      case 'cash':
        return 'Espèces';
      case 'bank_transfer':
        return 'Virement bancaire';
      case 'check':
        return 'Chèque';
      case 'card':
        return 'Carte bancaire';
      default:
        return 'Espèces';
    }
  }

  switch (m) {
    case 'cash':
      return 'Cash';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'check':
      return 'Check';
    case 'card':
      return 'Card';
    default:
      return 'Cash';
  }
}
