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
  mobile: string;
  live: string;

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
  metric_overdue_uncollected: string;
  metric_open_tickets: string;
  connected_label: string;
  overdue_label: string;
  urgent_center_title: string;
  urgent_center_subtitle: string;
  urgent_badge_accounts: string;
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
  dir_search_placeholder: string;
  filter_all_neighborhoods: string;
  status_active: string;
  status_due_soon: string;
  status_overdue: string;
  status_suspended: string;
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
    mobile: 'Mobile',
    live: 'Live Real-Time',

    // FieldTech
    fieldtech_title: 'AtlasNet FieldTech',
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
    cat_power_adapter: 'PoE / Power Supply',
    cat_new_installation: 'New Subscriber Installation',
    cat_router_config: 'Router / PPPoE Config',
    prio_urgent: 'URGENT',
    prio_high: 'High',
    prio_normal: 'Normal',

    // Admin NOC & Navbar
    nav_brand: 'AtlasNet WISP',
    nav_dashboard: 'Operations NOC',
    nav_clients: 'Subscribers & CPE',
    nav_tickets: 'Support & Dispatch',
    nav_fieldtech: 'FieldTech View',
    nav_reset_demo: 'Reset Mock Seed Data',
    nav_sign_out: 'Sign Out',
    reset_modal_title: 'Reset Workspace & Wipe Mock Data?',
    reset_modal_desc: 'This will clear all clients, tickets, and payment records from localStorage and reset the workspace to a clean, empty state.',
    reset_modal_confirm: 'Yes, Wipe & Reset',

    // Dashboard NOC
    dash_title: 'Operations & Billing NOC',
    dash_subtitle: 'Monitoring Tétouan wireless distribution sectors, subscriber cash flow, and field technician dispatch.',
    dash_record_payment: 'Record Payment',
    dash_new_installation: 'New Installation',
    dash_new_ticket: 'New Ticket',
    metric_active_subs: 'Active Subscribers',
    metric_monthly_revenue: 'Monthly Revenue',
    metric_overdue_uncollected: 'Uncollected Overdue',
    metric_open_tickets: 'Open Support Tickets',
    connected_label: 'connected',
    overdue_label: 'overdue',
    urgent_center_title: 'Urgent Action Center — Billing & Collection Alerts',
    urgent_center_subtitle: 'Subscribers currently overdue or due within 3 days. Send 1-click bilingual WhatsApp reminders or log direct payments.',
    urgent_badge_accounts: 'Urgent Accounts',
    all_accounts_up_to_date: 'All Accounts Are Up to Date!',
    all_accounts_up_to_date_sub: 'No clients are overdue or due within the next 3 days.',
    no_subscribers_registered: 'No subscribers registered yet',
    no_subscribers_registered_sub: 'Your subscriber database is currently empty. Register a customer in Tétouan to track billing status.',
    register_first_client: 'Register First Client',
    recent_payments_title: 'Recent Payment Ledger',
    recent_payments_subtitle: 'Verified collection transactions & 30-day renewals',
    no_payments_found: 'No payment records found',
    no_payments_found_sub: 'Payments recorded in the system or on the field will appear here.',
    infrastructure_title: 'WISP Infrastructure (Tétouan)',
    infrastructure_subtitle: 'Tower relay stations & sector health',
    bandwidth_consumption: 'Bandwidth Consumption',

    // Client Directory
    dir_title: 'Subscriber & Hardware Directory',
    dir_subtitle: 'Filter by neighborhood, subscription health, antenna MAC, and provision new CPE hardware.',
    dir_search_placeholder: 'Search by Subscriber Name, Phone, MAC, or PPPoE...',
    filter_all_neighborhoods: 'All Neighborhoods',
    status_active: 'Active / Paid',
    status_due_soon: 'Due Soon',
    status_overdue: 'Overdue',
    status_suspended: 'Suspended',
    no_clients_found: 'No Subscribers Registered',
    no_clients_match_filters: 'No subscribers match the current filters.',

    // Tickets
    tickets_title: 'Support & Maintenance Tickets',
    tickets_subtitle: 'Real-time field technician task boards, repair logs, and incident tracking.',
    create_ticket_btn: 'Create Incident Ticket',
    all_clear_title: 'All Clear — Zero Active Incident Tickets',
    all_clear_subtitle: 'There are currently no open support requests or repair dispatches in Tétouan.',
    no_tickets_found: 'No support tickets found',
    col_open: 'Open & Dispatched',
    col_in_progress: 'In Progress (Field Tech)',
    col_resolved: 'Resolved & Verified',
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
    mobile: 'Mobile',
    live: 'Temps Réel Direct',

    // FieldTech
    fieldtech_title: 'AtlasNet FieldTech',
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
    nav_brand: 'AtlasNet WISP',
    nav_dashboard: 'NOC Opérations',
    nav_clients: 'Abonnés & CPE',
    nav_tickets: 'Support & Dispatch',
    nav_fieldtech: 'Vue FieldTech',
    nav_reset_demo: 'Réinitialiser les données démo',
    nav_sign_out: 'Déconnexion',
    reset_modal_title: 'Réinitialiser le système & vider les données ?',
    reset_modal_desc: 'Cette action efface tous les abonnés, tickets et journaux de paiement du stockage local pour repartir sur une base propre.',
    reset_modal_confirm: 'Oui, tout réinitialiser',

    // Dashboard NOC
    dash_title: 'NOC Opérations & Facturation',
    dash_subtitle: 'Surveillance des secteurs radio de Tétouan, trésorerie des abonnés et dispatch des techniciens terrain.',
    dash_record_payment: 'Encaisser Mensualité',
    dash_new_installation: 'Nouvelle Installation',
    dash_new_ticket: 'Nouveau Ticket',
    metric_active_subs: 'Abonnés Actifs',
    metric_monthly_revenue: 'Revenus Mensuels',
    metric_overdue_uncollected: 'Impayés / En Retard',
    metric_open_tickets: 'Tickets de Support Ouverts',
    connected_label: 'connectés',
    overdue_label: 'en retard',
    urgent_center_title: "Centre d'Action Urgente — Facturation & Recouvrement",
    urgent_center_subtitle: 'Abonnés en retard de paiement ou arrivant à échéance sous 3 jours. Rappels WhatsApp bilingues ou encaissement direct.',
    urgent_badge_accounts: 'Comptes Urgents',
    all_accounts_up_to_date: 'Tous les comptes sont à jour !',
    all_accounts_up_to_date_sub: 'Aucun abonné en retard ou arrivant à échéance sous 3 jours.',
    no_subscribers_registered: 'Aucun abonné enregistré pour le moment',
    no_subscribers_registered_sub: 'Votre base de données est propre et vide. Enregistrez votre premier client à Tétouan pour commencer le suivi.',
    register_first_client: 'Enregistrer Premier Client',
    recent_payments_title: 'Grand Livre des Règlements Récents',
    recent_payments_subtitle: 'Paiements validés & renouvellements 30 jours',
    no_payments_found: 'Aucun reçu de paiement enregistré',
    no_payments_found_sub: 'Les paiements enregistrés au bureau ou sur le terrain apparaîtront ici.',
    infrastructure_title: 'Infrastructure WISP (Tétouan)',
    infrastructure_subtitle: 'Stations relais pylônes & santé des secteurs',
    bandwidth_consumption: 'Consommation Bande Passante',

    // Client Directory
    dir_title: 'Répertoire Abonnés & Matériel CPE',
    dir_subtitle: 'Filtrer par quartier, état d’abonnement, adresse MAC antenne, et provisionner nouveaux équipements.',
    dir_search_placeholder: 'Rechercher par nom, téléphone, MAC ou PPPoE...',
    filter_all_neighborhoods: 'Tous les quartiers',
    status_active: 'Actif / Payé',
    status_due_soon: 'Échéance Proche',
    status_overdue: 'En Retard',
    status_suspended: 'Suspendu',
    no_clients_found: 'Aucun Abonné Enregistré',
    no_clients_match_filters: 'Aucun abonné ne correspond aux filtres sélectionnés.',

    // Tickets
    tickets_title: 'Tickets de Support & Maintenance',
    tickets_subtitle: 'Tableaux des techniciens terrain en temps réel, réparations et suivi d’incidents.',
    create_ticket_btn: 'Créer un Ticket Incident',
    all_clear_title: 'Rien à Signaler — Aucun Ticket d’Incident Actif',
    all_clear_subtitle: 'Aucune demande d’intervention ou panne actuellement signalée à Tétouan.',
    no_tickets_found: 'Aucun ticket de support trouvé',
    col_open: 'Ouverts & Assignés',
    col_in_progress: 'En Cours (Terrain)',
    col_resolved: 'Résolus & Validés',
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
    mobile: 'الجوال',
    live: 'مباشر وحي',

    // FieldTech (Exact translations matching instructions)
    fieldtech_title: 'أطلس نت الميداني',
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
    prio_urgent: 'عاجل جداً',
    prio_high: 'مرتفع',
    prio_normal: 'عادي',

    // Admin NOC & Navbar
    nav_brand: 'أطلس نت وايرلس',
    nav_dashboard: 'مركز العمليات NOC',
    nav_clients: 'المشتركون والعتاد',
    nav_tickets: 'الدعم والتوجيه',
    nav_fieldtech: 'واجهة التقني الميداني',
    nav_reset_demo: 'إعادة ضبط البيانات التجريبية',
    nav_sign_out: 'تسجيل الخروج',
    reset_modal_title: 'إعادة ضبط ومسح البيانات التجريبية؟',
    reset_modal_desc: 'سيؤدي هذا إلى مسح جميع المشتركين والتذاكر وسجلات الأداء من التخزين والبدء من جديد بحالة نظيفة.',
    reset_modal_confirm: 'نعم، مسح وإعادة الضبط',

    // Dashboard NOC
    dash_title: 'مركز العمليات والفوترة NOC',
    dash_subtitle: 'مراقبة قطاعات التوزيع اللاسلكي بتطوان، التدفقات النقدية للمشتركين وتوجيه التقنيين الميدانيين.',
    dash_record_payment: 'تسجيل دفعة شهرية',
    dash_new_installation: 'تسجيل مشترك جديد',
    dash_new_ticket: 'تذكرة عطل جديدة',
    metric_active_subs: 'المشتركون النشطون',
    metric_monthly_revenue: 'المداخيل الشهرية',
    metric_overdue_uncollected: 'المتأخرات غير المحصلة',
    metric_open_tickets: 'تذاكر الدعم المفتوحة',
    connected_label: 'متصلون',
    overdue_label: 'متأخرون',
    urgent_center_title: 'مركز الإجراءات العاجلة — تنبيهات الفوترة والتحصيل',
    urgent_center_subtitle: 'المشتركون المتأخرون عن الأداء أو الذين يحل موعد اشتراكهم خلال 3 أيام. إرسال تذكيرات واتساب أو تسجيل الدفع المباشر.',
    urgent_badge_accounts: 'حسابات مستعجلة',
    all_accounts_up_to_date: 'جميع الحسابات محدثة ومسواة!',
    all_accounts_up_to_date_sub: 'لا يوجد أي مشترك متأخر أو ينتهي اشتراكه خلال الأيام الـ 3 القادمة.',
    no_subscribers_registered: 'لم يتم تسجيل أي مشتركين بعد',
    no_subscribers_registered_sub: 'قاعدة بيانات المشتركين فارغة حالياً. ابدأ بتسجيل أول مشترك في تطوان لمتابعة الفوترة وحالة الاتصال.',
    register_first_client: 'تسجيل أول مشترك',
    recent_payments_title: 'سجل المقبوضات الأخير',
    recent_payments_subtitle: 'عمليات الأداء الموثقة وتمديد الاشتراك لـ 30 يوماً',
    no_payments_found: 'لا توجد سجلات أداء سابقة',
    no_payments_found_sub: 'عمليات الأداء المسجلة بالإدارة أو الميدان ستظهر هنا فور تسجيلها.',
    infrastructure_title: 'البنية التحتية اللاسلكية (تطوان)',
    infrastructure_subtitle: 'أبراج الترحيل وحالة قطاعات التغطية',
    bandwidth_consumption: 'استهلاك صبيب الإنترنت',

    // Client Directory
    dir_title: 'دليل المشتركين والعتاد الميداني',
    dir_subtitle: 'تصفية حسب الأحياء، سلامة الاشتراك، عنوان MAC، وإعداد أجهزة المشتركين الجديدة.',
    dir_search_placeholder: 'ابحث بالاسم، رقم الهاتف، عنوان MAC، أو اسم مستخدم PPPoE...',
    filter_all_neighborhoods: 'جميع الأحياء',
    status_active: 'نشط / مدفوع',
    status_due_soon: 'يقترب الأجل',
    status_overdue: 'متأخر عن الأداء',
    status_suspended: 'معلق الخدمة',
    no_clients_found: 'لا يوجد مشتركون مسجلون',
    no_clients_match_filters: 'لا يوجد مشتركون يطابقون خيارات البحث المحددة.',

    // Tickets
    tickets_title: 'تذاكر الدعم الفني والصيانة الميدانية',
    tickets_subtitle: 'لوحات مهام التقنيين في الوقت الفعلي، سجلات الإصلاح وتتبع التدخلات الميدانية.',
    create_ticket_btn: 'إنشاء تذكرة تدخل',
    all_clear_title: 'الوضع مستقر — لا توجد أي تذاكر أعطال نشطة',
    all_clear_subtitle: 'لا توجد أي بلاغات انقطاع أو مهام تصليح معلقة حالياً في قطاعات تطوان.',
    no_tickets_found: 'لم يتم العثور على أي تذاكر صيانة',
    col_open: 'مفتوحة وموجهة للميدان',
    col_in_progress: 'قيد الإنجاز (التقني)',
    col_resolved: 'تم الإصلاح والتحقق',
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
