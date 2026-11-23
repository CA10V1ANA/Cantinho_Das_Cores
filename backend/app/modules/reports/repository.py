from datetime import date, datetime
from app.core.database import connect, to_id

def _rec(r):
    sent = r["enviado_em"]
    return {"id": str(r["id_relatorio"]), "child_id": str(r["id_crianca"]), "child_name": r["apelido"],
            "period_start": date.fromisoformat(r["periodo_inicio"]), "period_end": date.fromisoformat(r["periodo_fim"]),
            "text": r["texto"], "generated_at": datetime.fromisoformat(r["gerado_em"]),
            "sent_at": datetime.fromisoformat(sent) if sent else None, "sent": sent is not None}

BASE = "SELECT r.*, c.apelido FROM relatorios r JOIN criancas c ON c.id_crianca=r.id_crianca"

def stats(owner_id, child_id, start, end):
    """Resumo e desempenho por jogo restritos ao intervalo [start, end] (datas inclusivas)."""
    args = [int(child_id), start.isoformat(), end.isoformat()]
    with connect() as db:
        r = db.execute("""SELECT COUNT(*) total, COALESCE(SUM(concluida),0) done,
            AVG(CASE WHEN concluida=1 THEN pontuacao END) score, AVG(CASE WHEN concluida=1 THEN duracao_seg END) dur,
            COALESCE(SUM(CASE WHEN concluida=1 THEN acertos END),0) ok,
            COALESCE(SUM(CASE WHEN concluida=1 THEN erros END),0) err FROM partidas
            WHERE id_crianca=? AND date(jogado_em) BETWEEN ? AND ?""", args).fetchone()
        rows = db.execute("""SELECT j.id_jogo, j.nome, j.habilidade, COUNT(p.id_partida) total, COALESCE(SUM(p.concluida),0) done,
            AVG(CASE WHEN p.concluida=1 THEN p.pontuacao END) score, AVG(CASE WHEN p.concluida=1 THEN p.duracao_seg END) dur FROM jogos j
            LEFT JOIN partidas p ON p.id_jogo=j.id_jogo AND p.id_crianca=? AND date(p.jogado_em) BETWEEN ? AND ?
            GROUP BY j.id_jogo ORDER BY j.id_jogo""", args).fetchall()
    total = r["total"]
    summary = {"total_matches": total, "completed_matches": r["done"], "abandoned_matches": total - r["done"], "completion_rate": round(r["done"] / total * 100) if total else 0,
               "average_score": r["score"], "average_duration_seconds": r["dur"], "total_correct": r["ok"], "total_errors": r["err"]}
    games = [{"game_id": g["id_jogo"], "name": g["nome"], "skill": g["habilidade"], "total_matches": g["total"],
              "completed_matches": g["done"], "average_score": g["score"], "average_duration_seconds": g["dur"]} for g in rows]
    return summary, games

def create(child_id, start, end, text):
    with connect() as db:
        cur = db.execute("INSERT INTO relatorios(id_crianca, periodo_inicio, periodo_fim, texto) VALUES (?,?,?,?)",
                         (int(child_id), start.isoformat(), end.isoformat(), text))
        return _rec(db.execute(BASE + " WHERE r.id_relatorio=?", (cur.lastrowid,)).fetchone())

def list_by_owner(owner_id, child_id=None, sent=None):
    sql = BASE + " JOIN responsaveis o ON o.id_responsavel=c.id_responsavel WHERE o.id_responsavel=?"; args = [int(owner_id)]
    if child_id is not None: sql += " AND r.id_crianca=?"; args.append(int(child_id))
    if sent is not None: sql += " AND r.enviado_em IS NOT NULL" if sent else " AND r.enviado_em IS NULL"
    sql += " ORDER BY r.gerado_em DESC, r.id_relatorio DESC"
    with connect() as db: return [_rec(r) for r in db.execute(sql, args).fetchall()]

def get_owned(report_id, owner_id):
    rid, oid = to_id(report_id), to_id(owner_id)
    if rid is None or oid is None: return None
    with connect() as db:
        r = db.execute(BASE + " WHERE r.id_relatorio=? AND c.id_responsavel=?", (rid, oid)).fetchone()
    return _rec(r) if r else None

def mark_sent(report_id):
    """Só marca se ainda não enviado; devolve True se atualizou."""
    with connect() as db:
        cur = db.execute("UPDATE relatorios SET enviado_em=CURRENT_TIMESTAMP WHERE id_relatorio=? AND enviado_em IS NULL", (int(report_id),))
        return cur.rowcount == 1
