'use client';

import { useDesignDocsT } from '../../i18n/DesignDocsI18nProvider';
import { visualizationRegistry } from '../../visualizations';
import DbTableMasterClient from './DbTableMasterClient';

const SECTION_KEYS: Record<string, string[]> = {
  // 사업기획서
  'business-overview': ['vision', 'product_tiers', 'why_now', 'core_problem'],
  'business-model': ['revenue_tiers', 'participants', 'lockin', 'pricing_strategy'],
  'target-market': ['segments', 'market_size', 'entry_strategy', 'competitive_landscape'],
  'roadmap': ['milestones', 'development_phases', 'investment_timeline'],
  // 차별화, 혁신
  'innovation-framework': ['market_frame', 'differentiation_principles', 'ai_13_features', 'pos_value', 'priority_interpretation', 'what_not_to_build', 'implementation_order', 'innovation_paradigms'],
  'platform-architecture': ['purpose', 'platform_principles', 'standard_layers', 'db_identifiers', 'project_specs', 'centralapi_hardening', 'platform_followups', 'shared_assets', 'full_stack_overview'],
  'superadmin-design': ['goal', 'confirmed_spec', 'platform_overview', 'multitenancy_model', 'core_identifiers', 'data_ownership', 'centralapi_implementation_status', 'remaining_followups'],
  'distributor-design': ['purpose', 'confirmed_spec', 'responsibility_position', 'management_scope', 'data_ownership', 'settings_inheritance', 'deployment'],
  'brandhq-design': ['goal', 'confirmed_spec', 'responsibility_flow', 'management_layers', 'data_ownership', 'settings_inheritance', 'deployment_sync'],
  'edgepos-architecture': ['decisions', 'directory_structure', 'layer_summary', 'posui_rules', 'cef_usecases', 'cross_layer_rules', 'mfc_migration', 'mandatory_requirements', 'communication_design', 'operational_gates', 'build_pipeline', 'platform_integration_followups'],
  'edgepos-az-guide': ['purpose', 'one_page_summary', 'overall_flow', 'points_a_to_j', 'platform_followups'],
  'edgepos-checklist': ['p0_layer_boundaries', 'p0_idempotency', 'p0_transaction', 'p0_failure_recovery', 'p0_operational', 'p1_browser', 'p1_performance', 'p1_contract', 'p1_observability', 'p1_qa', 'p1_deployment'],
  'feature-coverage-matrix': ['purpose', 'coverage_table', 'validation_results'],
  'superadmin-features': ['purpose', 'tenant_org_mgmt', 'license_deploy', 'policy_audit', 'monitoring', 'contract_mgmt', 'non_responsibility'],
  'distributor-features': ['purpose', 'territory_mgmt', 'brand_onboarding', 'contract_settlement', 'regional_dashboard', 'non_responsibility'],
  'brandhq-features': ['purpose', 'menu_catalog', 'branch_ops', 'org_employee', 'report_settlement', 'edgepos_link', 'non_responsibility'],
  'edgepos-features': ['purpose', 'stats_summary', 'table_floor', 'sales_payment', 'inventory_menu', 'customer', 'system_admin', 'external_bridge'],
  'screen-inventory': ['summary_table', 'pos_main', 'payment', 'order', 'table_reservation', 'delivery', 'customer', 'employee', 'stock', 'gift_point', 'payment_methods', 'receipt', 'table_order', 'kitchen', 'utility', 'flow_diagram'],
  'db-table-master': ['purpose', 'current_platform_count', 'legacy_count', 'structure'],
  'db-shared-reference': ['purpose', 'language_table', 'region_table', 'currency_table'],
  'db-superadmin-governance': ['purpose', 'superadmin_user', 'platform_license', 'platform_policy', 'audit_log'],
  'db-distributor-channel': ['purpose', 'distributor_profile', 'territory', 'distributor_contract', 'brand_assignment'],
  'db-brandhq-master': ['purpose', 'brand_profile', 'branch', 'brand_menu_category', 'brand_menu_item'],
  'db-edgepos-core': ['purpose', 'edge_pos_terminal', 'device', 'device_binding', 'local_setting'],
};

/** Markdown-to-JSX renderer — handles code blocks, trees, numbered lists, checklists, nested lists, tables, headings */
function renderMarkdown(md: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let keyIdx = 0;

  // Split into blocks, but preserve code blocks (``` ... ```) as single units
  const codeBlockRegex = /```[\s\S]*?```/g;
  const placeholders: string[] = [];
  const withPlaceholders = md.replace(codeBlockRegex, (match) => {
    placeholders.push(match);
    return `__CODE_BLOCK_${placeholders.length - 1}__`;
  });

  const blocks = withPlaceholders.split(/\n\n+/);

  blocks.forEach((rawBlock) => {
    const trimmed = rawBlock.trim();
    if (!trimmed) return;
    const k = keyIdx++;

    // Restore code block placeholder
    const codeMatch = trimmed.match(/^__CODE_BLOCK_(\d+)__$/);
    if (codeMatch) {
      const code = placeholders[parseInt(codeMatch[1])];
      const inner = code.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');

      // Check if it's a directory tree (contains ├── or └── or │)
      if (/[├└│──]/.test(inner)) {
        nodes.push(<DirectoryTree key={k} content={inner} />);
      } else {
        nodes.push(
          <pre key={k} className="my-4 rounded-xl bg-slate-900 p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed border border-slate-800">
            {inner}
          </pre>
        );
      }
      return;
    }

    // Heading
    if (/^#{1,4}\s/.test(trimmed)) {
      const level = trimmed.match(/^(#{1,4})/)?.[1]?.length ?? 3;
      const text = trimmed.replace(/^#{1,4}\s+/, '');
      const styles: Record<number, string> = {
        1: 'text-2xl font-bold text-gray-900 mt-8 mb-3',
        2: 'text-xl font-bold text-gray-800 mt-6 mb-2',
        3: 'text-lg font-semibold text-gray-700 mt-5 mb-2',
        4: 'text-base font-semibold text-gray-600 mt-4 mb-1.5',
      };
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
      nodes.push(<Tag key={k} className={styles[level] || styles[3]}>{renderInline(text)}</Tag>);
      return;
    }

    // Table
    if (trimmed.startsWith('|')) {
      const rows = trimmed.split('\n').filter((r) => r.trim().startsWith('|'));
      const parsedRows = rows
        .filter((r) => !/^\|[\s\-:|]+\|$/.test(r.trim()))
        .map((r) =>
          r.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map((c) => c.trim())
        );

      if (parsedRows.length > 0) {
        const [header, ...body] = parsedRows;
        nodes.push(
          <div key={k} className="overflow-x-auto my-4 rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {header.map((cell, ci) => (
                    <th key={ci} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 border-b border-gray-200">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2 text-[12px] text-gray-600 border-b border-gray-100">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        return;
      }
    }

    // Checklist (- [ ] or - [x])
    const lines = trimmed.split('\n');
    if (lines.some((l) => /^\s*-\s*\[[ x]\]\s/.test(l))) {
      nodes.push(
        <div key={k} className="my-3 space-y-1.5">
          {lines.map((l, li) => {
            const checked = /^\s*-\s*\[x\]/i.test(l);
            const text = l.replace(/^\s*-\s*\[[ x]\]\s*/i, '');
            return (
              <div key={li} className="flex items-start gap-2.5 group">
                <div className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                  {checked && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span className={`text-[12px] leading-relaxed ${checked ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                  {renderInline(text)}
                </span>
              </div>
            );
          })}
        </div>
      );
      return;
    }

    // Ordered list (1. 2. 3.)
    if (lines.every((l) => /^\s*\d+\.\s/.test(l))) {
      nodes.push(
        <ol key={k} className="my-3 space-y-2">
          {lines.map((l, li) => {
            const num = l.match(/^\s*(\d+)\./)?.[1] || String(li + 1);
            const text = l.replace(/^\s*\d+\.\s+/, '');
            return (
              <li key={li} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-primary-50 text-primary-500 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {num}
                </span>
                <span className="text-[12px] text-gray-600 leading-relaxed flex-1">{renderInline(text)}</span>
              </li>
            );
          })}
        </ol>
      );
      return;
    }

    // Unordered list (- or * items, possibly mixed with non-list lines)
    if (lines.some((l) => /^\s*[-*]\s/.test(l))) {
      const listItems: { indent: number; text: string }[] = [];
      const nonListBefore: string[] = [];
      let inList = false;

      for (const l of lines) {
        if (/^\s*[-*]\s/.test(l)) {
          inList = true;
          const indent = (l.match(/^(\s*)/)?.[1]?.length ?? 0) / 2;
          listItems.push({ indent, text: l.replace(/^\s*[-*]\s+/, '') });
        } else if (!inList) {
          nonListBefore.push(l);
        }
      }

      if (nonListBefore.length > 0) {
        nodes.push(
          <p key={k + '_pre'} className="text-[12px] text-gray-600 leading-relaxed my-2">
            {renderInline(nonListBefore.join('\n'))}
          </p>
        );
      }

      nodes.push(
        <ul key={k} className="my-3 space-y-1">
          {listItems.map((item, li) => (
            <li key={li} className="flex items-start gap-2 text-[12px] text-gray-600 leading-relaxed" style={{ paddingLeft: item.indent * 16 }}>
              <span className="text-gray-300 mt-1.5 shrink-0">•</span>
              <span>{renderInline(item.text)}</span>
            </li>
          ))}
        </ul>
      );
      return;
    }

    // Plain paragraph — handle inline \n as line breaks
    nodes.push(
      <p key={k} className="text-[12px] text-gray-600 leading-relaxed my-3">
        {renderInlineWithBreaks(trimmed)}
      </p>
    );
  });

  return nodes;
}

/** Directory tree visualization */
function DirectoryTree({ content }: { content: string }) {
  const lines = content.split('\n').filter((l) => l.trim());

  return (
    <div className="my-4 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 3.5C1 2.67 1.67 2 2.5 2h3l1.5 1.5H11.5c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5h-9C1.67 12.5 1 11.83 1 11V3.5z" stroke="#64748b" strokeWidth="1.2" />
        </svg>
        <span className="text-[10px] text-slate-500 font-semibold tracking-wide">DIRECTORY STRUCTURE</span>
      </div>
      <div className="p-4 font-mono text-[11px] leading-6 overflow-x-auto">
        {lines.map((line, i) => {
          const isDir = line.trimEnd().endsWith('/') || /[├└│].*\//.test(line);
          const commentMatch = line.match(/(#\s*.*)$/);
          const mainPart = commentMatch ? line.slice(0, line.indexOf(commentMatch[1])) : line;
          const comment = commentMatch?.[1];

          return (
            <div key={i} className="flex whitespace-pre">
              <span className={isDir ? 'text-cyan-400' : 'text-slate-400'}>{mainPart}</span>
              {comment && <span className="text-slate-600 ml-1">{comment}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Inline formatting: **bold**, `code`, _italic_ */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-700 border border-slate-200">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={i} className="italic text-gray-500">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

/** Inline formatting with line break support */
function renderInlineWithBreaks(text: string): React.ReactNode {
  const lines = text.split('\n');
  if (lines.length <= 1) return renderInline(text);

  return lines.map((line, i) => (
    <span key={i}>
      {renderInline(line)}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

export default function DocsPageClient({ slug }: { slug: string }) {
  // Specialised full-page renderers
  if (slug === 'db-table-master') {
    return <DbTableMasterClient />;
  }

  const { t } = useDesignDocsT();

  const jsonKey = slug.replace(/-/g, '_');

  const title = t(`docs.${jsonKey}.title`);
  const category = t(`docs.${jsonKey}.category`);
  const description = t(`docs.${jsonKey}.description`);

  // If the title key returns the key itself, the doc doesn't exist in translations
  const docExists = title !== `docs.${jsonKey}.title`;

  if (!docExists) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">{t('ui.not_found')}: {slug}</p>
      </div>
    );
  }

  const sectionKeys = SECTION_KEYS[slug] ?? [];

  // Collect sections that have content
  const sections = sectionKeys
    .map((sKey) => {
      const sTitle = t(`docs.${jsonKey}.sections.${sKey}.title`);
      const sContent = t(`docs.${jsonKey}.sections.${sKey}.content`);
      const titleMissing = sTitle === `docs.${jsonKey}.sections.${sKey}.title`;
      const contentMissing = sContent === `docs.${jsonKey}.sections.${sKey}.content`;
      return {
        key: sKey,
        title: titleMissing ? null : sTitle,
        content: contentMissing ? null : sContent,
      };
    })
    .filter((s) => s.title || s.content);

  const hasContent = sections.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2">
        <span className="text-xs font-semibold text-primary-500 tracking-wide uppercase">
          {category}
        </span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
      <p className="text-base text-gray-500 mb-8">{description}</p>

      {hasContent ? (
        <div className="space-y-8">
          {sections.map((section) => {
            const vizKey = `${slug}.${section.key}`;
            const VizComponent = visualizationRegistry[vizKey];

            return (
              <section key={section.key} className="bg-white rounded-2xl border border-gray-100 p-8">
                {section.title && (
                  <h2 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h2>
                )}
                {VizComponent && <VizComponent />}
                {section.content && (
                  <div>{renderMarkdown(section.content)}</div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">{t('ui.preparing')}</p>
          <p className="text-xs text-gray-300">{t('ui.preparing_desc')}</p>
        </div>
      )}
    </div>
  );
}
