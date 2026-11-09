# Sonhos RM Bags

Loja virtual da Sonhos RM Bags, com bolsas de luxo em crochê feitas à mão em Cambé/PR.

O site é estático, sem servidor e sem etapa de build. A cliente escolhe a bolsa, calcula o frete pelo CEP, preenche os dados e envia o pedido pronto para o WhatsApp da loja.

> **Atenção:** preços, frete e prazos ainda são exemplos. Veja a lista [Antes de divulgar](#antes-de-divulgar).

## Como publicar no GitHub Pages

1. No GitHub, crie um repositório, por exemplo `sonhos-rm-bags`. No plano gratuito, ele precisa ser público para usar o Pages.
2. Na página do repositório, clique em **Add file > Upload files**.
3. Arraste **o conteúdo desta pasta**, de forma que o `index.html` fique na raiz do repositório, e clique em **Commit changes**.
4. Vá em **Settings > Pages**.
5. Em **Source**, escolha **Deploy from a branch**. Em **Branch**, escolha `main` e a pasta `/ (root)`, e clique em **Save**.
6. Aguarde alguns minutos. O site ficará em `https://SEU-USUARIO.github.io/sonhos-rm-bags/`.

Se o arquivo `.nojekyll` ficar de fora do envio, o site funciona sem ele.

### Pela linha de comando

Com o repositório vazio já criado no GitHub, rode dentro desta pasta:

```bash
git init -b main
git add .
git commit -m "Primeira versão da loja"
git remote add origin https://github.com/SEU-USUARIO/sonhos-rm-bags.git
git push -u origin main
```

Depois, ative o Pages como nos passos 4 e 5.

## Como testar no computador

Para reproduzir melhor o comportamento do site publicado, use um servidor local. Rode na pasta do projeto:

```bash
npx serve .
```

## Estrutura

```text
index.html               Página e textos
assets/css/estilos.css   Estilos próprios
assets/js/loja.js        Configuração, sacola, frete e checkout
assets/img/              Fotos e logo
.nojekyll                Faz o GitHub Pages publicar os arquivos como estão
```

## O que editar

Preços, prazos e frete ficam no bloco `CONFIG`, no início de [`assets/js/loja.js`](assets/js/loja.js):

| Campo | O que faz |
|---|---|
| `produtos` | Nome, preço, descrição e detalhes de cada bolsa |
| `diasProducao` | Dias úteis para fazer a bolsa antes da postagem |
| `adicionalPorBolsa` | Acréscimo no frete por bolsa além da primeira |
| `regioes` | Valor e dias úteis de transporte por região |
| `documento` e `enderecoLoja` | CPF ou CNPJ e endereço exibidos no rodapé |
| `whatsapp` | Número que recebe os pedidos |
| `depoimentos` | Avaliações reais de clientes. Vazio, a seção fica oculta |

Exemplo de depoimento:

```js
depoimentos: [
  { texto: 'Amei a bolsa!', nome: 'Maria S.', cidade: 'Londrina/PR', estrelas: 5 }
],
```

Use somente depoimentos reais, com autorização de quem escreveu.

Os textos e os cards das bolsas ficam no `index.html`. Para adicionar um modelo, crie o card no HTML e a entrada correspondente em `produtos`, usando o mesmo identificador.

## Como o site funciona

- **Endereço por CEP:** consulta a [ViaCEP](https://viacep.com.br) e, como reserva, a [BrasilAPI](https://brasilapi.com.br). Ambas são abertas e não exigem chave.
- **Frete:** vem da tabela em `CONFIG`, sem cotação em tempo real.
- **Prazo:** soma os dias de produção e de transporte, sem contar fins de semana e feriados nacionais. Feriados estaduais e municipais não entram na conta.
- **Pagamento:** não acontece no site. A loja envia os dados pelo WhatsApp, e nenhum dado de cartão é digitado na página.
- **Sacola:** fica salva no navegador da própria cliente.
- **Tailwind:** é carregado pelo CDN. Para um site em produção, o recomendado é compilar o CSS.

## Antes de divulgar

- [ ] Preencher os preços reais das bolsas
- [ ] Preencher a tabela de frete e os prazos reais
- [ ] Confirmar as formas de pagamento (Pix e cartão)
- [ ] Adicionar avaliações reais em `depoimentos`, com autorização das clientes (opcional)
- [ ] Confirmar o nome "Bolsa Rosa"
- [ ] Preencher `documento` e `enderecoLoja`, exigidos para venda online pelo Decreto 7.962/2013
- [ ] Fazer um pedido de teste até o WhatsApp
