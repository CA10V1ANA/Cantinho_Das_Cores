"""Gera o texto do relatório a partir das partidas do período (regras fixas, sem IA)."""

def _fmt_time(sec):
    if sec is None: return "sem registro"
    sec = round(sec); m, s = divmod(sec, 60)
    return f"{m} min {s:02d} s" if m else f"{s} s"

def _fmt_date(d): return d.strftime("%d/%m/%Y")

def build_text(child_name, age, start, end, summary, games):
    head = f"Relatório pedagógico de {child_name} ({age} anos) — {_fmt_date(start)} a {_fmt_date(end)}."
    if summary["total_matches"] == 0:
        return head + "\n\nNão houve partidas registradas neste período."
    lines = [head, "",
        "Resumo geral",
        f"- Partidas jogadas: {summary['total_matches']} (concluídas: {summary['completed_matches']}, abandonadas: {summary['abandoned_matches']}, taxa de conclusão: {summary['completion_rate']}%).",
        "- Os indicadores abaixo consideram somente partidas concluídas."]
    if summary["completed_matches"]:
        lines += [f"- Pontuação média: {summary['average_score']:.0f}/100. Tempo médio por partida: {_fmt_time(summary['average_duration_seconds'])}.",
                  f"- Acertos: {summary['total_correct']}. Erros: {summary['total_errors']}."]
    else:
        lines.append("- Nenhuma partida foi concluída no período; ainda não há pontuação nem tempo médio.")
    lines += ["", "Desempenho por jogo"]
    played = [g for g in games if g["completed_matches"] > 0]
    for g in played:
        lines.append(f"- {g['name']} ({g['skill']}): {g['total_matches']} partida(s), {g['completed_matches']} concluída(s), "
                     f"pontuação média {g['average_score']:.0f}, tempo médio {_fmt_time(g['average_duration_seconds'])}.")
    unplayed = [g["name"] for g in games if g["total_matches"] == 0]
    only_abandoned = [g["name"] for g in games if g["total_matches"] > 0 and g["completed_matches"] == 0]
    if only_abandoned: lines.append(f"- Sem partida concluída no período: {', '.join(only_abandoned)}.")
    if unplayed: lines.append(f"- Ainda não jogados no período: {', '.join(unplayed)}.")
    lines += ["", "Observações"]
    if not played:
        lines.append("- Incentive a criança a terminar ao menos uma atividade para gerar indicadores de desempenho.")
        return "\n".join(lines)
    best = max(played, key=lambda g: g["average_score"]); worst = min(played, key=lambda g: g["average_score"])
    if len(played) > 1 and best["average_score"] != worst["average_score"]:
        lines.append(f"- Melhor desempenho: {best['name']} ({best['average_score']:.0f}). Merece mais atenção: {worst['name']} ({worst['average_score']:.0f}).")
    else:
        lines.append(f"- Desempenho em {best['name']}: pontuação média {best['average_score']:.0f}.")
    if summary["completion_rate"] < 50:
        lines.append("- Menos da metade das partidas foi concluída; vale acompanhar a criança e incentivar a terminar as atividades.")
    elif summary["completion_rate"] >= 80:
        lines.append("- Alta taxa de conclusão, o que indica bom engajamento com as atividades.")
    return "\n".join(lines)
