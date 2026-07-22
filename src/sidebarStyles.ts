export const SIDEBAR_STYLES = `
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
  .app { font-family: Arial, Helvetica, sans-serif; color: #263238; font-size: 13px; padding-top: 10px; }
  .title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
  h2 { font-size: 14px; margin: 0; }
  .hint { color: #607d8b; font-size: 11px; line-height: 1.35; margin: 0 0 8px; }
  .preset { border: 1px solid #cfd8dc; border-radius: 4px; background: #fff; margin-bottom: 7px; overflow: hidden; }
  .preset-head { display: flex; align-items: stretch; }
  .preset-toggle { flex: 1; text-align: left; border: 0; background: #fff; color: #263238; padding: 9px; font-weight: 600; cursor: pointer; }
  .preset-toggle:hover, .preset.open .preset-toggle { background: #e0f2f1; }
  button { font: inherit; }
  .icon-button { border: 0; background: transparent; color: #00695c; cursor: pointer; padding: 6px; }
  .body { border-top: 1px solid #e3e9eb; padding: 8px; }
  .exam { display: grid; grid-template-columns: 18px 1fr; gap: 6px; padding: 6px 0; border-bottom: 1px solid #eef2f3; }
  .exam:last-of-type { border-bottom: 0; }
  .exam label { cursor: pointer; line-height: 1.25; }
  .code { display: block; color: #607d8b; font-size: 10px; margin-top: 2px; }
  .note { display: block; color: #546e7a; font-size: 10px; margin-top: 3px; }
  .actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .primary, .secondary, .danger { border-radius: 4px; padding: 7px 9px; cursor: pointer; font-weight: 600; }
  .primary { border: 1px solid #00796b; background: #00796b; color: white; }
  .secondary { border: 1px solid #90a4ae; background: white; color: #37474f; }
  .danger { border: 1px solid #c62828; background: white; color: #b71c1c; }
  button:disabled { opacity: .55; cursor: default; }
  .status { border-radius: 4px; background: #eceff1; padding: 7px; margin: 8px 0; font-size: 11px; line-height: 1.4; }
  .status.error { background: #ffebee; color: #8e0000; }
  .capture { width: 100%; margin-top: 5px; }
  .overlay { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; background: rgba(18, 38, 45, .48); padding: 20px; }
  .modal { width: min(620px, 95vw); max-height: 85vh; overflow: auto; background: white; border-radius: 8px; box-shadow: 0 14px 45px rgba(0,0,0,.28); padding: 16px; }
  .modal h3 { margin: 0 0 12px; font-size: 17px; }
  .field { display: grid; gap: 4px; margin-bottom: 12px; font-weight: 600; }
  input[type=text], textarea { width: 100%; border: 1px solid #90a4ae; border-radius: 4px; padding: 7px; font: inherit; }
  textarea { min-height: 52px; resize: vertical; }
  .edit-item { border: 1px solid #e1e7e9; border-radius: 5px; padding: 8px; margin-bottom: 7px; }
  .edit-title { display: flex; justify-content: space-between; gap: 8px; font-weight: 600; }
  .edit-controls { display: flex; gap: 3px; white-space: nowrap; }
  .empty { color: #78909c; padding: 8px 0; }
  a { color: #00695c; }
`;
