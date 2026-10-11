# Lion Cell — Link temporário

Gera links **únicos e temporários** que embedam a loja
`https://liondistribuidora.com.br/`. Você envia o link ao cliente; ele tem só o
tempo definido para concluir a compra. Quando expira, a página vira uma tela de
**"tempo esgotado"**.

- Painel `/admin` protegido por senha para gerar os links.
- Duração personalizada por link (presets ou minutos).
- Contador regressivo visível sobre a loja.
- Reutilizável (pode recarregar) enquanto o tempo não acaba.
- Expiração automática via **Redis** (TTL nativo).

É **um único app** (Node + Express). O Redis é só um container de apoio.

## Como rodar (desenvolvimento)

```bash
# 1. Suba só o Redis via Docker
docker compose up -d redis

# 2. Configure o ambiente
cp .env.example .env
#   -> edite .env e defina ADMIN_PASSWORD com uma senha forte

# 3. Instale e rode
npm install
npm start
```

Acesse `http://localhost:3000/admin`, autentique com `ADMIN_USER` /
`ADMIN_PASSWORD`, escolha a duração e copie o link gerado (`/s/<token>`).

## Rodar tudo em Docker (produção simples)

```bash
cp .env.example .env   # defina ADMIN_PASSWORD e BASE_URL (domínio real)
docker compose up -d --build
```

O compose sobe o app + Redis juntos. Dentro da rede do compose o app já usa
`redis://redis:6379` automaticamente.

## Configuração (.env)

| Variável         | Descrição                                                        |
|------------------|------------------------------------------------------------------|
| `PORT`           | Porta do servidor (padrão 3000)                                  |
| `BASE_URL`       | URL pública base usada para montar os links (domínio real em prod) |
| `TARGET_URL`     | Site embedado (padrão: loja Lion Distribuidora)                  |
| `REDIS_URL`      | Conexão do Redis                                                 |
| `ADMIN_USER`     | Usuário do painel                                                |
| `ADMIN_PASSWORD` | Senha do painel — **troque!**                                    |
| `MIN_MINUTES`    | Duração mínima permitida ao gerar link                          |
| `MAX_MINUTES`    | Duração máxima permitida ao gerar link                          |

## Segurança

- Nunca versione o `.env` (já ignorado no `.gitignore`).
- Em produção rode atrás de **HTTPS** (proxy/reverse proxy com TLS): o Basic
  Auth trafega credenciais em cada request.
- Os tokens têm 128 bits (inadivinháveis) e expiram sozinhos no Redis.

## Observações sobre o iframe

A home da loja permite ser embedada. Se em algum momento uma página interna
(ex: checkout de um provedor terceirizado) bloquear iframe via
`X-Frame-Options`/CSP, o conteúdo dela pode não aparecer — nesse caso avalie
abrir o checkout em nova aba mantendo o cronômetro. A tela do cliente é
`src/templates.js` → `pageEmbed`.

## Endpoints

| Rota                | Descrição                                     |
|---------------------|-----------------------------------------------|
| `GET /admin`        | Painel (Basic Auth)                           |
| `POST /admin/create`| Gera o link (ação do formulário)              |
| `GET /s/:token`     | Link do cliente: loja + contador, ou expirado |
| `GET /healthz`      | Health check (ping no Redis)                  |
