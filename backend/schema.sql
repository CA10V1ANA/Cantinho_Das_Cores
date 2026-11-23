PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS responsaveis (
    id_responsavel INTEGER  PRIMARY KEY AUTOINCREMENT,
    email          TEXT     NOT NULL UNIQUE COLLATE NOCASE
                            CHECK(length(email) >= 6 AND instr(email, '@') > 1),
    senha          TEXT     NOT NULL CHECK(length(senha) >= 40),
    aceito_termo   INTEGER  NOT NULL CHECK(aceito_termo = 1),
    aceito_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS criancas (
    id_crianca     INTEGER  PRIMARY KEY AUTOINCREMENT,
    id_responsavel INTEGER  NOT NULL,
    apelido        TEXT     NOT NULL CHECK(length(trim(apelido)) > 0),
    idade          INTEGER  NOT NULL CHECK(idade BETWEEN 3 AND 18),
    voz_ativa      INTEGER  NOT NULL DEFAULT 1 CHECK(voz_ativa IN (0, 1)),
    criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_responsavel) REFERENCES responsaveis(id_responsavel) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jogos (
    id_jogo    TEXT NOT NULL PRIMARY KEY,
    nome       TEXT NOT NULL,
    habilidade TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS partidas (
    id_partida  INTEGER  PRIMARY KEY AUTOINCREMENT,
    id_crianca  INTEGER  NOT NULL,
    id_jogo     TEXT     NOT NULL,
    acertos     INTEGER  NOT NULL DEFAULT 0 CHECK(acertos BETWEEN 0 AND 5),
    erros       INTEGER  NOT NULL DEFAULT 0 CHECK(erros >= 0),
    duracao_seg INTEGER  CHECK(duracao_seg >= 0),
    pontuacao   INTEGER  NOT NULL DEFAULT 0 CHECK(pontuacao BETWEEN 0 AND 100),
    concluida   INTEGER  NOT NULL DEFAULT 0 CHECK(concluida IN (0, 1)),
    jogado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK(concluida = 0 OR acertos = 5),          -- só é "concluída" com 5 acertos
    FOREIGN KEY (id_crianca) REFERENCES criancas(id_crianca) ON DELETE CASCADE,
    FOREIGN KEY (id_jogo)    REFERENCES jogos(id_jogo)       ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS relatorios (
    id_relatorio   INTEGER  PRIMARY KEY AUTOINCREMENT,
    id_crianca     INTEGER  NOT NULL,
    periodo_inicio DATE     NOT NULL,
    periodo_fim    DATE     NOT NULL,
    texto          TEXT     NOT NULL CHECK(length(trim(texto)) > 0),
    gerado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enviado_em     DATETIME,
    CHECK(periodo_fim >= periodo_inicio),
    FOREIGN KEY (id_crianca) REFERENCES criancas(id_crianca) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_criancas_responsavel  ON criancas(id_responsavel);
CREATE INDEX IF NOT EXISTS idx_partidas_crianca_jogo ON partidas(id_crianca, id_jogo);
CREATE INDEX IF NOT EXISTS idx_relatorios_crianca    ON relatorios(id_crianca);

CREATE VIEW IF NOT EXISTS v_desempenho AS
SELECT c.id_crianca,
       c.apelido,
       c.idade,
       j.id_jogo,
       j.nome AS jogo,
       j.habilidade,
       COUNT(p.id_partida)        AS partidas_concluidas,
       ROUND(AVG(p.pontuacao))    AS pontuacao_media,
       SUM(p.erros)               AS total_erros,
       ROUND(AVG(p.duracao_seg))  AS tempo_medio_seg,
       MAX(p.jogado_em)           AS ultima_vez
FROM criancas c
CROSS JOIN jogos j
LEFT JOIN partidas p
       ON p.id_crianca = c.id_crianca AND p.id_jogo = j.id_jogo AND p.concluida = 1
GROUP BY c.id_crianca, j.id_jogo;

INSERT OR IGNORE INTO jogos (id_jogo, nome, habilidade) VALUES
    ('cores',    'Acerte a cor',      'Discriminação visual e atenção'),
    ('encaixe',  'Encaixe as formas', 'Coordenação motora e percepção espacial'),
    ('ligar',    'Ligue ao nome',     'Associação semântica e alfabetização'),
    ('corforma', 'Cor e forma',       'Atenção dupla e raciocínio lógico'),
    ('falar',    'Vamos falar',       'Consciência fonológica e estímulo da fala');
