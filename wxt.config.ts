import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Presets de Exames para e-SUS',
    short_name: 'Presets e-SUS',
    description: 'Crie e reutilize grupos pessoais de exames no e-SUS APS.',
    version: '0.1.1',
    permissions: ['storage', 'scripting', 'activeTab'],
    optional_host_permissions: ['https://*/*'],
  },
});
