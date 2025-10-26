import type { ActivityLog, ExportOptions, ExportResult } from '../api/activityTypes';

// =====================================================
// EXPORT UTILITIES
// CSV, Excel, and JSON export functionality
// =====================================================

// =====================================================
// CSV EXPORT
// =====================================================

export function exportToCSV(
  logs: ActivityLog[],
  options: ExportOptions = { format: 'csv' }
): ExportResult {
  console.log('📄 [exportToCSV] Exporting', logs.length, 'logs');

  try {
    // Define CSV headers
    const headers = [
      'ID',
      'Date/Time',
      'User',
      'User Email',
      'Company',
      'Action',
      'Category',
      'Entity Type',
      'Entity ID',
      'Description',
      'Status',
      'Severity',
      'IP Address',
      'Device',
      'Browser',
      'Session ID',
      'Duration (ms)',
      'Error Message',
    ];

    // Build CSV rows
    const rows = logs.map((log) => [
      log.id,
      new Date(log.created_at).toLocaleString(),
      log.user?.full_name || 'N/A',
      log.user?.email || 'N/A',
      log.company?.name || 'N/A',
      log.action,
      log.action_category || 'N/A',
      log.entity_type || 'N/A',
      log.entity_id || 'N/A',
      log.description || 'N/A',
      log.status,
      log.severity_level,
      log.ip_address || 'N/A',
      log.device_type || 'N/A',
      log.browser || 'N/A',
      log.session_id || 'N/A',
      log.duration_ms || 'N/A',
      log.error_message || 'N/A',
    ]);

    // Escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV content
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    // Create filename
    const filename =
      options.filename ||
      `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;

    // Create download
    downloadFile(csvContent, filename, 'text/csv');

    console.log('✅ [exportToCSV] Export successful');

    return {
      success: true,
      filename,
      format: 'csv',
      record_count: logs.length,
      file_size: new Blob([csvContent]).size,
    };
  } catch (error) {
    console.error('❌ [exportToCSV] Error:', error);
    throw error;
  }
}

// =====================================================
// EXCEL EXPORT (TSV format - Excel compatible)
// =====================================================

export function exportToExcel(
  logs: ActivityLog[],
  options: ExportOptions = { format: 'excel' }
): ExportResult {
  console.log('📊 [exportToExcel] Exporting', logs.length, 'logs');

  try {
    // Define headers
    const headers = [
      'ID',
      'Date/Time',
      'User',
      'User Email',
      'Company',
      'Company Email',
      'Country',
      'Action',
      'Category',
      'Entity Type',
      'Entity ID',
      'Description',
      'Status',
      'Severity',
      'IP Address',
      'Device',
      'Browser',
      'Session ID',
      'Duration (ms)',
      'Error Message',
      'Tags',
      'Changed Fields',
    ];

    // Build rows
    const rows = logs.map((log) => [
      log.id,
      new Date(log.created_at).toLocaleString(),
      log.user?.full_name || 'N/A',
      log.user?.email || 'N/A',
      log.company?.name || 'N/A',
      log.company?.email || 'N/A',
      log.company?.country || 'N/A',
      log.action,
      log.action_category || 'N/A',
      log.entity_type || 'N/A',
      log.entity_id || 'N/A',
      log.description || 'N/A',
      log.status,
      log.severity_level,
      log.ip_address || 'N/A',
      log.device_type || 'N/A',
      log.browser || 'N/A',
      log.session_id || 'N/A',
      log.duration_ms || 'N/A',
      log.error_message || 'N/A',
      log.tags ? log.tags.join(', ') : 'N/A',
      log.changed_data?.fields_changed
        ? log.changed_data.fields_changed.join(', ')
        : 'N/A',
    ]);

    // Escape TSV values
    const escapeTSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
    };

    // Build TSV content (Excel can open TSV files)
    const tsvContent = [
      headers.map(escapeTSV).join('\t'),
      ...rows.map((row) => row.map(escapeTSV).join('\t')),
    ].join('\n');

    // Create filename
    const filename =
      options.filename ||
      `activity-logs-${new Date().toISOString().split('T')[0]}.xls`;

    // Create download
    downloadFile(tsvContent, filename, 'application/vnd.ms-excel');

    console.log('✅ [exportToExcel] Export successful');

    return {
      success: true,
      filename,
      format: 'excel',
      record_count: logs.length,
      file_size: new Blob([tsvContent]).size,
    };
  } catch (error) {
    console.error('❌ [exportToExcel] Error:', error);
    throw error;
  }
}

// =====================================================
// JSON EXPORT
// =====================================================

export function exportToJSON(
  logs: ActivityLog[],
  options: ExportOptions = { format: 'json' }
): ExportResult {
  console.log('📝 [exportToJSON] Exporting', logs.length, 'logs');

  try {
    // Format logs for export
    const exportData = {
      export_date: new Date().toISOString(),
      record_count: logs.length,
      filters: options.filters || null,
      logs: logs.map((log) => ({
        id: log.id,
        timestamp: log.created_at,
        user: options.include_user_details
          ? log.user
          : {
              id: log.user_id,
              name: log.user?.full_name,
              email: log.user?.email,
            },
        company: options.include_company_details
          ? log.company
          : {
              id: log.company_id,
              name: log.company?.name,
            },
        action: {
          name: log.action,
          category: log.action_category,
          status: log.status,
          severity: log.severity_level,
        },
        entity: {
          type: log.entity_type,
          id: log.entity_id,
        },
        description: log.description,
        details: log.details,
        metadata: {
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          device_type: log.device_type,
          browser: log.browser,
          session_id: log.session_id,
          duration_ms: log.duration_ms,
          location: log.location_data,
        },
        changed_data: log.changed_data,
        error_message: log.error_message,
        tags: log.tags,
      })),
    };

    // Convert to JSON
    const jsonContent = JSON.stringify(exportData, null, 2);

    // Create filename
    const filename =
      options.filename ||
      `activity-logs-${new Date().toISOString().split('T')[0]}.json`;

    // Create download
    downloadFile(jsonContent, filename, 'application/json');

    console.log('✅ [exportToJSON] Export successful');

    return {
      success: true,
      filename,
      format: 'json',
      record_count: logs.length,
      file_size: new Blob([jsonContent]).size,
    };
  } catch (error) {
    console.error('❌ [exportToJSON] Error:', error);
    throw error;
  }
}

// =====================================================
// DOWNLOAD FILE HELPER
// =====================================================

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =====================================================
// EXPORT DISPATCHER
// =====================================================

export function exportActivityLogs(
  logs: ActivityLog[],
  options: ExportOptions
): ExportResult {
  console.log('📤 [exportActivityLogs] Starting export:', options.format);

  switch (options.format) {
    case 'csv':
      return exportToCSV(logs, options);
    case 'excel':
      return exportToExcel(logs, options);
    case 'json':
      return exportToJSON(logs, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// =====================================================
// EXPORT SUMMARY DATA
// =====================================================

export function exportSummaryToCSV(
  summary: {
    title: string;
    data: Array<{ label: string; value: any }>;
  },
  filename?: string
): void {
  console.log('📊 [exportSummaryToCSV] Exporting summary');

  const csvContent = [
    'Metric,Value',
    ...summary.data.map((item) => `"${item.label}","${item.value}"`),
  ].join('\n');

  const finalFilename =
    filename || `activity-summary-${new Date().toISOString().split('T')[0]}.csv`;

  downloadFile(csvContent, finalFilename, 'text/csv');

  console.log('✅ [exportSummaryToCSV] Export successful');
}

// =====================================================
// EXPORT ALL
// =====================================================

export default {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportActivityLogs,
  exportSummaryToCSV,
};

// =====================================================
// USAGE EXAMPLES:
// =====================================================

/*
import { exportActivityLogs } from './utils/exportUtils';

// Export as CSV
const result = exportActivityLogs(logs, {
  format: 'csv',
  filename: 'my-activity-logs.csv',
  include_user_details: true,
  include_company_details: true,
});

// Export as Excel
exportActivityLogs(logs, {
  format: 'excel',
  filters: { start_date: '2025-01-01', end_date: '2025-01-31' },
});

// Export as JSON
exportActivityLogs(logs, {
  format: 'json',
  include_user_details: true,
  include_company_details: true,
});

console.log('Exported', result.record_count, 'records to', result.filename);
*/