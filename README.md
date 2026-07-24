# Presets de Exames para e-SUS

Extensão Chrome Manifest V3 para criar e reutilizar grupos pessoais de exames na tela de solicitação de exame comum do e-SUS APS.

## O que ela faz

- adiciona grupos pessoais ao lado dos grupos nativos do e-SUS;
- inclui quatro presets iniciais editáveis: Rastreios USPSTF, Hiperdia e alto custo, Infecto e Hepatograma;
- captura a seleção atual do formulário como um novo preset;
- permite editar, reordenar, mesclar, duplicar e excluir presets;
- identifica exames pelo código SIGTAP e evita duplicatas;
- mostra nomes compactos na lista, com código, nome oficial e notas disponíveis no botão de informações;
- pesquisa pelo nome oficial e confirma automaticamente a opção correspondente ao código SIGTAP;
- funciona em domínios e-SUS autorizados individualmente pelo usuário.

A extensão **não** preenche justificativa, observações ou CID e **nunca** aciona o botão Salvar.

## Instalação manual

### Usando um ZIP de release

1. Baixe e extraia o ZIP da versão desejada na página de Releases.
2. Abra `chrome://extensions`.
3. Ative o **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e escolha a pasta extraída.
5. Abra o e-SUS, clique no ícone da extensão e selecione **Ativar neste e-SUS**.

### Desenvolvimento

Requer Node.js 20.12 ou superior.

```bash
npm install
npm run dev
```

Comandos úteis:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run zip
```

O build de produção fica em `.output/chrome-mv3` e o pacote em `.output/*.zip`.

## Como usar

1. Abra uma solicitação de **exame comum** no atendimento individual.
2. Na lateral do modal, abra um grupo em **Meus grupos de exames**.
3. Marque exames individualmente ou clique em **Adicionar todos**.
4. Confira o resumo de itens adicionados, existentes ou não encontrados.
5. Preencha a justificativa e salve manualmente no e-SUS.

Para criar um grupo, selecione os exames pelo fluxo normal do e-SUS e clique em **Salvar seleção atual como preset**.

## Privacidade e segurança

- Os presets são armazenados em `chrome.storage.local` e permanecem somente neste navegador.
- Nenhum nome, CPF, prontuário, idade, texto clínico ou outro dado de paciente é armazenado ou transmitido.
- Não há analytics, telemetria, sincronização em nuvem nem código remoto.
- A extensão solicita acesso apenas aos domínios HTTPS ativados explicitamente pelo usuário.
- A integração usa o DOM visível e não acessa APIs internas, estado React ou GraphQL do e-SUS.
- A interface e o armazenamento executam em mundo isolado. Uma ponte mínima no mundo da página recebe somente um código SIGTAP e confirma o clique na opção correspondente, sem ler dados clínicos.

## Critérios clínicos

As faixas e observações dos presets iniciais são notas informativas. Elas não filtram pacientes, não selecionam exames automaticamente por idade/sexo e não substituem julgamento profissional. As fontes e a data de revisão ficam associadas aos presets relevantes.

## Compatibilidade

A versão inicial foi validada contra a tela React de solicitação de exame comum do e-SUS APS utilizada em Jaguariúna. Quando os elementos semânticos esperados não são encontrados, a extensão interrompe a integração em vez de tentar seletores posicionais.

Na atualização do armazenamento para a versão 4, o grupo padrão Sorologias passa a se chamar Infecto, recebe o BAAR antes separado em Investigação de tuberculose e incorpora as novas sorologias. A migração preserva notas e exames pessoais adicionados aos grupos. O grupo Hepatograma é incluído com os códigos e termos de busca conferidos no catálogo exibido pelo PEC de Jaguariúna em 23/07/2026.

## Licença

[MIT](LICENSE)
