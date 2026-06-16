import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar, ThemeToggle],
  template: `
    <div class="plm-shell" [class.light-theme]="themeService.theme() === 'light'">
      <header class="topnav">
        <button class="logo" type="button" (click)="goToDashboard()">
          <span class="logo-icon">N</span>
          <span>NexaPLM</span>
        </button>

        <nav class="nav-tabs" aria-label="Primary navigation">
          <button class="nav-tab active" type="button">Workspace</button>
          <button class="nav-tab" type="button" (click)="goToItems()">Items</button>
          <button class="nav-tab" type="button">Changes</button>
          <button class="nav-tab" type="button">Regulatory</button>
          <button class="nav-tab" type="button">Reports</button>
        </nav>

        <div class="nav-right">
          <div class="client-logo">
            <span>Client</span>
            <div class="client-divider"></div>
            <strong>Strides</strong>
          </div>
          <button class="ai-btn" type="button">✦ AI Assistant</button>
          <app-theme-toggle></app-theme-toggle>
          <button class="icon-btn" type="button">⌕</button>
          <button class="icon-btn" type="button">⌂<span class="notif-dot"></span></button>
          <button class="icon-btn" type="button">↓</button>
          <button class="avatar" type="button">{{ initials }}</button>
        </div>
      </header>

      <div class="app-body">
        <app-sidebar></app-sidebar>

        <main class="main">
          <div class="view active">
            <div class="page-header-row">
              <div class="page-header">
                <h1>Welcome, Rahil</h1>
                <p>NexaPLM Pharma · NPI Process Overview · June 10, 2026</p>
              </div>
              <div class="page-actions">
                <button class="btn btn-secondary btn-sm" type="button">Import Data</button>
                <button class="btn btn-primary btn-sm" type="button" (click)="goToItems()">+ New Item</button>
              </div>
            </div>

            <div class="grid-4 stat-grid">
              <div class="stat-card">
                <div class="stat-label">Active NPIs</div>
                <div class="stat-value">7</div>
                <div class="stat-sub stat-up">↑ 2 this quarter</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Pending Approvals</div>
                <div class="stat-value yellow-text">5</div>
                <div class="stat-sub">Avg. 1.4 days waiting</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Items in Production</div>
                <div class="stat-value green-text">12</div>
                <div class="stat-sub stat-up">↑ 3 from last month</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Regulatory Filings</div>
                <div class="stat-value purple-text">3</div>
                <div class="stat-sub">IND · NDA · EMA-MAA</div>
              </div>
            </div>

            <div class="grid-2">
              <div class="card">
                <div class="section-title">⏳ Pending Approvals <span class="cnt">5</span></div>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Change</th><th>Type</th><th>Stage</th><th>Waiting</th><th></th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><button class="link-cell" type="button">ECO-001</button></td>
                        <td><span class="badge badge-blue">ECO</span></td>
                        <td><span class="badge badge-yellow">Review</span></td>
                        <td class="muted-cell">2d</td>
                        <td><button class="btn btn-sm btn-primary" type="button">Approve</button></td>
                      </tr>
                      <tr>
                        <td><button class="link-cell" type="button">ECO-002</button></td>
                        <td><span class="badge badge-blue">ECO</span></td>
                        <td><span class="badge badge-yellow">Review</span></td>
                        <td class="muted-cell">1d</td>
                        <td><button class="btn btn-sm btn-primary" type="button">Approve</button></td>
                      </tr>
                      <tr>
                        <td><button class="link-cell" type="button">DEV-004</button></td>
                        <td><span class="badge badge-red">Deviation</span></td>
                        <td><span class="badge badge-yellow">Approve</span></td>
                        <td class="muted-cell">4d</td>
                        <td><button class="btn btn-sm btn-secondary" type="button">Review</button></td>
                      </tr>
                      <tr>
                        <td><button class="link-cell" type="button">CAPA-002</button></td>
                        <td><span class="badge badge-purple">CAPA</span></td>
                        <td><span class="badge badge-blue">Approve</span></td>
                        <td class="muted-cell">6h</td>
                        <td><button class="btn btn-sm btn-secondary" type="button">Review</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="card">
                <div class="section-title">⚡ Recent Activity</div>
                <div class="activity-item">
                  <div class="activity-icon green-bg">✓</div>
                  <div class="activity-body">
                    <div class="activity-text"><strong>ECO-001A</strong> completed — Component COMP-001 released to Production</div>
                    <div class="activity-time">2 hours ago · Reviewer A</div>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon blue-bg">□</div>
                  <div class="activity-body">
                    <div class="activity-text"><strong>FG-001</strong> lifecycle promoted — Preliminary → Prototype</div>
                    <div class="activity-time">5 hours ago · System</div>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon purple-bg">✦</div>
                  <div class="activity-body">
                    <div class="activity-text"><strong>AI</strong> flagged missing validation protocol for DS-002</div>
                    <div class="activity-time">1 day ago · AI Assistant</div>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon yellow-bg">▤</div>
                  <div class="activity-body">
                    <div class="activity-text"><strong>IND-2026-001</strong> submitted to FDA — acknowledgement pending</div>
                    <div class="activity-time">2 days ago · Reg Affairs</div>
                  </div>
                </div>
              </div>
            </div>

            <hr class="divider">

            <div class="card npi-stage-card">
              <div class="section-title">🗺 NPI Stage Progress — Product-X (FG-001)</div>
              <div class="wf-bar">
                <div class="wf-step done">Concept<div class="wf-label">✓ Complete</div></div>
                <div class="wf-step done">Feasibility<div class="wf-label">✓ Complete</div></div>
                <div class="wf-step done">Development<div class="wf-label">✓ Complete</div></div>
                <div class="wf-step current">Clinical Pilot<div class="wf-label">⟳ In Progress</div></div>
                <div class="wf-step">Validation<div class="wf-label">Pending</div></div>
                <div class="wf-step">Registration<div class="wf-label">Pending</div></div>
                <div class="wf-step">Launch<div class="wf-label">Pending</div></div>
              </div>
              <div class="grid-3 npi-meta">
                <div>🗓 Target Launch: <strong>Q2 2027</strong></div>
                <div>📍 Current Phase: <strong class="yellow-text">Clinical Pilot</strong></div>
                <div>⚠️ At-Risk Items: <strong class="red-text">2</strong></div>
              </div>
            </div>

            <div class="grid-2">
              <div class="card ai-card">
                <div class="section-title"><span class="ai-gradient-text">✦ AI Insights</span></div>
                <div class="ai-insight spaced">
                  <div class="ai-insight-label">🔍 Risk Alert</div>
                  <div class="ai-insight-text">Validation protocol for Drug Substance DS-002 is missing. This may block ECO-002 release. Recommend creating VP-DS-002 document now.</div>
                  <div class="ai-chip-row">
                    <span class="ai-chip">Create Protocol</span>
                    <span class="ai-chip">Snooze</span>
                  </div>
                </div>
                <div class="ai-insight">
                  <div class="ai-insight-label">💡 Suggestion</div>
                  <div class="ai-insight-text">Based on your NPI timeline, COMP-003 should be released to Production before June 20 to avoid Clinical Pilot delay.</div>
                  <div class="ai-chip-row">
                    <span class="ai-chip">View COMP-003</span>
                    <span class="ai-chip">Create ECO</span>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="section-title">📊 Workspace Overview</div>
                <div class="progress-row">
                  <div class="progress-label"><span>NPI Completion</span><span>42%</span></div>
                  <div class="progress-bar"><div class="progress-fill accent-fill"></div></div>
                </div>
                <div class="progress-row">
                  <div class="progress-label"><span>Regulatory Readiness</span><span class="yellow-text">28%</span></div>
                  <div class="progress-bar"><div class="progress-fill yellow-fill"></div></div>
                </div>
                <div class="progress-row">
                  <div class="progress-label"><span>Quality Compliance</span><span class="green-text">85%</span></div>
                  <div class="progress-bar"><div class="progress-fill green-fill"></div></div>
                </div>
                <div>
                  <div class="progress-label"><span>Document Control</span><span class="purple-text">61%</span></div>
                  <div class="progress-bar"><div class="progress-fill purple-fill"></div></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; min-height: 100vh; }
    * { box-sizing: border-box; }
    button { font: inherit; }
    .plm-shell {
      --bg:#0d1117;--bg2:#161b22;--bg3:#21262d;--bg4:#30363d;
      --border:#30363d;--text:#e6edf3;--text2:#8b949e;--text3:#6e7681;
      --accent:#2f81f7;--accent2:#388bfd;--green:#3fb950;--yellow:#d29922;
      --red:#f85149;--purple:#bc8cff;--orange:#ffa657;--teal:#39d353;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .plm-shell.light-theme {
      --bg:#f5f7fa;--bg2:#ffffff;--bg3:#eef2f7;--bg4:#dfe5ec;
      --border:#d8dee7;--text:#172033;--text2:#59677c;--text3:#7b8798;
      --accent:#1f6feb;--accent2:#1158c7;--green:#1a7f37;--yellow:#9a6700;
      --red:#cf222e;--purple:#8250df;--orange:#bc4c00;--teal:#087f8c;
    }
    .topnav {
      position: sticky;
      top: 0;
      z-index: 200;
      display: flex;
      height: 52px;
      align-items: center;
      padding: 0 18px;
      border-bottom: 1px solid var(--border);
      background: var(--bg2);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 24px;
      border: 0;
      background: transparent;
      color: var(--accent);
      cursor: pointer;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -.3px;
    }
    .logo-icon {
      display: grid;
      width: 26px;
      height: 26px;
      place-items: center;
      border-radius: 7px;
      background: linear-gradient(135deg,#2f81f7,#bc8cff);
      color: #fff;
      font-size: 13px;
      font-weight: 900;
    }
    .nav-tabs { display: flex; flex: 1; gap: 2px; min-width: 0; }
    .nav-tab {
      height: 52px;
      padding: 0 13px;
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--text2);
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }
    .nav-tab:hover { background: var(--bg3); color: var(--text); }
    .nav-tab.active {
      border-bottom-color: var(--accent);
      background: rgba(47,129,247,.08);
      color: var(--accent);
    }
    .nav-right { display: flex; align-items: center; gap: 10px; }
    .client-logo {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-right: 4px;
      padding: 4px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: rgba(255,255,255,.04);
    }
    .client-logo span {
      color: var(--text3);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .05em;
      text-transform: uppercase;
    }
    .client-logo strong { color: var(--text); font-size: 13px; }
    .client-divider { width: 1px; height: 14px; background: var(--border); }
    .ai-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border: 1px solid rgba(188,140,255,.3);
      border-radius: 20px;
      background: linear-gradient(135deg,rgba(47,129,247,.15),rgba(188,140,255,.15));
      color: var(--purple);
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }
    .icon-btn {
      position: relative;
      display: grid;
      width: 30px;
      height: 30px;
      place-items: center;
      border: 1px solid var(--border);
      border-radius: 50%;
      background: var(--bg3);
      color: var(--text2);
      cursor: pointer;
      font-size: 14px;
    }
    .notif-dot {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 7px;
      height: 7px;
      border: 1.5px solid var(--bg2);
      border-radius: 50%;
      background: var(--red);
    }
    .avatar {
      display: grid;
      width: 30px;
      height: 30px;
      place-items: center;
      border: 0;
      border-radius: 50%;
      background: linear-gradient(135deg,#2f81f7,#bc8cff);
      color: #fff;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
    }
    .app-body { display: flex; min-height: calc(100vh - 52px); }
    .main { flex: 1; min-width: 0; overflow-y: auto; }
    .view { padding: 24px 28px; }
    .page-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .page-header h1 { margin: 0; font-size: 20px; font-weight: 700; }
    .page-header p { margin: 3px 0 0; color: var(--text2); font-size: 13px; }
    .page-actions { display: flex; gap: 8px; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: var(--accent2); }
    .btn-secondary { border-color: var(--border); background: var(--bg3); color: var(--text); }
    .btn-secondary:hover { background: var(--bg4); }
    .btn-sm { padding: 4px 10px; font-size: 12px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
    .stat-grid { margin-bottom: 18px; }
    .card {
      padding: 18px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--bg2);
    }
    .stat-card {
      padding: 16px 18px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg2);
    }
    .stat-label { margin-bottom: 5px; color: var(--text2); font-size: 11.5px; }
    .stat-value { font-size: 26px; font-weight: 700; line-height: 1; }
    .stat-sub { margin-top: 4px; color: var(--text3); font-size: 11px; }
    .stat-up { color: var(--green); }
    .green-text { color: var(--green) !important; }
    .yellow-text { color: var(--yellow) !important; }
    .red-text { color: var(--red) !important; }
    .purple-text { color: var(--purple) !important; }
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: var(--text);
      font-size: 12.5px;
      font-weight: 700;
    }
    .cnt {
      padding: 1px 6px;
      border-radius: 10px;
      background: var(--bg3);
      color: var(--text2);
      font-size: 10px;
    }
    .table-wrap { overflow: hidden; border: 1px solid var(--border); border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead { background: var(--bg3); }
    th {
      padding: 9px 13px;
      color: var(--text2);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .05em;
      text-align: left;
      text-transform: uppercase;
    }
    td { padding: 10px 13px; border-top: 1px solid var(--border); color: var(--text); vertical-align: middle; }
    tr:hover td { background: rgba(255,255,255,.02); }
    .link-cell {
      border: 0;
      background: transparent;
      color: var(--accent);
      cursor: pointer;
      font-weight: 600;
      padding: 0;
    }
    .muted-cell { color: var(--text2); }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 8px;
      border: 1px solid var(--border);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-green { border-color: rgba(63,185,80,.3); background: rgba(63,185,80,.15); color: var(--green); }
    .badge-yellow { border-color: rgba(210,153,34,.3); background: rgba(210,153,34,.15); color: var(--yellow); }
    .badge-red { border-color: rgba(248,81,73,.3); background: rgba(248,81,73,.15); color: var(--red); }
    .badge-blue { border-color: rgba(47,129,247,.3); background: rgba(47,129,247,.15); color: var(--accent); }
    .badge-purple { border-color: rgba(188,140,255,.3); background: rgba(188,140,255,.15); color: var(--purple); }
    .activity-item {
      display: flex;
      gap: 11px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }
    .activity-item:last-child { border-bottom: none; }
    .activity-icon {
      display: flex;
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
      border-radius: 50%;
      font-size: 13px;
    }
    .green-bg { background: rgba(63,185,80,.15); color: var(--green); }
    .blue-bg { background: rgba(47,129,247,.15); color: var(--accent); }
    .purple-bg { background: rgba(188,140,255,.15); color: var(--purple); }
    .yellow-bg { background: rgba(210,153,34,.15); color: var(--yellow); }
    .activity-body { flex: 1; }
    .activity-text { color: var(--text); font-size: 12.5px; line-height: 1.4; }
    .activity-time { margin-top: 2px; color: var(--text3); font-size: 11px; }
    .divider { margin: 18px 0; border: none; border-top: 1px solid var(--border); }
    .npi-stage-card { margin-bottom: 18px; }
    .wf-bar { display: flex; align-items: stretch; gap: 0; margin: 16px 0; overflow-x: auto; }
    .wf-step {
      position: relative;
      flex: 1;
      min-width: 90px;
      padding: 10px 14px;
      border: 1.5px solid var(--border);
      border-right: none;
      background: var(--bg3);
      color: var(--text2);
      cursor: pointer;
      font-size: 11.5px;
      font-weight: 600;
      text-align: center;
      transition: all .15s;
    }
    .wf-step:first-child { border-radius: 6px 0 0 6px; }
    .wf-step:last-child { border-right: 1.5px solid var(--border); border-radius: 0 6px 6px 0; }
    .wf-label { margin-top: 2px; color: var(--text3); font-size: 10px; }
    .wf-step.done {
      border-color: rgba(63,185,80,.35);
      background: rgba(63,185,80,.08);
      color: var(--green);
    }
    .wf-step.current {
      border-color: var(--yellow);
      background: rgba(210,153,34,.08);
      color: var(--yellow);
    }
    .npi-meta { margin-top: 12px; color: var(--text2); font-size: 12px; }
    .npi-meta strong { color: var(--text); }
    .ai-card { border-color: rgba(188,140,255,.2); }
    .ai-gradient-text {
      background: linear-gradient(135deg,#2f81f7,#bc8cff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .ai-insight {
      padding: 12px;
      border: 1px solid rgba(188,140,255,.2);
      border-radius: 8px;
      background: rgba(188,140,255,.06);
    }
    .ai-insight.spaced { margin-bottom: 8px; }
    .ai-insight-label {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 6px;
      color: var(--purple);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .05em;
      text-transform: uppercase;
    }
    .ai-insight-text { color: var(--text2); font-size: 12.5px; line-height: 1.5; }
    .ai-chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .ai-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border: 1px solid var(--border);
      border-radius: 20px;
      background: var(--bg3);
      color: var(--text);
      cursor: pointer;
      font-size: 11.5px;
    }
    .progress-row { margin-bottom: 12px; }
    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      color: var(--text2);
      font-size: 12px;
    }
    .progress-label span:last-child { color: var(--text); }
    .progress-bar { height: 6px; overflow: hidden; border-radius: 3px; background: var(--bg3); }
    .progress-fill { height: 100%; border-radius: 3px; }
    .accent-fill { width: 42%; background: var(--accent); }
    .yellow-fill { width: 28%; background: var(--yellow); }
    .green-fill { width: 85%; background: var(--green); }
    .purple-fill { width: 61%; background: var(--purple); }
    @media (max-width: 1180px) {
      .grid-4 { grid-template-columns: repeat(2,1fr); }
      .grid-2 { grid-template-columns: 1fr; }
      .client-logo { display: none; }
    }
    @media (max-width: 760px) {
      .nav-tabs, .ai-btn { display: none; }
      .view { padding: 18px; }
      .grid-4, .grid-3 { grid-template-columns: 1fr; }
      .page-header-row { flex-direction: column; gap: 12px; }
    }
  `,
})
export class Dashboard {
  readonly userService = inject(UserService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  get userName(): string {
    return this.userService.currentUser() || 'RS';
  }

  get initials(): string {
    return this.userName
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'RS';
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToItems() {
    this.router.navigate(['/items']);
  }
}
